import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { useCourse } from '../hooks/useCourse';
import { useCourseAdmin } from '../hooks/useCourseAdmin';
import { AdminCourseEditPage } from './AdminCourseEditPage';

// 화면 테스트는 훅을 mock한다. API 호출 방식은 훅 테스트가 따로 검증한다
jest.mock('../hooks/useCourse');
jest.mock('../hooks/useCourseAdmin');
const mockUseCourse = useCourse as jest.Mock;
const mockUseCourseAdmin = useCourseAdmin as jest.Mock;

const reload = jest.fn();
const admin = {
  saving: false,
  error: undefined as string | undefined,
  clearError: jest.fn(),
  createCourse: jest.fn(),
  updateCourse: jest.fn(),
  closeCourse: jest.fn(),
  addSession: jest.fn(),
  updateSession: jest.fn(),
  closeSession: jest.fn(),
};

const course = (overrides = {}) => ({
  id: 1,
  title: 'JPA 기초',
  category: '개발',
  description: '설명',
  status: 'OPEN',
  sessions: [{ id: 10, startDate: '2026-12-01', place: '본사', capacity: 20, remainingSeats: 20, status: 'OPEN' }],
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  admin.error = undefined;
  mockUseCourseAdmin.mockReturnValue(admin);
  mockUseCourse.mockReturnValue({ data: course(), loading: false, error: undefined, notFound: false, reload });
});

test('회차를 추가하면 입력값으로 addSession을 부르고 성공하면 다시 불러온다', async () => {
  admin.addSession.mockResolvedValue({ id: 11 });
  render(<AdminCourseEditPage courseId={1} onBack={() => {}} />);

  fireEvent.click(screen.getByRole('button', { name: '회차 추가' }));
  const dialog = screen.getByRole('dialog', { name: '회차 추가' });
  fireEvent.change(within(dialog).getByLabelText(/시작일/), { target: { value: '2026-12-15' } });
  fireEvent.change(within(dialog).getByLabelText(/장소/), { target: { value: ' 온라인 ' } });
  fireEvent.change(within(dialog).getByLabelText(/정원/), { target: { value: '30' } });
  fireEvent.click(within(dialog).getByRole('button', { name: '추가' }));

  await waitFor(() => expect(reload).toHaveBeenCalled());
  expect(admin.addSession).toHaveBeenCalledWith(1, { startDate: '2026-12-15', place: '온라인', capacity: 30 });
});

test('회차 입력값이 잘못되면 부르지 않고 안내한다', () => {
  render(<AdminCourseEditPage courseId={1} onBack={() => {}} />);

  fireEvent.click(screen.getByRole('button', { name: '회차 추가' }));
  const dialog = screen.getByRole('dialog', { name: '회차 추가' });
  fireEvent.change(within(dialog).getByLabelText(/정원/), { target: { value: '0' } });
  fireEvent.click(within(dialog).getByRole('button', { name: '추가' }));

  expect(admin.addSession).not.toHaveBeenCalled();
  expect(within(dialog).getByText('시작일을 고르세요.')).toBeInTheDocument();
  expect(within(dialog).getByText('정원은 1~1000명으로 입력하세요.')).toBeInTheDocument();
});

test('회차 수정 창은 현재 값으로 채워지고 updateSession을 부른다', async () => {
  admin.updateSession.mockResolvedValue({ id: 10 });
  render(<AdminCourseEditPage courseId={1} onBack={() => {}} />);

  fireEvent.click(screen.getByRole('button', { name: '2026.12.01 (화) 회차 수정' }));
  const dialog = screen.getByRole('dialog', { name: '회차 수정' });
  expect(within(dialog).getByLabelText(/장소/)).toHaveValue('본사');
  fireEvent.change(within(dialog).getByLabelText(/정원/), { target: { value: '25' } });
  fireEvent.click(within(dialog).getByRole('button', { name: '저장' }));

  await waitFor(() => expect(admin.updateSession).toHaveBeenCalledWith(1, 10, { startDate: '2026-12-01', place: '본사', capacity: 25 }));
});

test('과정 종료는 확인을 거쳐 closeCourse를 부른다', async () => {
  admin.closeCourse.mockResolvedValue({ id: 1, status: 'CLOSED' });
  render(<AdminCourseEditPage courseId={1} onBack={() => {}} />);

  fireEvent.click(screen.getByRole('button', { name: '과정 종료' }));
  expect(admin.closeCourse).not.toHaveBeenCalled();
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '과정 종료' }));

  await waitFor(() => expect(reload).toHaveBeenCalled());
  expect(admin.closeCourse).toHaveBeenCalledWith(1);
});

test('저장에 실패하면 창을 닫지 않고 서버 문구를 보여 준다', async () => {
  admin.closeSession.mockResolvedValue(undefined);
  admin.error = '종료된 회차는 바꿀 수 없습니다';
  render(<AdminCourseEditPage courseId={1} onBack={() => {}} />);

  fireEvent.click(screen.getByRole('button', { name: '2026.12.01 (화) 회차 종료' }));
  const dialog = screen.getByRole('dialog', { name: '회차 종료' });
  fireEvent.click(within(dialog).getByRole('button', { name: '회차 종료' }));

  await waitFor(() => expect(admin.closeSession).toHaveBeenCalledWith(1, 10));
  expect(reload).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog', { name: '회차 종료' })).toBeInTheDocument();
  expect(within(dialog).getByText('종료된 회차는 바꿀 수 없습니다')).toBeInTheDocument();
});

test('종료된 과정은 수정·종료·회차 버튼을 숨긴다', () => {
  mockUseCourse.mockReturnValue({
    data: course({ status: 'CLOSED', sessions: [{ id: 10, startDate: '2026-12-01', place: '본사', capacity: 20, status: 'CLOSED' }] }),
    loading: false,
    error: undefined,
    notFound: false,
    reload,
  });
  render(<AdminCourseEditPage courseId={1} onBack={() => {}} />);

  expect(screen.getByText('종료된 과정입니다. 과정과 회차를 더 바꿀 수 없습니다.')).toBeInTheDocument();
  for (const name of ['과정 수정', '과정 종료', '회차 추가', '수정', '종료']) {
    expect(screen.queryByRole('button', { name })).not.toBeInTheDocument();
  }
});
