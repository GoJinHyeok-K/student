import { useEffect, useState } from 'react';
import type { CourseDetailResponse } from '@eduhub/api-client';
import { courseApi } from '../api/courseApi';

/** 과정 상세와 회차 목록(FR-02)을 불러오는 훅. 화면은 이 훅의 data·loading·error·notFound만 쓴다. */
export function useCourse(id: number) {
  const [data, setData] = useState<CourseDetailResponse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>();

  useEffect(() => {
    let ignore = false; // 다른 과정으로 빠르게 옮길 때, 늦게 도착한 이전 응답은 버린다
    setLoading(true);
    setError(undefined);
    setData(undefined);

    courseApi
      .getCourse(id)
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
  }, [id]);

  // 백엔드는 없는 과정에 404 ProblemDetail을 돌려준다
  const notFound = (error as { response?: { status?: number } } | undefined)?.response?.status === 404;

  return { data, loading, error, notFound };
}
