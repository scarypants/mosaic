import type { BlockType, BlockSize } from "../types/block"

interface TemplateBlock {
  type: BlockType
  size: BlockSize
  position: { x: number; y: number }
}

export type TemplateName = "resume" | "portfolio"

export const TEMPLATES: Record<TemplateName, TemplateBlock[]> = {
  resume: [
    { type: "title",     size: "L", position: { x: 0, y: 0 } },
    { type: "profile",   size: "L", position: { x: 0, y: 1 } },
    { type: "education", size: "L", position: { x: 0, y: 2 } },
    { type: "career",    size: "L", position: { x: 0, y: 3 } },
    { type: "skill",     size: "L", position: { x: 0, y: 4 } },
    { type: "about",     size: "L", position: { x: 0, y: 5 } },
  ],
  portfolio: [
    { type: "title",   size: "M", position: { x: 0, y: 0 } },
    { type: "profile", size: "M", position: { x: 2, y: 0 } },
    { type: "career",  size: "L", position: { x: 0, y: 1 } },
    { type: "project", size: "L", position: { x: 0, y: 2 } },
    { type: "project", size: "L", position: { x: 0, y: 3 } },
    { type: "project", size: "L", position: { x: 0, y: 4 } },
    { type: "project", size: "L", position: { x: 0, y: 5 } },
  ],
}
