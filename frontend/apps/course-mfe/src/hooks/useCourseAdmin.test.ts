import { act, renderHook } from '@testing-library/react';
import { courseAdminApi } from '../api/courseApi';
import { errorMessage, useCourseAdmin } from './useCourseAdmin';

jest.mock('../api/courseApi', () => ({
  courseAdminApi: {
    createCourse: jest.fn(),
    updateCourse: jest.fn(),
    closeCourse: jest.fn(),
    addSession: jest.fn(),
    updateSession: jest.fn(),
    closeSession: jest.fn(),
  },
}));
const api = courseAdminApi as jest.Mocked<typeof courseAdminApi>;

beforeEach(() => jest.resetAllMocks());

test('성공하면 응답 data를 돌려주고 error는 비어 있다', async () => {
  api.createCourse.mockResolvedValue({ data: { id: 7, title: 'JPA' } } as never);
  const { result } = renderHook(() => useCourseAdmin());

  let created: unknown;
  await act(async () => {
    created = await result.current.createCourse({ title: 'JPA', category: '개발' });
  });

  expect(api.createCourse).toHaveBeenCalledWith({ title: 'JPA', category: '개발' });
  expect(created).toEqual({ id: 7, title: 'JPA' });
  expect(result.current.error).toBeUndefined();
  expect(result.current.saving).toBe(false);
});

test('경로 값과 본문을 순서대로 넘긴다', async () => {
  api.updateSession.mockResolvedValue({ data: {} } as never);
  api.closeSession.mockResolvedValue({ data: {} } as never);
  const { result } = renderHook(() => useCourseAdmin());
  const req = { startDate: '2026-12-01', place: '본사', capacity: 20 };

  await act(async () => {
    await result.current.updateSession(7, 3, req);
    await result.current.closeSession(7, 3);
  });

  expect(api.updateSession).toHaveBeenCalledWith(7, 3, req);
  expect(api.closeSession).toHaveBeenCalledWith(7, 3);
});

test('409면 서버 문구를 error에 담고 undefined를 돌려준다', async () => {
  api.closeCourse.mockRejectedValue({ response: { status: 409, data: { detail: '종료된 과정은 바꿀 수 없습니다: id=7' } } });
  const { result } = renderHook(() => useCourseAdmin());

  let closed: unknown = 'not-called';
  await act(async () => {
    closed = await result.current.closeCourse(7);
  });

  expect(closed).toBeUndefined();
  expect(result.current.error).toBe('종료된 과정은 바꿀 수 없습니다: id=7');

  act(() => result.current.clearError());
  expect(result.current.error).toBeUndefined();
});

test('실패 종류별 문구', () => {
  expect(errorMessage({ response: { status: 400 } })).toBe('입력값을 다시 확인해 주세요.');
  expect(errorMessage({ response: { status: 404 } })).toBe('과정 또는 회차를 찾을 수 없습니다.');
  expect(errorMessage(new Error('Network Error'))).toBe('저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
});
