import { useEffect, useState } from 'react';
import type { PageResponseCourseSummaryResponse } from '@eduhub/api-client';
import { courseApi } from '../api/courseApi';

export interface UseCoursesParams {
  keyword?: string;
  category?: string;
  page: number; // 0부터 시작 (백엔드 Pageable, MUI TablePagination 모두 0부터). 바꾸지 않고 그대로 보낸다
  size: number;
}

/** 과정 목록(FR-01)을 불러오는 훅. 화면은 이 훅의 data·loading·error만 쓴다. */
export function useCourses({ keyword, category, page, size }: UseCoursesParams) {
  const [data, setData] = useState<PageResponseCourseSummaryResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    let ignore = false; // 검색어를 빠르게 바꿀 때, 늦게 도착한 이전 요청의 응답은 버린다
    setLoading(true);
    setError(undefined);

    courseApi
      .getCourses(keyword || undefined, category || undefined, page, size)
      .then((response) => {
        if (!ignore) setData(response.data);
      })
      .catch((e: unknown) => {
        if (!ignore) setError(e);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [keyword, category, page, size]);

  return { data, loading, error };
}
