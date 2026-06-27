import type { ProgramCategory } from "@/lib/types";
import scholarship from "@/assets/cat-scholarship.jpg";
import startup from "@/assets/cat-startup.jpg";
import farmer from "@/assets/cat-farmer.jpg";
import healthcare from "@/assets/cat-healthcare.jpg";
import housing from "@/assets/cat-housing.jpg";
import skill from "@/assets/cat-skill.jpg";
import employment from "@/assets/cat-employment.jpg";
import welfare from "@/assets/cat-welfare.jpg";
import women from "@/assets/cat-women.jpg";
import insurance from "@/assets/cat-insurance.jpg";

export const CATEGORY_IMAGE: Record<ProgramCategory, string> = {
  scholarship,
  startup,
  farmer,
  healthcare,
  housing,
  skill,
  employment,
  welfare,
  women,
  insurance,
};
