import type { LucideIcon } from "lucide-react"
import type { ComponentType } from "react"
import type { TitleBlockData, ProfileBlockData, AboutBlockData, EducationBlockData, CareerBlockData, ProjectBlockData, SkillBlockData } from "./blockData"

/**
 * 블록 크기 타입
 */
export type BlockSize = "S" | "M" | "L" | "XL"

/**
 * 블록 크기 타입별 사이즈
 */
export const SIZE_SPAN: Record<BlockSize, { col: number; row: number }> = {
  S: { col: 1, row: 1},
  M: { col: 2, row: 1},
  L: { col: 4, row: 1},
  XL: { col: 4, row: 2},
}

export interface BlockStyle {
  fontSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl"
  fontWeight?: "light" | "normal" | "bold"
  textAlign?: "left" | "center" | "right"
  showBorder?: boolean
}

/**
 * 기본 블록 타입
 */
interface BlockBase {
  id: string;
  label: string
  size: BlockSize;
  position?: { x: number; y: number }
  style?: BlockStyle
}

/**
 * 블록 타입
 * - id
 * - label
 * - size
 * - position
 * - type
 * - data
 */
export type Block =
  | (BlockBase & { type: "title";     data: TitleBlockData })
  | (BlockBase & { type: "profile";   data: ProfileBlockData })
  | (BlockBase & { type: "about";     data: AboutBlockData })
  | (BlockBase & { type: "education"; data: EducationBlockData })
  | (BlockBase & { type: "career";    data: CareerBlockData })
  | (BlockBase & { type: "project";   data: ProjectBlockData })
  | (BlockBase & { type: "skill";     data: SkillBlockData })

/**
 * 블록 종류 타입
 */
export type BlockType = Block["type"]

/**
 * 초기 블록 정의 타입
 */
export interface BlockDefinition {
  type: BlockType
  label: string
  icon: LucideIcon
  allowedSizes: BlockSize[]
  component: ComponentType<{block: Block}>
  defaultData: object
}

export interface props {
  block: Block
}