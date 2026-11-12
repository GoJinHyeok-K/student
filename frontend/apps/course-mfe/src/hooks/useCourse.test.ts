import { renderHook, waitFor } from '@testing-library/react';
import { courseApi } from '../api/courseApi';
import { useCourse } from './useCourse';

jest.mock('../api/courseApi', () => ({ courseApi: { getCourse: jest.fn() } }));
const getCourse = courseApi.getCourse as jest.Mock;

beforeEach(() => getCourse.mockReset());

test('과정 상세를 불러와 data로 돌려준다', async () => {
  getCourse.mockResolvedValue({
    data: { id: 7, title: 'JPA 기초', category: '개발', status: 'OPEN', sessions: [] },
  });

  const { result } = renderHook(() => useCourse(7));

  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(getCourse).toHaveBeenCalledWith(7);
  expect(result.current.data?.title).toBe('JPA 기초');
  expect(result.current.notFound).toBe(false);
});

test('없는 과정이면 notFound가 true다', async () => {
  getCourse.mockRejectedValue({ response: { status: 404 } });

  const { result } = renderHook(() => useCourse(999));

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.notFound).toBe(true);
  expect(result.current.data).toBeUndefined();
});

test('그 밖의 실패는 error만 돌려준다', async () => {
  getCourse.mockRejectedValue(new Error('Network Error'));

  const { result } = renderHook(() => useCourse(1));

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.notFound).toBe(false);
});
