import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download, FileText, Image as ImageIcon, Loader2, MoreHorizontal, Pencil,
  Search, ShieldCheck, Sparkles, Star, Trash2, UploadCloud, X, RotateCw,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/netr/EmptyState";
import { AppShell } from "@/components/netr/AppShell";
import { PageHeader } from "@/components/netr/PageHeader";
import {
  analyzeDocument, deleteDocument, downloadDocument, fileSizeLabel, listDocuments,
  markOpened, renameDocument, saveDocument, setAnalysis, setCategory, toggleFavorite, validateFile,
} from "@/services/documents";
import type { DocAnalysis, DocCategory, SavedDocument } from "@/lib/types";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Document Vault · Project Netr" },
      { name: "description", content: "A privacy-first vault for the documents that often unlock opportunities — kept on your device." },
    ],
  }),
  component: DocumentsPage,
});

const CATEGORY_KEYS: DocCategory[] = ["identity", "education", "financial", "healthcare", "certificates", "images", "other"];
type SortKey = "newest" | "oldest" | "az" | "size" | "type" | "opened";
type Filter = "all" | "recent" | "favorites" | DocCategory;

type ActiveUpload = { id: string; file: File; progress: number; status: "uploading" | "done" | "error"; error?: string; controller: AbortController };

function DocumentsPage() {
  const { t } = useTranslation();
  const [docs, setDocs] = useState<SavedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploads, setUploads] = useState<ActiveUpload[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [showAnalysisFor, setShowAnalysisFor] = useState<string | null>(null);
  const [previewFor, setPreviewFor] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try { setDocs(await listDocuments()); }
    finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); }, []);

  useEffect(() => {
    if (!previewFor) { if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); setZoom(1); setFullscreen(false); return; }
    const doc = docs.find((d) => d.id === previewFor);
    if (!doc) return;
    const url = URL.createObjectURL(doc.blob);
    setPreviewUrl(url);
    void markOpened(doc.id);
    return () => URL.revokeObjectURL(url);
  }, [previewFor, docs]);

  // Upload one file with progress + cancel/retry.
  const startUpload = (file: File) => {
    const v = validateFile(file);
    if (!v.ok) { toast.error(`${file.name}: ${v.reason}`); return; }
    const id = crypto.randomUUID();
    const controller = new AbortController();
    const item: ActiveUpload = { id, file, progress: 0, status: "uploading", controller };
    setUploads((u) => [...u, item]);
    void runUpload(item);
  };

  const runUpload = async (item: ActiveUpload) => {
    try {
      // Simulated progress to give visible feedback for the local IDB write
      for (let p = 15; p < 90; p += 15) {
        if (item.controller.signal.aborted) throw new Error("cancelled");
        setUploads((u) => u.map((x) => (x.id === item.id ? { ...x, progress: p } : x)));
        await new Promise((r) => setTimeout(r, 80));
      }
      await saveDocument(item.file);
      setUploads((u) => u.map((x) => (x.id === item.id ? { ...x, progress: 100, status: "done" } : x)));
      toast.success(t("toast.docSaved", { name: item.file.name }));
      await refresh();
      // auto-clear completed uploads
      setTimeout(() => setUploads((u) => u.filter((x) => x.id !== item.id)), 1200);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      if (msg === "cancelled") {
        setUploads((u) => u.filter((x) => x.id !== item.id));
        return;
      }
      setUploads((u) => u.map((x) => (x.id === item.id ? { ...x, status: "error", error: msg } : x)));
      toast.error(t("toast.docFailed", { name: item.file.name }));
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(startUpload);
    if (inputRef.current) inputRef.current.value = "";
  };

  const cancelUpload = (id: string) => {
    const u = uploads.find((x) => x.id === id);
    u?.controller.abort();
    setUploads((all) => all.filter((x) => x.id !== id));
  };

  const retryUpload = (id: string) => {
    const u = uploads.find((x) => x.id === id);
    if (!u) return;
    const controller = new AbortController();
    const reset: ActiveUpload = { ...u, progress: 0, status: "uploading", error: undefined, controller };
    setUploads((all) => all.map((x) => (x.id === id ? reset : x)));
    void runUpload(reset);
  };

  const onDelete = async (id: string) => {
    await deleteDocument(id);
    if (previewFor === id) setPreviewFor(null);
    if (activeId === id) setActiveId(null);
    if (showAnalysisFor === id) setShowAnalysisFor(null);
    setDeletingId(null);
    await refresh();
    toast(t("toast.docRemoved"));
  };

  const onRename = async () => {
    if (!renamingId) return;
    const name = renameValue.trim();
    if (!name) { setRenamingId(null); return; }
    await renameDocument(renamingId, name);
    setRenamingId(null);
    await refresh();
  };

  const onToggleFavorite = async (id: string) => {
    const next = await toggleFavorite(id);
    await refresh();
    toast(next ? "★" : "☆");
  };

  const onChangeCategory = async (id: string, cat: DocCategory) => {
    await setCategory(id, cat);
    await refresh();
  };

  const onAnalyze = async (doc: SavedDocument) => {
    setShowAnalysisFor(doc.id);
    setAnalyzingId(doc.id);
    // Mark pending in store so it survives refresh
    await setAnalysis(doc.id, { status: "pending", updatedAt: Date.now() });
    await refresh();
    try {
      const result = await analyzeDocument(doc);
      await setAnalysis(doc.id, result);
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analyze failed";
      const errAnalysis: DocAnalysis = { status: "error", updatedAt: Date.now(), error: message };
      await setAnalysis(doc.id, errAnalysis);
      await refresh();
      toast.error(message);
    } finally {
      setAnalyzingId(null);
    }
  };

  // ---- Filter + sort + search pipeline ----
  const visible = useMemo(() => {
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    let list = docs.slice();
    if (filter === "recent") list = list.filter((d) => now - d.uploadedAt < sevenDays);
    else if (filter === "favorites") list = list.filter((d) => d.favorite);
    else if (filter !== "all") list = list.filter((d) => d.category === filter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter((d) => d.name.toLowerCase().includes(q) || d.category.includes(q) || d.type.toLowerCase().includes(q));
    const cmp: Record<SortKey, (a: SavedDocument, b: SavedDocument) => number> = {
      newest: (a, b) => b.uploadedAt - a.uploadedAt,
      oldest: (a, b) => a.uploadedAt - b.uploadedAt,
      az: (a, b) => a.name.localeCompare(b.name),
      size: (a, b) => b.size - a.size,
      type: (a, b) => a.type.localeCompare(b.type),
      opened: (a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0),
    };
    return list.sort(cmp[sort]);
  }, [docs, filter, query, sort]);

  const activeDoc = activeId ? docs.find((d) => d.id === activeId) ?? null : null;
  const analysisDoc = showAnalysisFor ? docs.find((d) => d.id === showAnalysisFor) ?? null : null;
  const deletingDoc = deletingId ? docs.find((d) => d.id === deletingId) ?? null : null;

  return (
    <AppShell>
      <PageHeader
        eyebrow={t("documents.eyebrow")}
        title={<>{t("documents.titlePre")} <span className="netr-glow-text">{t("documents.titleHighlight")}</span></>}
        description={t("documents.description")}
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.label
          whileHover={{ y: -2 }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
          className="netr-card flex cursor-pointer flex-col items-center justify-center gap-3 border-dashed p-12 text-center"
        >
          <UploadCloud className="h-10 w-10 text-saffron" />
          <p className="text-base font-semibold">{t("documents.drop")}</p>
          <p className="max-w-sm text-xs text-muted-foreground">{t("documents.dropHint")}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">{t("documents.chooseFile")}</span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx,.txt,.rtf,.jpg,.jpeg,.png,.webp,.heic,.heif,.csv,.xlsx,.xls,.pptx,.ppt,.zip"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </motion.label>

        <div className="netr-card relative overflow-hidden p-8">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-leaf/20 to-sky/15" />
          <ShieldCheck className="h-9 w-9 text-leaf" />
          <h3 className="mt-5 text-lg font-semibold">{t("documents.whyLocalTitle")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>· {t("documents.whyLocal1")}</li>
            <li>· {t("documents.whyLocal2")}</li>
            <li>· {t("documents.whyLocal3")}</li>
            <li>· {t("documents.whyLocal4")}</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
            <span className="rounded-full bg-leaf/15 px-2 py-1 text-leaf">{t("documents.privacy.private")}</span>
            <span className="rounded-full bg-sky/15 px-2 py-1 text-sky">{t("documents.privacy.local")}</span>
            <span className="rounded-full bg-saffron/15 px-2 py-1 text-saffron">{t("documents.privacy.notUploaded")}</span>
          </div>
        </div>
      </div>

      {/* Active uploads */}
      {uploads.length > 0 && (
        <div className="mt-8 space-y-2">
          {uploads.map((u) => (
            <div key={u.id} className="netr-card flex items-center gap-3 p-3 text-xs">
              <FileText className="h-4 w-4 text-saffron" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{u.file.name}</p>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full transition-all ${u.status === "error" ? "bg-destructive" : "bg-saffron"}`}
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
                {u.status === "error" && <p className="mt-1 text-destructive">{u.error}</p>}
              </div>
              {u.status === "uploading" && (
                <button onClick={() => cancelUpload(u.id)} className="rounded-full p-1 hover:bg-muted" aria-label={t("common.cancel")}>
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              {u.status === "error" && (
                <button onClick={() => retryUpload(u.id)} className="rounded-full p-1 hover:bg-muted" aria-label={t("common.retry")}>
                  <RotateCw className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div className="mt-12 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight">
            {t("documents.yourDocuments")} {docs.length > 0 && `(${docs.length})`}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("documents.search")}
                className="w-64 max-w-full rounded-full border border-border/60 bg-background/60 py-2 pl-9 pr-3 text-xs outline-none focus:border-saffron/50"
              />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-full border border-border/60 bg-background/60 px-3 py-2 text-xs">
              <option value="newest">{t("documents.sort.newest")}</option>
              <option value="oldest">{t("documents.sort.oldest")}</option>
              <option value="az">{t("documents.sort.az")}</option>
              <option value="size">{t("documents.sort.size")}</option>
              <option value="type">{t("documents.sort.type")}</option>
              <option value="opened">{t("documents.sort.opened")}</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["all", "recent", "favorites", ...CATEGORY_KEYS] as Filter[]).map((f) => {
            const label = f === "all" ? t("documents.filterAll") : f === "recent" ? t("documents.filterRecent") : f === "favorites" ? t("documents.filterFavorites") : t(`documents.categories.${f}`);
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full border px-3 py-1.5 text-xs transition ${active ? "border-saffron/60 bg-saffron/10 text-saffron" : "border-border/60 text-muted-foreground hover:border-saffron/40 hover:text-foreground"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="netr-card flex items-center justify-center p-10 text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t("documents.loading")}</div>
        ) : docs.length === 0 ? (
          <EmptyState
            title={t("documents.emptyTitle")}
            body={t("documents.emptyBody")}
            alt={t("documents.emptyAlt")}
            action={
              <button onClick={() => inputRef.current?.click()} className="rounded-full bg-foreground px-5 py-2 text-xs font-semibold text-background">
                {t("documents.emptyAction")}
              </button>
            }
          />
        ) : visible.length === 0 ? (
          <EmptyState title={t("documents.noResults")} body={t("opportunities.emptyBody")} alt={t("documents.emptyAlt")} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((d) => (
              <DocCard
                key={d.id}
                doc={d}
                onPreview={() => setPreviewFor(d.id)}
                onAnalyze={() => onAnalyze(d)}
                onOpenDetails={() => setActiveId(d.id)}
                onStartRename={() => { setRenamingId(d.id); setRenameValue(d.name); }}
                onDownload={() => downloadDocument(d)}
                onDelete={() => setDeletingId(d.id)}
                onFav={() => onToggleFavorite(d.id)}
                onCategory={(c) => onChangeCategory(d.id, c)}
                menuOpen={menuFor === d.id}
                setMenuOpen={(o) => setMenuFor(o ? d.id : null)}
                analyzing={analyzingId === d.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview side panel */}
      <AnimatePresence>
      {previewFor && previewUrl && (
        <PreviewPanel
          doc={docs.find((d) => d.id === previewFor)!}
          url={previewUrl}
          zoom={zoom}
          setZoom={setZoom}
          fullscreen={fullscreen}
          setFullscreen={setFullscreen}
          onClose={() => setPreviewFor(null)}
        />
      )}
      </AnimatePresence>

      {/* Analysis panel */}
      <AnimatePresence>
        {analysisDoc && (
          <AnalysisPanel
            doc={analysisDoc}
            running={analyzingId === analysisDoc.id}
            onClose={() => setShowAnalysisFor(null)}
            onRegenerate={() => onAnalyze(analysisDoc)}
          />
        )}
      </AnimatePresence>

      {/* Properties side panel */}
      <AnimatePresence>
        {activeDoc && (
          <PropertiesPanel doc={activeDoc} onClose={() => setActiveId(null)} />
        )}
      </AnimatePresence>

      {/* Rename dialog */}
      <AnimatePresence>
        {renamingId && (
          <div onClick={() => setRenamingId(null)} className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-6 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="netr-card w-full max-w-md bg-background p-6"
            >
              <h3 className="text-base font-semibold">{t("documents.rename.title")}</h3>
              <input
                autoFocus
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void onRename(); }}
                placeholder={t("documents.rename.placeholder")}
                className="mt-4 w-full rounded-xl border border-border/60 bg-background/60 px-4 py-2.5 text-sm outline-none focus:border-saffron/50"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setRenamingId(null)} className="rounded-full border border-border/60 px-4 py-2 text-xs">{t("common.cancel")}</button>
                <button onClick={() => void onRename()} className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">{t("documents.rename.save")}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deletingDoc && (
          <div onClick={() => setDeletingId(null)} className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-6 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="netr-card w-full max-w-md bg-background p-6"
            >
              <h3 className="text-base font-semibold">{t("documents.delete.title")}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t("documents.delete.body")}</p>
              <p className="mt-3 truncate rounded-lg bg-muted/40 px-3 py-2 text-xs">{deletingDoc.name}</p>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setDeletingId(null)} className="rounded-full border border-border/60 px-4 py-2 text-xs">{t("common.cancel")}</button>
                <button onClick={() => void onDelete(deletingDoc.id)} className="rounded-full bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground">{t("documents.delete.confirm")}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}

/* ---------------- Subcomponents ---------------- */

function DocIcon({ doc }: { doc: SavedDocument }) {
  if (doc.type.startsWith("image/")) return <ImageIcon className="h-5 w-5 text-sky" />;
  return <FileText className="h-5 w-5 text-saffron" />;
}

function DocCard({
  doc, onPreview, onAnalyze, onOpenDetails, onStartRename, onDownload, onDelete, onFav, onCategory,
  menuOpen, setMenuOpen, analyzing,
}: {
  doc: SavedDocument;
  onPreview: () => void;
  onAnalyze: () => void;
  onOpenDetails: () => void;
  onStartRename: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onFav: () => void;
  onCategory: (c: DocCategory) => void;
  menuOpen: boolean;
  setMenuOpen: (o: boolean) => void;
  analyzing: boolean;
}) {
  const { t } = useTranslation();
  const [thumb, setThumb] = useState<string | null>(null);
  useEffect(() => {
    if (!doc.type.startsWith("image/")) return;
    const u = URL.createObjectURL(doc.blob);
    setThumb(u);
    return () => URL.revokeObjectURL(u);
  }, [doc]);

  const analysisStatus = doc.analysis?.status;

  return (
    <div className="netr-card group flex flex-col overflow-hidden">
      {/* Thumbnail */}
      <button onClick={onPreview} className="relative block h-32 w-full overflow-hidden bg-gradient-to-br from-muted/40 to-muted/10">
        {thumb ? (
          <img src={thumb} alt={doc.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <FileText className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}
        {doc.favorite && (
          <span className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-saffron"><Star className="h-3 w-3 fill-saffron" /></span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <button onClick={onOpenDetails} className="block w-full truncate text-left text-sm font-semibold leading-snug hover:text-saffron">
              {doc.name}
            </button>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              <span className="capitalize">{t(`documents.categories.${doc.category}`)}</span> · {fileSizeLabel(doc.size)}
            </p>
          </div>
          <DocIcon doc={doc} />
        </div>

        <p className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {new Date(doc.uploadedAt).toLocaleDateString()}
          {analysisStatus === "ready" && <span className="ml-2 rounded-full bg-leaf/15 px-2 py-0.5 text-[10px] text-leaf">{t("documents.status.ready")}</span>}
          {analysisStatus === "pending" && <span className="ml-2 rounded-full bg-sky/15 px-2 py-0.5 text-[10px] text-sky">{t("documents.analyze.running")}</span>}
          {analysisStatus === "error" && <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] text-destructive">{t("documents.status.error")}</span>}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={onPreview} className="rounded-xl border border-border/70 px-3 py-2 text-xs font-semibold hover:border-saffron/50">
            {t("documents.preview")}
          </button>
          <button onClick={onAnalyze} disabled={analyzing} className="inline-flex items-center justify-center gap-1 rounded-xl bg-foreground px-3 py-2 text-xs font-semibold text-background disabled:opacity-60">
            {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
            {t("documents.actions.analyze")}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <button onClick={onFav} aria-label={doc.favorite ? t("documents.actions.unfavorite") : t("documents.actions.favorite")} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-saffron">
            <Star className={`h-3.5 w-3.5 ${doc.favorite ? "fill-saffron text-saffron" : ""}`} />
          </button>
          <div className="flex items-center gap-1">
            <button onClick={onStartRename} aria-label={t("documents.actions.rename")} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={onDownload} aria-label={t("documents.actions.download")} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
              <Download className="h-3.5 w-3.5" />
            </button>
            <button onClick={onDelete} aria-label={t("documents.actions.delete")} className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} aria-label={t("documents.actions.more")} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </button>
              {menuOpen && (
                <div onMouseLeave={() => setMenuOpen(false)} className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-xl border border-border/60 bg-popover p-1 shadow-lg">
                  <p className="px-3 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">{t("documents.properties.category")}</p>
                  {(["identity","education","financial","healthcare","certificates","images","other"] as DocCategory[]).map((c) => (
                    <button key={c} onClick={() => { onCategory(c); setMenuOpen(false); }} className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs hover:bg-muted ${doc.category === c ? "text-saffron" : ""}`}>
                      {t(`documents.categories.${c}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewPanel({
  doc, url, zoom, setZoom, fullscreen, setFullscreen, onClose,
}: {
  doc: SavedDocument; url: string; zoom: number; setZoom: (v: number) => void;
  fullscreen: boolean; setFullscreen: (v: boolean) => void; onClose: () => void;
}) {
  const { t } = useTranslation();
  const isImage = doc.type.startsWith("image/");
  const isPdf = doc.type === "application/pdf" || doc.name.toLowerCase().endsWith(".pdf");
  const isText = doc.type.startsWith("text/") || /\.(txt|csv|rtf)$/i.test(doc.name);
  const [textBody, setTextBody] = useState<string | null>(null);
  useEffect(() => {
    if (!isText) return;
    doc.blob.text().then(setTextBody).catch(() => setTextBody(""));
  }, [doc, isText]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-foreground/50 backdrop-blur-sm"
    >
      <motion.aside
        initial={{ x: 40 }} animate={{ x: 0 }} exit={{ x: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className={`flex flex-col bg-background shadow-2xl ${fullscreen ? "w-full" : "w-full max-w-3xl"}`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-border/50 p-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{doc.name}</h3>
            <p className="text-xs text-muted-foreground">{fileSizeLabel(doc.size)} · {doc.type || "file"}</p>
          </div>
          <div className="flex items-center gap-2">
            {isImage && (
              <>
                <button onClick={() => setZoom(Math.max(0.25, +(zoom - 0.25).toFixed(2)))} className="rounded-full border border-border/60 px-2 py-1 text-xs">−</button>
                <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom(Math.min(4, +(zoom + 0.25).toFixed(2)))} className="rounded-full border border-border/60 px-2 py-1 text-xs">+</button>
              </>
            )}
            <button onClick={() => setFullscreen(!fullscreen)} className="rounded-full border border-border/60 px-3 py-1 text-xs">{fullscreen ? "↘" : "↖"}</button>
            <button onClick={onClose} className="rounded-full border border-border/60 px-3 py-1 text-xs">{t("documents.close")}</button>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-muted/20 p-4">
          {isImage && (
            <div className="flex min-h-full items-center justify-center">
              <img src={url} alt={doc.name} style={{ transform: `scale(${zoom})` }} className="max-h-none origin-center transition-transform" />
            </div>
          )}
          {isPdf && <iframe title={doc.name} src={url} className="h-full min-h-[80vh] w-full rounded-lg bg-background" />}
          {isText && (
            <pre className="whitespace-pre-wrap rounded-lg bg-background p-4 text-xs">{textBody ?? "…"}</pre>
          )}
          {!isImage && !isPdf && !isText && (
            <div className="flex h-full min-h-[40vh] flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
              <FileText className="h-10 w-10" />
              <p>{t("documents.analyze.unsupported")}</p>
              <a href={url} download={doc.name} className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">
                {t("documents.actions.download")}
              </a>
            </div>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}

function AnalysisPanel({ doc, running, onClose, onRegenerate }: {
  doc: SavedDocument; running: boolean; onClose: () => void; onRegenerate: () => void;
}) {
  const { t } = useTranslation();
  const a = doc.analysis;
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-stretch justify-end bg-foreground/50 backdrop-blur-sm"
    >
      <motion.aside
        initial={{ x: 40 }} animate={{ x: 0 }} exit={{ x: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-xl flex-col bg-background shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border/50 p-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-saffron" />
              <h3 className="text-sm font-semibold">{t("documents.analyze.title")}</h3>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{t("documents.analyze.subtitle")} · {doc.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onRegenerate} disabled={running} className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs disabled:opacity-50">
              <RotateCw className="h-3 w-3" /> {t("documents.analyze.regenerate")}
            </button>
            <button onClick={onClose} className="rounded-full border border-border/60 px-3 py-1 text-xs">{t("documents.close")}</button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-5">
          {running || a?.status === "pending" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-saffron" />
              <p>{t("documents.analyze.running")}</p>
              <p className="text-xs">{t("documents.analyze.waiting")}</p>
            </div>
          ) : a?.status === "error" ? (
            <div className="netr-card border-destructive/40 p-5 text-sm">
              <p className="font-semibold text-destructive">{t("documents.analyze.error")}</p>
              <p className="mt-2 text-xs text-muted-foreground">{a.error}</p>
              <button onClick={onRegenerate} className="mt-4 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">{t("common.retry")}</button>
            </div>
          ) : a?.status === "unsupported" ? (
            <div className="netr-card p-5 text-sm text-muted-foreground">{a.summary || t("documents.analyze.unsupported")}</div>
          ) : a?.status === "ready" ? (
            <div className="space-y-6 text-sm">
              {a.summary && (
                <Section title={t("documents.analyze.summary")}>
                  <p className="text-muted-foreground">{a.summary}</p>
                </Section>
              )}
              {a.detected && Object.keys(a.detected).length > 0 && (
                <Section title={t("documents.analyze.detected")}>
                  <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {Object.entries(a.detected).map(([k, v]) => (
                      <div key={k} className="rounded-lg border border-border/40 bg-muted/20 p-3">
                        <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.replace(/_/g, " ")}</dt>
                        <dd className="mt-0.5 text-xs">{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                </Section>
              )}
              {a.importantDates && a.importantDates.length > 0 && (
                <Section title={t("documents.analyze.dates")}>
                  <ul className="space-y-1 text-xs">
                    {a.importantDates.map((d, i) => (
                      <li key={i} className="flex justify-between border-b border-border/30 pb-1"><span>{d.label}</span><span className="text-muted-foreground">{d.date}</span></li>
                    ))}
                  </ul>
                </Section>
              )}
              {a.keyDocuments && a.keyDocuments.length > 0 && (
                <Section title={t("documents.analyze.keyDocs")}>
                  <BulletList items={a.keyDocuments} />
                </Section>
              )}
              {a.recommendations && a.recommendations.length > 0 && (
                <Section title={t("documents.analyze.recommendations")}>
                  <BulletList items={a.recommendations} />
                </Section>
              )}
              {a.suggestedOpportunities && a.suggestedOpportunities.length > 0 && (
                <Section title={t("documents.analyze.opportunities")}>
                  <p className="mb-2 text-xs text-muted-foreground">{t("documents.analyze.opportunityHint")}</p>
                  <BulletList items={a.suggestedOpportunities} />
                </Section>
              )}
              {a.missingDocuments && a.missingDocuments.length > 0 && (
                <Section title={t("documents.analyze.missing")}>
                  <BulletList items={a.missingDocuments} />
                </Section>
              )}
              {typeof a.confidence === "number" && (
                <Section title={t("documents.analyze.confidence")}>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full bg-leaf" style={{ width: `${Math.round(a.confidence * 100)}%` }} />
                    </div>
                    <span className="text-xs tabular-nums">{Math.round(a.confidence * 100)}%</span>
                  </div>
                </Section>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-sm text-muted-foreground">
              <Sparkles className="h-8 w-8 text-saffron" />
              <p>{t("documents.analyze.waiting")}</p>
              <button onClick={onRegenerate} className="mt-2 rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">
                {t("documents.analyze.start")}
              </button>
            </div>
          )}
        </div>
      </motion.aside>
    </motion.div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      {children}
    </section>
  );
}
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1 text-xs">
      {items.map((it, i) => (<li key={i} className="flex gap-2"><span className="text-saffron">·</span><span>{it}</span></li>))}
    </ul>
  );
}

function PropertiesPanel({ doc, onClose }: { doc: SavedDocument; onClose: () => void }) {
  const { t } = useTranslation();
  const rows: [string, string][] = [
    [t("documents.properties.name"), doc.name],
    [t("documents.properties.type"), doc.type || "—"],
    [t("documents.properties.size"), fileSizeLabel(doc.size)],
    [t("documents.properties.category"), t(`documents.categories.${doc.category}`)],
    [t("documents.properties.created"), new Date(doc.uploadedAt).toLocaleString()],
    [t("documents.properties.modified"), new Date(doc.modifiedAt).toLocaleString()],
    [t("documents.properties.status"), t("documents.status.stored")],
    [t("documents.properties.aiStatus"), doc.analysis?.status ? t(`documents.status.${doc.analysis.status === "pending" ? "pending" : doc.analysis.status}`) : t("documents.status.pending")],
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-40 flex items-stretch justify-end bg-foreground/30 backdrop-blur-sm"
    >
      <motion.aside
        initial={{ x: 40 }} animate={{ x: 0 }} exit={{ x: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        className="flex w-full max-w-sm flex-col bg-background shadow-2xl"
      >
        <header className="flex items-center justify-between gap-3 border-b border-border/50 p-4">
          <h3 className="text-sm font-semibold">{t("documents.properties.title")}</h3>
          <button onClick={onClose} className="rounded-full border border-border/60 px-3 py-1 text-xs">{t("documents.close")}</button>
        </header>
        <div className="flex-1 overflow-auto p-5">
          <dl className="space-y-3 text-xs">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-border/30 pb-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="text-right font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </motion.aside>
    </motion.div>
  );
}
