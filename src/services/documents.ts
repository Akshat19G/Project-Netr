import { get, set, del, keys, createStore } from "idb-keyval";
import type { DocAnalysis, DocCategory, SavedDocument } from "@/lib/types";

const store = createStore("netr-docs", "documents");

export const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024; // 25 MB

/** MIME types we allow on upload. Extensions are also checked for HEIC/RTF since some browsers report empty. */
export const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/rtf",
  "text/rtf",
  "text/plain",
  "text/csv",
  "application/zip",
  "application/x-zip-compressed",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const ALLOWED_EXT = new Set([
  "pdf","doc","docx","txt","rtf","jpg","jpeg","png","webp","heic","heif","csv","xlsx","xls","pptx","ppt","zip",
]);

export function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

export function validateFile(file: File): { ok: true } | { ok: false; reason: string } {
  const ext = extOf(file.name);
  if (!ALLOWED_MIME.has(file.type) && !ALLOWED_EXT.has(ext)) {
    return { ok: false, reason: `"${ext || file.type || "this file"}" isn't a supported format.` };
  }
  if (file.size > MAX_DOCUMENT_BYTES) return { ok: false, reason: "File is larger than 25 MB." };
  if (file.size === 0) return { ok: false, reason: "File is empty." };
  return { ok: true };
}

/** Heuristic auto-classification by filename + mime. Backend OCR will override later. */
export function classifyDocument(name: string, mime: string): DocCategory {
  const n = name.toLowerCase();
  if (/\b(aadhaar|aadhar|pan|voter|passport|driving|license|licence|ration)\b/.test(n)) return "identity";
  if (/\b(marksheet|markssheet|degree|transcript|10th|12th|matric|board|admit|hall.?ticket|diploma|bonafide)\b/.test(n)) return "education";
  if (/\b(income|salary|payslip|bank|statement|itr|tax|gst|invoice|loan|emi|epf|uan|certificate.*income)\b/.test(n)) return "financial";
  if (/\b(ayushman|health|medical|prescription|hospital|insurance|abha|vaccin|disabilit)\b/.test(n)) return "healthcare";
  if (/\b(certificate|award|cert)\b/.test(n)) return "certificates";
  if (mime.startsWith("image/")) return "images";
  return "other";
}

export async function saveDocument(file: File, opts?: { category?: DocCategory }): Promise<SavedDocument> {
  const category = opts?.category ?? classifyDocument(file.name, file.type);
  const now = Date.now();
  const doc: SavedDocument = {
    id: crypto.randomUUID(),
    name: file.name,
    type: file.type || `application/${extOf(file.name) || "octet-stream"}`,
    size: file.size,
    category,
    uploadedAt: now,
    modifiedAt: now,
    favorite: false,
    blob: file,
  };
  await set(doc.id, doc, store);
  return doc;
}

export async function listDocuments(): Promise<SavedDocument[]> {
  const ks = await keys(store);
  const items = await Promise.all(ks.map((k) => get<SavedDocument>(k as string, store)));
  return items.filter(Boolean).sort((a, b) => b!.uploadedAt - a!.uploadedAt) as SavedDocument[];
}

export async function getDocument(id: string): Promise<SavedDocument | undefined> {
  return get<SavedDocument>(id, store);
}

export async function deleteDocument(id: string): Promise<void> {
  await del(id, store);
}

async function patchDoc(id: string, patch: (d: SavedDocument) => SavedDocument): Promise<void> {
  const cur = await get<SavedDocument>(id, store);
  if (!cur) return;
  await set(id, patch(cur), store);
}

export async function renameDocument(id: string, name: string): Promise<void> {
  await patchDoc(id, (d) => ({ ...d, name: name.trim() || d.name, modifiedAt: Date.now() }));
}
export async function setCategory(id: string, category: DocCategory): Promise<void> {
  await patchDoc(id, (d) => ({ ...d, category, modifiedAt: Date.now() }));
}
export async function toggleFavorite(id: string): Promise<boolean> {
  const cur = await get<SavedDocument>(id, store);
  if (!cur) return false;
  const next = !cur.favorite;
  await set(id, { ...cur, favorite: next, modifiedAt: Date.now() }, store);
  return next;
}
export async function markOpened(id: string): Promise<void> {
  await patchDoc(id, (d) => ({ ...d, lastOpenedAt: Date.now() }));
}
export async function setAnalysis(id: string, analysis: DocAnalysis): Promise<void> {
  await patchDoc(id, (d) => ({ ...d, analysis, modifiedAt: Date.now() }));
}

export function downloadDocument(doc: SavedDocument): void {
  const url = URL.createObjectURL(doc.blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = doc.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function fileSizeLabel(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/** Send the document to /api/analyze-document. Throws on HTTP error. */
export async function analyzeDocument(doc: SavedDocument, signal?: AbortSignal): Promise<DocAnalysis> {
  const dataUrl = await blobToDataUrl(doc.blob);
  const res = await fetch("/api/analyze-document", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: doc.name, type: doc.type, category: doc.category, dataUrl }),
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Analyze failed (${res.status})`);
  }
  return (await res.json()) as DocAnalysis;
}
