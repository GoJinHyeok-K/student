import { useCallback, useState } from 'react';
import type { CourseRequest, SessionRequest } from '@eduhub/api-client';
import { courseAdminApi } from '../api/courseApi';

/** 실패 응답(ProblemDetail)에서 사용자에게 보여 줄 문구를 꺼낸다. */
export function errorMessage(e: unknown): string {
  const response = (e as { response?: { status?: number; data?: { detail?: string } } })?.response;
  if (response?.status === 409) {
    return response.data?.detail ?? '종료된 과정·회차는 바꿀 수 없습니다.';
  }
  if (response?.status === 400) return '입력값을 다시 확인해 주세요.';
  if (response?.status === 404) return '과정 또는 회차를 찾을 수 없습니다.';
  return '저장하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}

/**
 * 관리자의 과정·회차 등록, 수정, 종료(FR-03)를 부르는 훅.
 *
 * 각 함수는 성공하면 응답 data를, 실패하면 undefined를 돌려주고 실패 문구를 error에 담는다.
 */
export function useCourseAdmin() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const run = useCallback(async <T,>(call: () => Promise<{ data: T }>): Promise<T | undefined> => {
    setSaving(true);
    setError(undefined);
    try {
      return (await call()).data;
    } catch (e) {
      setError(errorMessage(e));
      return undefined;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    saving,
    error,
    clearError: useCallback(() => setError(undefined), []),
    createCourse: (req: CourseRequest) => run(() => courseAdminApi.createCourse(req)),
    updateCourse: (courseId: number, req: CourseRequest) =>
      run(() => courseAdminApi.updateCourse(courseId, req)),
    closeCourse: (courseId: number) => run(() => courseAdminApi.closeCourse(courseId)),
    addSession: (courseId: number, req: SessionRequest) =>
      run(() => courseAdminApi.addSession(courseId, req)),
    updateSession: (courseId: number, sessionId: number, req: SessionRequest) =>
      run(() => courseAdminApi.updateSession(courseId, sessionId, req)),
    closeSession: (courseId: number, sessionId: number) =>
      run(() => courseAdminApi.closeSession(courseId, sessionId)),
  };
}
