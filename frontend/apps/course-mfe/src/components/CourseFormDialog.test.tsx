import { fireEvent, render, screen, within } from '@testing-library/react';
import { CourseFormDialog } from './CourseFormDialog';

test('제목·분류가 비어 있으면 onSubmit을 부르지 않고 안내한다', () => {
  const onSubmit = jest.fn();
  render(<CourseFormDialog open onSubmit={onSubmit} onClose={() => {}} />);

  fireEvent.click(screen.getByRole('button', { name: '등록' }));

  expect(onSubmit).not.toHaveBeenCalled();
  expect(screen.getByText('과정명을 입력하세요.')).toBeInTheDocument();
  expect(screen.getByText('분류를 고르세요.')).toBeInTheDocument();
});

test('입력값의 앞뒤 공백을 지우고, 빈 소개는 빼서 넘긴다', () => {
  const onSubmit = jest.fn();
  render(<CourseFormDialog open onSubmit={onSubmit} onClose={() => {}} />);

  fireEvent.change(screen.getByLabelText(/과정명/), { target: { value: '  JPA 기초 ' } });
  fireEvent.mouseDown(screen.getByRole('combobox'));
  fireEvent.click(within(screen.getByRole('listbox')).getByRole('option', { name: '데이터' }));
  fireEvent.click(screen.getByRole('button', { name: '등록' }));

  expect(onSubmit).toHaveBeenCalledWith({ title: 'JPA 기초', category: '데이터', description: undefined });
});

test('수정이면 현재 값을 채우고 버튼 이름이 저장이다', () => {
  render(
    <CourseFormDialog
      open
      initial={{ title: 'JPA', category: '개발', description: '설명' }}
      onSubmit={() => {}}
      onClose={() => {}}
    />,
  );

  expect(screen.getByRole('dialog', { name: '과정 수정' })).toBeInTheDocument();
  expect(screen.getByLabelText(/과정명/)).toHaveValue('JPA');
  expect(screen.getByLabelText(/과정 소개/)).toHaveValue('설명');
  expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
});
