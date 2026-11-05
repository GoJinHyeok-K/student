import { render, screen } from '@testing-library/react';
import { useCourses } from '../hooks/useCourses';
import { CourseListPage } from './CourseListPage';

// 화면 테스트는 훅을 mock한다. API 호출 방식은 useCourses.test.ts가 따로 검증한다
jest.mock('../hooks/useCourses');
const mockUseCourses = useCourses as jest.Mock;

test('과정 목록을 표로 보여 준다', () => {
  mockUseCourses.mockReturnValue({
    data: {
      content: [{ id: 1, title: 'JPA 기초', category: '개발', status: 'OPEN', sessionCount: 2 }],
      page: 0,
      size: 10,
      totalElements: 1,
    },
    loading: false,
    error: undefined,
  });

  render(<CourseListPage />);

  expect(screen.getByText('JPA 기초')).toBeInTheDocument();
  expect(screen.getByRole('cell', { name: '개발' })).toBeInTheDocument();
  expect(screen.getByText('모집 중')).toBeInTheDocument();
});

test('불러오기에 실패하면 에러 메시지를 보여 준다', () => {
  mockUseCourses.mockReturnValue({ data: undefined, loading: false, error: new Error('fail') });

  render(<CourseListPage />);

  expect(screen.getByRole('alert')).toHaveTextContent('과정 목록을 불러오지 못했습니다.');
});
