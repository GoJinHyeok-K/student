/** 과정 화면 공통 표시값. 목록(FR-01)·상세(FR-02)·관리(FR-03)가 같이 쓴다. */

// 분류 목록 API가 생기기 전까지는 화면에 고정한다 (D-08)
export const CATEGORIES = ['개발', '데이터', '리더십', '공통'];

export interface CategoryStyle {
  /** 칩 배경 */
  bg: string;
  /** 칩 글자, 강조 색 */
  fg: string;
  /** 카드 머리·상세 배너의 그라데이션 */
  gradient: string;
  /** 카드 머리에 넣는 SVG path (24x24) */
  icon: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  개발: {
    bg: '#EEF2FF',
    fg: '#4338CA',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #4338CA 55%, #312E81 100%)',
    // 코드 괄호
    icon: 'M8.7 15.9 4.8 12l3.9-3.9L7.3 6.7 2 12l5.3 5.3zm6.6 0 3.9-3.9-3.9-3.9 1.4-1.4L22 12l-5.3 5.3z',
  },
  데이터: {
    bg: '#ECFEFF',
    fg: '#0E7490',
    gradient: 'linear-gradient(135deg, #22D3EE 0%, #0891B2 55%, #155E75 100%)',
    // 막대 그래프
    icon: 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z',
  },
  리더십: {
    bg: '#FFF7ED',
    fg: '#C2410C',
    gradient: 'linear-gradient(135deg, #FB923C 0%, #EA580C 55%, #9A3412 100%)',
    // 깃발
    icon: 'M14.4 6 14 4H5v17h2v-7h5.6l.4 2h7V6z',
  },
  공통: {
    bg: '#F1F5F9',
    fg: '#334155',
    gradient: 'linear-gradient(135deg, #94A3B8 0%, #475569 55%, #1E293B 100%)',
    // 책
    icon: 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2M6 4h5v8l-2.5-1.5L6 12z',
  },
};

/** 분류 표시 스타일. 모르는 분류는 '공통' 스타일을 쓴다. */
export function categoryStyle(category?: string): CategoryStyle {
  return (category && CATEGORY_STYLES[category]) || CATEGORY_STYLES['공통'];
}

/** 분류 칩 색 (기존 호출부 호환) */
export function categoryColor(category?: string) {
  const { bg, fg } = categoryStyle(category);
  return { bg, fg };
}

/** 과정·회차 상태 표시 (D-06: OPEN, CLOSED). */
export const STATUS: Record<string, { label: string; color: 'success' | 'default' }> = {
  OPEN: { label: '모집 중', color: 'success' },
  CLOSED: { label: '종료', color: 'default' },
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function parse(isoDate?: string) {
  if (!isoDate) return undefined;
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return undefined;
  return { y, m, d, weekday: WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()] };
}

/** 'yyyy-MM-dd'를 'yyyy.MM.dd (요일)'로 바꾼다. 시간대 영향을 받지 않도록 직접 나눈다. */
export function formatDate(isoDate?: string) {
  const p = parse(isoDate);
  if (!p) return isoDate ?? '';
  return `${p.y}.${String(p.m).padStart(2, '0')}.${String(p.d).padStart(2, '0')} (${p.weekday})`;
}

/** 날짜 블록 표시용: 월, 일, 요일 */
export function dateParts(isoDate?: string) {
  const p = parse(isoDate);
  return p ? { month: `${p.m}월`, day: String(p.d), weekday: p.weekday, year: String(p.y) } : undefined;
}
