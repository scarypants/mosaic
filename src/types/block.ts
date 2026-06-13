import type { LucideIcon } from "lucide-react"
import type { ComponentType } from "react"
import type { TitleBlockData, ProfileBlockData, AboutBlockData, EducationBlockData, CareerBlockData, ProjectBlockData, SkillBlockData } from "./blockData"

/**
 * 블록 크기 타입
 */
export type BlockSize = "S" | "M" | "L" | "XL"

/**
 * 블록 크기 타입별 사이즈
 * - S: 1 X 1
 * - M: 2 X 1
 * - L: 4 X 1
 * - XL: 4 X 2
 */
export const SIZE_SPAN: Record<BlockSize, { col: number; row: number }> = {
  S: { col: 1, row: 1},
  M: { col: 2, row: 1},
  L: { col: 4, row: 1},
  XL: { col: 4, row: 2},
}

/**
 * 블록 스타일 속성 타입
 * - fontSize: 글씨 크기
 * - fontWeight: 글씨 굵기
 * - textAlign: 정렬
 * - showBorder: 테두리 유무
 */
export interface BlockStyle {
  fontSize?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl"
  fontWeight?: "light" | "normal" | "bold"
  textAlign?: "left" | "center" | "right"
  showBorder?: boolean
}

/**
 * 기본 블록 타입
 * - id
 * - label: 블록 종류 라벨
 * - size: 블록 크기
 * - position: 문서 내에서 블록 위치(x: 1~4, y: 1~6)
 * - style: 블록 스타일 속성
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
 * - label: 블록 종류 라벨
 * - size: 블록 크기
 * - position: 문서 내에서 블록 위치(x: 1~4, y: 1~6)
 * - style: 블록 스타일 속성
 * - type: 블록 종류
 * - data: 블록 데이터
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
 * - type: 블록 종류
 * - label: 블록 종류 라벨
 * - icon: 아이콘
 * - allowedSizes: 허용되는 크기 범위
 * - component: 해당 블록 컴포넌트
 * - defaultData: 기본 데이터 형식
 * - defaultAlign?: 블록 스타일 속성 - 기본 정렬값
 */
export interface BlockDefinition {
  type: BlockType
  label: string
  icon: LucideIcon
  allowedSizes: BlockSize[]
  component: ComponentType<{block: Block}>
  defaultData: object
  // 정렬을 지정하지 않았을 때의 기본값 (미지정 시 left)
  defaultAlign?: NonNullable<BlockStyle["textAlign"]>
}

export interface props {
  block: Block
}