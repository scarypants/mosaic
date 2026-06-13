import AboutBlock from "../components/blocks/AboutBlock";
import CareerBlock from "../components/blocks/CareerBlock";
import EducationBlock from "../components/blocks/EducationBlock";
import ProfileBlock from "../components/blocks/ProfileBlock";
import ProjectsBlock from "../components/blocks/ProjectsBlock";
import SkillsBlock from "../components/blocks/SkillsBlock";
import TitleBlock from "../components/blocks/TitleBlock";
import type { BlockDefinition } from "../types/block";
import { User, Type, File, GraduationCap } from "lucide-react";
import type { AboutBlockData, CareerBlockData, EducationBlockData, ProfileBlockData, ProjectBlockData, SkillBlockData, TitleBlockData } from "../types/blockData";

/**
 * 초기 블록 정의
 * - type
 * - label
 * - icon
 * - allowedSizes
 * - component
 * - defaultData
 * - defaultAlign?
 */
export const BLOCK_DEFINITIONS: BlockDefinition[] = [
  {
    type: "title",
    label: "제목",
    icon: Type,
    allowedSizes: ["S", "M", "L"],
    component: TitleBlock,
    defaultData: { text: "" } satisfies TitleBlockData,
    defaultAlign: "center",
  },
  {
    type: "profile",
    label: "프로필",
    icon: User,
    allowedSizes: ["S", "M", "L"],
    component: ProfileBlock,
    defaultData: { name: "", englishName: "", imageUrl: "", email: "", phone: "", bid: "" } satisfies ProfileBlockData,
  },
  {
    type: "about",
    label: "소개",
    icon: File,
    allowedSizes: ["S", "M", "L"],
    component: AboutBlock,
    defaultData: { title: "", content: "" } satisfies AboutBlockData,
  },
  {
    type: "education",
    label: "학력",
    icon: GraduationCap,
    allowedSizes: ["M", "L"],
    component: EducationBlock,
    defaultData: { 
      items: [
        { periodStart: "", periodEnd: "", school: "", major: "", graduated: "" },
        { periodStart: "", periodEnd: "", school: "", major: "", graduated: "" },
        { periodStart: "", periodEnd: "", school: "", major: "", graduated: "" },
      ]
    } satisfies EducationBlockData,
  },
  {
    type: "career",
    label: "경력",
    icon: User,
    allowedSizes: ["L", "XL"],
    component: CareerBlock,
    defaultData: { 
      items: [
        {periodStart: "", periodEnd: "", company: "", role: "", description: "", task1: "", task2: ""},
        {periodStart: "", periodEnd: "", company: "", role: "", description: "", task1: "", task2: ""},
        {periodStart: "", periodEnd: "", company: "", role: "", description: "", task1: "", task2: ""},
      ] 
    } satisfies CareerBlockData,
  },
  {
    type: "project",
    label: "프로젝트",
    icon: User,
    allowedSizes: ["S", "M", "L"],
    component: ProjectsBlock,
    defaultData: { imageUrl: "", title: "", description: "", role: "", link: "" } satisfies ProjectBlockData,
  },
  {
    type: "skill",
    label: "자격증",
    icon: User,
    allowedSizes: ["S", "L"],
    component: SkillsBlock,
    defaultData: { 
      items: [
        { date: "", name: "", level: "", organization: "" },
        { date: "", name: "", level: "", organization: "" },
        { date: "", name: "", level: "", organization: "" },
      ] 
    } satisfies SkillBlockData,
  },
]