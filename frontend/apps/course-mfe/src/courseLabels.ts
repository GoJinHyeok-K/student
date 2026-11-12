/** 과정 화면 공통 표시값. 목록(FR-01)과 상세(FR-02)가 같이 쓴다. */

// 분류 목록 API가 생기기 전까지는 화면에 고정한다 (D-08)
export const CATEGORIES = ['개발', '데이터', '리더십', '공통'];

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  개발: { bg: '#EEF2FF', fg: '#4338CA' },
  데이터: { bg: '#ECFEFF', fg: '#0E7490' },
  리더십: { bg: '#FFF7ED', fg: '#C2410C' },
  공통: { bg: '#F3F4F6', fg: '#374151' },
};

/** 분류 칩 색. 모르는 분류는 '공통' 색을 쓴다. */
export function categoryColor(category?: string) {
  return (category && CATEGORY_COLORS[category]) || CATEGORY_COLORS['공통'];
}

/** 과정·회차 상태 표시 (D-06: OPEN, CLOSED). */
export const STATUS: Record<string, { label: string; color: 'success' | 'default' }> = {
  OPEN: { label: '모집 중', color: 'success' },
  CLOSED: { label: '종료', color: 'default' },
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/** 'yyyy-MM-dd'를 'yyyy.MM.dd (요일)'로 바꾼다. 시간대 영향을 받지 않도록 직접 나눈다. */
export function formatDate(isoDate?: string) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${y}.${String(m).padStart(2, '0')}.${String(d).padStart(2, '0')} (${weekday})`;
}
