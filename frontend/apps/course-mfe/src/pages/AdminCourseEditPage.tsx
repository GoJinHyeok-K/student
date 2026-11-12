import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Skeleton,
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
import { CategoryBackdrop, DateBlock, EmptyState, Icon, ICONS, SectionHeader, StatusChip } from '../components/ui';
import { formatDate } from '../courseLabels';
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
    <Button
      onClick={onBack}
      startIcon={<Icon d={ICONS.back} />}
      color="inherit"
      sx={{ mb: 2, ml: -1, color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'grey.100' } }}
    >
      관리 목록으로
    </Button>
  );

  if (loading) {
    return (
      <>
        {backButton}
        <Skeleton variant="rounded" height={180} sx={{ borderRadius: 5, mb: 4 }} animation="wave" />
        <Skeleton variant="rounded" height={220} sx={{ borderRadius: 4 }} animation="wave" />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        {backButton}
        <Alert severity={notFound ? 'warning' : 'error'} sx={{ borderRadius: 3 }}>
          {notFound ? '과정을 찾을 수 없습니다.' : '과정 정보를 불러오지 못했습니다.'}
        </Alert>
      </>
    );
  }

  const courseOpen = data.status === 'OPEN';
  const sessions = data.sessions ?? [];

  return (
    <>
      {backButton}
      <CategoryBackdrop
        category={data.category}
        sx={{ borderRadius: 5, px: { xs: 3, md: 4 }, py: { xs: 3, md: 3.5 }, mb: 4, filter: courseOpen ? undefined : 'grayscale(0.8)' }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, opacity: 0.9 }}>{data.category}</Typography>
              <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.6)' }} />
              <StatusChip status={data.status} onDark />
            </Stack>
            <Typography variant="h4" component="h2" sx={{ fontSize: { xs: 26, md: 32 } }}>
              {data.title}
            </Typography>
            <Typography sx={{ mt: 1, whiteSpace: 'pre-line', color: 'rgba(255,255,255,0.85)', maxWidth: 680 }}>
              {data.description || '과정 소개가 없습니다.'}
            </Typography>
          </Box>
          {courseOpen && (
            <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', flexShrink: 0 }}>
              <Button
                variant="contained"
                startIcon={<Icon d={ICONS.edit} />}
                onClick={() => open({ kind: 'editCourse' })}
                sx={{ bgcolor: '#fff', color: 'grey.900', boxShadow: 'none', '&:hover': { bgcolor: 'grey.100' } }}
              >
                과정 수정
              </Button>
              <Button
                variant="outlined"
                startIcon={<Icon d={ICONS.stop} />}
                onClick={() => open({ kind: 'closeCourse' })}
                sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                과정 종료
              </Button>
            </Stack>
          )}
        </Stack>
      </CategoryBackdrop>

      {!courseOpen && (
        <Alert severity="info" icon={<Icon d={ICONS.lock} />} sx={{ mb: 3, borderRadius: 3 }}>
          종료된 과정입니다. 과정과 회차를 더 바꿀 수 없습니다.
        </Alert>
      )}

      <SectionHeader
        title="회차 일정"
        count={sessions.length}
        action={
          courseOpen && (
            <Button variant="contained" startIcon={<Icon d={ICONS.plus} />} onClick={() => open({ kind: 'addSession' })}>
              회차 추가
            </Button>
          )
        }
      />
      <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
        <Table aria-label="회차 일정">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 96 }}>일정</TableCell>
              <TableCell>장소</TableCell>
              <TableCell sx={{ width: 90 }} align="right">
                정원
              </TableCell>
              <TableCell sx={{ width: 110 }}>상태</TableCell>
              <TableCell sx={{ width: 190 }} align="right">
                관리
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((s) => {
              const sessionOpen = s.status === 'OPEN';
              return (
                <TableRow key={s.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell>
                    <DateBlock date={s.startDate} muted={!sessionOpen} />
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={600} color={sessionOpen ? 'text.primary' : 'text.secondary'}>
                      {s.place}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(s.startDate)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{s.capacity}명</TableCell>
                  <TableCell>
                    <StatusChip status={s.status} />
                  </TableCell>
                  <TableCell align="right">
                    {sessionOpen && (
                      <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
                        <Button
                          size="small"
                          variant="outlined"
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
              );
            })}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ borderBottom: 0 }}>
                  <EmptyState
                    title="등록된 회차가 없습니다"
                    description={courseOpen ? '회차 추가 버튼으로 일정을 등록하세요.' : undefined}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
