import { fireEvent, render, screen, within } from '@testing-library/react';
import { useCourse } from '../hooks/useCourse';
import { CourseDetailPage } from './CourseDetailPage';

// 화면 테스트는 훅을 mock한다. API 호출 방식은 useCourse.test.ts가 따로 검증한다
jest.mock('../hooks/useCourse');
const mockUseCourse = useCourse as jest.Mock;

const loaded = (overrides = {}) => ({
  data: {
    id: 1,
    title: 'JPA 기초',
    category: '개발',
    description: '엔티티 매핑과 연관관계',
    status: 'OPEN',
    sessions: [
      { id: 10, startDate: '2026-12-01', place: '본사 3층', capacity: 20, remainingSeats: 20, status: 'OPEN' },
      { id: 11, startDate: '2026-12-15', place: '온라인', capacity: 30, remainingSeats: 0, status: 'CLOSED' },
    ],
    ...overrides,
  },
  loading: false,
  error: undefined,
  notFound: false,
});

test('과정 정보와 회차 일정·정원·남은 자리를 보여 준다', () => {
  mockUseCourse.mockReturnValue(loaded());

  render(<CourseDetailPage courseId={1} onBack={() => {}} />);

  expect(screen.getByRole('heading', { name: 'JPA 기초' })).toBeInTheDocument();
  expect(screen.getByText('엔티티 매핑과 연관관계')).toBeInTheDocument();

  const rows = within(screen.getByRole('table', { name: '회차 일정' })).getAllByRole('row');
  expect(rows).toHaveLength(3); // 머리글 + 회차 2개
  expect(rows[1]).toHaveTextContent('2026.12.01 (화)');
  expect(rows[1]).toHaveTextContent('본사 3층');
  expect(rows[1]).toHaveTextContent('20명');
  expect(rows[1]).toHaveTextContent('20석');
  expect(rows[1]).toHaveTextContent('모집 중');
  expect(rows[2]).toHaveTextContent('종료');
});

test('모집 중인데 남은 자리가 없으면 마감으로 보여 준다', () => {
  mockUseCourse.mockReturnValue(
    loaded({
      sessions: [{ id: 10, startDate: '2026-12-01', place: 'A', capacity: 5, remainingSeats: 0, status: 'OPEN' }],
    }),
  );

  render(<CourseDetailPage courseId={1} onBack={() => {}} />);

  expect(screen.getByText('마감')).toBeInTheDocument();
});

test('회차가 없으면 안내 문구를 보여 준다', () => {
  mockUseCourse.mockReturnValue(loaded({ sessions: [] }));

  render(<CourseDetailPage courseId={1} onBack={() => {}} />);

  expect(screen.getByText('예정된 회차가 없습니다')).toBeInTheDocument();
});

test('없는 과정이면 찾을 수 없다고 알려 준다', () => {
  mockUseCourse.mockReturnValue({ data: undefined, loading: false, error: {}, notFound: true });

  render(<CourseDetailPage courseId={999} onBack={() => {}} />);

  expect(screen.getByRole('alert')).toHaveTextContent('과정을 찾을 수 없습니다.');
});

test('불러오기에 실패하면 에러 메시지를 보여 준다', () => {
  mockUseCourse.mockReturnValue({ data: undefined, loading: false, error: new Error('x'), notFound: false });

  render(<CourseDetailPage courseId={1} onBack={() => {}} />);

  expect(screen.getByRole('alert')).toHaveTextContent('과정 정보를 불러오지 못했습니다.');
});

test('목록으로 버튼을 누르면 onBack을 부른다', () => {
  mockUseCourse.mockReturnValue(loaded());
  const onBack = jest.fn();

  render(<CourseDetailPage courseId={1} onBack={onBack} />);
  fireEvent.click(screen.getByRole('button', { name: '← 목록으로' }));

  expect(onBack).toHaveBeenCalled();
});
