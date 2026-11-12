import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { SessionResponse } from '@eduhub/api-client';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { CourseFormDialog } from '../components/CourseFormDialog';
import { SessionFormDialog } from '../components/SessionFormDialog';
import { categoryColor, formatDate, STATUS } from '../courseLabels';
import { useCourse } from '../hooks/useCourse';
import { useCourseAdmin } from '../hooks/useCourseAdmin';

interface AdminCourseEditPageProps {
  courseId: number;
  onBack: () => void;
}

/** 지금 열린 창. 한 번에 하나만 연다 */
type DialogState =
  | { kind: 'editCourse' }
  | { kind: 'closeCourse' }
  | { kind: 'addSession' }
  | { kind: 'editSession'; session: SessionResponse }
  | { kind: 'closeSession'; session: SessionResponse };

function StatusChip({ status }: { status?: string }) {
  const s = status ? STATUS[status] : undefined;
  if (!s) return null;
  return <Chip label={s.label} size="small" color={s.color} variant={s.color === 'success' ? 'filled' : 'outlined'} />;
}

/**
 * 과정 관리 화면 (FR-03). 과정 수정·종료와 회차 추가·수정·종료를 한 화면에서 한다.
 *
 * 종료된 과정·회차는 바꿀 수 없으므로 버튼을 숨긴다 (D-10). 서버도 같은 규칙으로 409를 돌려준다.
 */
export function AdminCourseEditPage({ courseId, onBack }: AdminCourseEditPageProps) {
  const { data, loading, error, notFound, reload } = useCourse(courseId);
  const admin = useCourseAdmin();
  const [dialog, setDialog] = useState<DialogState>();

  const open = (d: DialogState) => {
    admin.clearError();
    setDialog(d);
  };
  const close = () => setDialog(undefined);

  /** 저장이 성공하면 창을 닫고 다시 불러온다. 실패하면 창에 문구를 남긴다 */
  const save = async (call: Promise<unknown>) => {
    if ((await call) !== undefined) {
      close();
      reload();
    }
  };

  const backButton = (
    <Button onClick={onBack} sx={{ mb: 2, ml: -1 }}>
      ← 관리 목록으로
    </Button>
  );

  if (loading) {
    return (
      <>
        {backButton}
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        {backButton}
        <Alert severity={notFound ? 'warning' : 'error'}>
          {notFound ? '과정을 찾을 수 없습니다.' : '과정 정보를 불러오지 못했습니다.'}
        </Alert>
      </>
    );
  }

  const courseOpen = data.status === 'OPEN';
  const sessions = data.sessions ?? [];
  const color = categoryColor(data.category);

  return (
    <>
      {backButton}
      <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <Chip label={data.category} size="small" sx={{ bgcolor: color.bg, color: color.fg }} />
              <StatusChip status={data.status} />
            </Stack>
            <Typography variant="h5" component="h2" fontWeight={700}>
              {data.title}
            </Typography>
            <Typography color={data.description ? 'text.primary' : 'text.secondary'} sx={{ mt: 1.5, whiteSpace: 'pre-line' }}>
              {data.description || '과정 소개가 없습니다.'}
            </Typography>
          </Box>
          {courseOpen && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', flexShrink: 0 }}>
              <Button variant="outlined" onClick={() => open({ kind: 'editCourse' })}>
                과정 수정
              </Button>
              <Button variant="outlined" color="error" onClick={() => open({ kind: 'closeCourse' })}>
                과정 종료
              </Button>
            </Stack>
          )}
        </Stack>
        {!courseOpen && (
          <Alert severity="info" sx={{ mt: 2 }}>
            종료된 과정입니다. 과정과 회차를 더 바꿀 수 없습니다.
          </Alert>
        )}
      </Paper>

      <Paper sx={{ overflow: 'hidden' }}>
        <Stack direction="row" sx={{ px: 2, py: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" component="h3" fontWeight={700}>
            회차 일정{' '}
            <Typography component="span" color="text.secondary">
              {sessions.length}
            </Typography>
          </Typography>
          {courseOpen && (
            <Button variant="contained" size="small" onClick={() => open({ kind: 'addSession' })}>
              회차 추가
            </Button>
          )}
        </Stack>
        <TableContainer>
          <Table aria-label="회차 일정">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 160 }}>시작일</TableCell>
                <TableCell>장소</TableCell>
                <TableCell sx={{ width: 90 }} align="right">
                  정원
                </TableCell>
                <TableCell sx={{ width: 110 }}>상태</TableCell>
                <TableCell sx={{ width: 170 }} align="right">
                  관리
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell>{formatDate(s.startDate)}</TableCell>
                  <TableCell>{s.place}</TableCell>
                  <TableCell align="right">{s.capacity}명</TableCell>
                  <TableCell>
                    <StatusChip status={s.status} />
                  </TableCell>
                  <TableCell align="right">
                    {s.status === 'OPEN' && (
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          aria-label={`${formatDate(s.startDate)} 회차 수정`}
                          onClick={() => open({ kind: 'editSession', session: s })}
                        >
                          수정
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          aria-label={`${formatDate(s.startDate)} 회차 종료`}
                          onClick={() => open({ kind: 'closeSession', session: s })}
                        >
                          종료
                        </Button>
                      </Stack>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6, borderBottom: 0 }}>
                    <Typography fontWeight={600}>등록된 회차가 없습니다</Typography>
                    {courseOpen && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        회차 추가 버튼으로 일정을 등록하세요.
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <CourseFormDialog
        open={dialog?.kind === 'editCourse'}
        initial={{ title: data.title ?? '', category: data.category ?? '', description: data.description }}
        saving={admin.saving}
        error={admin.error}
        onClose={close}
        onSubmit={(req) => save(admin.updateCourse(courseId, req))}
      />
      <ConfirmDialog
        open={dialog?.kind === 'closeCourse'}
        title="과정 종료"
        message="과정을 종료하면 모집 중인 회차도 모두 종료되고 되돌릴 수 없습니다. 종료할까요?"
        confirmLabel="과정 종료"
        saving={admin.saving}
        error={admin.error}
        onClose={close}
        onConfirm={() => save(admin.closeCourse(courseId))}
      />
      <SessionFormDialog
        open={dialog?.kind === 'addSession' || dialog?.kind === 'editSession'}
        initial={
          dialog?.kind === 'editSession'
            ? { startDate: dialog.session.startDate ?? '', place: dialog.session.place ?? '', capacity: dialog.session.capacity ?? 1 }
            : undefined
        }
        saving={admin.saving}
        error={admin.error}
        onClose={close}
        onSubmit={(req) =>
          save(
            dialog?.kind === 'editSession'
              ? admin.updateSession(courseId, dialog.session.id!, req)
              : admin.addSession(courseId, req),
          )
        }
      />
      <ConfirmDialog
        open={dialog?.kind === 'closeSession'}
        title="회차 종료"
        message={
          dialog?.kind === 'closeSession'
            ? `${formatDate(dialog.session.startDate)} ${dialog.session.place} 회차를 종료할까요? 되돌릴 수 없습니다.`
            : ''
        }
        confirmLabel="회차 종료"
        saving={admin.saving}
        error={admin.error}
        onClose={close}
        onConfirm={() => dialog?.kind === 'closeSession' && save(admin.closeSession(courseId, dialog.session.id!))}
      />
    </>
  );
}
