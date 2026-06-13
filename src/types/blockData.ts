/**
 * 제목 블록 데이터 타입
 * - S: { text }
 * - M: { text }
 * - L: { text } 
 */
export interface TitleBlockData {
  text: string
}

/**
 * 프로필 블록 데이터 타입
 * - S: { name, englishName, phone }
 * - M: { imageUrl, name, englishName, email, phone }
 * - L: { imageUrl, name, englishName, email, phone, bid }
 */
export interface ProfileBlockData {
  name: string
  englishName: string
  imageUrl?: string
  email?: string
  phone?: string
  bid?: string
}

/**
 * 소개 블록 데이터 타입
 * - S: { content }
 * - M: { content }
 * - L: { title, content }
 */
export interface AboutBlockData {
  title?: string
  content: string
}

/**
 * 학력 블록 데이터 타입
 * - M: { [ periodStart, periodEnd, school, major, graduated ] }
 * - L: { [ periodStart, periodEnd, school, major, graduated ] }
 */
export interface EducationBlockData {
  items: {
    periodStart: string
    periodEnd: string
    school: string
    major: string
    graduated: string
  }[]
} 

/**
 * 경력 블록 데이터 타입
 * - L: { [ periodStart, periodEnd, company, role ] }
 * - XL: { [ periodStart, periodEnd, company, description, role, task1, task2 ] }
 */
export interface CareerBlockData { 
  items: {
    periodStart: string
    periodEnd: string
    company: string
    role: string
    description?: string
    task1?: string
    task2?: string
  }[]
}

/**
 * 프로젝트 블록 데이터 타입
 * - S: { name, description, role, link }
 * - M: { imageUrl, name, description, link }
 * - L: { imageUrl, name, description, role, link }
 */
export interface ProjectBlockData { 
  imageUrl?: string
  title: string
  description: string
  role?: string
  link: string
}

/**
 * 자격증 블록 데이터 타입
 * - S: { [ date, name ] }
 * - L: { [ date, name, level, organization ] }
 */
export interface SkillBlockData {
  items: {
    date?: string
    name?: string
    level?: string
    organization?: string
  }[]
}