import { renderHook, waitFor } from '@testing-library/react';
import { courseApi } from '../api/courseApi';
import { useCourses } from './useCourses';

jest.mock('../api/courseApi', () => ({ courseApi: { getCourses: jest.fn() } }));
const getCourses = courseApi.getCourses as jest.Mock;

const pageOf = (titles: string[]) => ({
  data: {
    content: titles.map((title, i) => ({
      id: i + 1,
      title,
      category: '개발',
      status: 'OPEN',
      sessionCount: 1,
    })),
    page: 0,
    size: 10,
    totalElements: titles.length,
  },
});

beforeEach(() => getCourses.mockReset());

test('과정 목록을 불러와 data로 돌려준다', async () => {
  getCourses.mockResolvedValue(pageOf(['Spring Boot 실전', 'JPA 기초']));

  const { result } = renderHook(() => useCourses({ keyword: '', page: 0, size: 10 }));

  expect(result.current.loading).toBe(true);
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.data?.content?.map((c) => c.title)).toEqual(['Spring Boot 실전', 'JPA 기초']);
  expect(result.current.error).toBeUndefined();
});

test('API 호출이 실패하면 error를 돌려준다', async () => {
  getCourses.mockRejectedValue(new Error('Network Error'));

  const { result } = renderHook(() => useCourses({ keyword: '', page: 0, size: 10 }));

  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.data).toBeUndefined();
});
