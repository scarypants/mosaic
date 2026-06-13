// 문서(A4 캔버스)와 블록 배치 그리드에 쓰는 기본 상수들

export const COLS = 4;            // 그리드 가로 칸 수 (열)
export const ROWS = 6;            // 그리드 세로 칸 수 (행)
export const A4_WIDTH = 794;      // A4 가로 픽셀 (96dpi 기준)
export const A4_HEIGHT = 1123;    // A4 세로 픽셀 (96dpi 기준)
export const PAGE_MARGIN = 20;    // 캔버스 안쪽 여백(px) — 그리드는 이 여백 안쪽에 그려짐
export const CELL_W = (A4_WIDTH - PAGE_MARGIN * 2) / COLS;    // 그리드 한 칸의 너비(px)
export const CELL_H = (A4_HEIGHT - PAGE_MARGIN * 2) / ROWS;   // 그리드 한 칸의 높이(px)