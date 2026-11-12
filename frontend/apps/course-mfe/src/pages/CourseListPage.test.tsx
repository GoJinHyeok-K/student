import { fireEvent, render, screen } from '@testing-library/react';
import { useCourses } from '../hooks/useCourses';
import { CourseListPage } from './CourseListPage';

// 화면 테스트는 훅을 mock한다. API 호출 방식은 useCourses.test.ts가 따로 검증한다
jest.mock('../hooks/useCourses');
const mockUseCourses = useCourses as jest.Mock;

const loaded = (content = [{ id: 7, title: 'JPA 기초', category: '개발', status: 'OPEN', sessionCount: 2 }]) => ({
  data: { content, page: 0, size: 9, totalElements: content.length },
  loading: false,
  error: undefined,
});

beforeEach(() => mockUseCourses.mockReset());

test('임직원용은 과정을 카드로 보여 주고, 카드를 누르면 onSelect에 id를 넘긴다', () => {
  mockUseCourses.mockReturnValue(loaded());
  const onSelect = jest.fn();

  render(<CourseListPage onSelect={onSelect} />);

  expect(screen.getByRole('heading', { name: 'JPA 기초' })).toBeInTheDocument();
  expect(screen.getByText('모집 중')).toBeInTheDocument();
  expect(screen.getByText('2개 회차')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'JPA 기초 자세히 보기' }));
  expect(onSelect).toHaveBeenCalledWith(7);
});

test('관리자용 표에서는 과정명을 누르면 onSelect에 id를 한 번 넘긴다', () => {
  mockUseCourses.mockReturnValue(loaded());
  const onSelect = jest.fn();

  render(<CourseListPage variant="table" onSelect={onSelect} />);

  expect(screen.getByRole('cell', { name: '개발' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'JPA 기초' }));
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(onSelect).toHaveBeenCalledWith(7);
});

test('분류 칩을 누르면 그 분류로 첫 페이지부터 다시 조회한다', () => {
  mockUseCourses.mockReturnValue(loaded());

  render(<CourseListPage />);
  fireEvent.click(screen.getByRole('button', { name: '데이터' }));

  expect(mockUseCourses).toHaveBeenLastCalledWith({ keyword: '', category: '데이터', page: 0, size: 9 });
  expect(screen.getByRole('button', { name: '데이터' })).toHaveAttribute('aria-pressed', 'true');
});

test('결과가 없으면 안내 문구를 보여 준다', () => {
  mockUseCourses.mockReturnValue(loaded([]));

  render(<CourseListPage />);

  expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument();
});

test('불러오기에 실패하면 에러 메시지를 보여 준다', () => {
  mockUseCourses.mockReturnValue({ data: undefined, loading: false, error: new Error('fail') });

  render(<CourseListPage />);

  expect(screen.getByRole('alert')).toHaveTextContent('과정 목록을 불러오지 못했습니다.');
});
