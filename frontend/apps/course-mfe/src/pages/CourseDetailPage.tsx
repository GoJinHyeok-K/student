import { Alert, Box, Button, LinearProgress, Paper, Skeleton, Stack, Typography } from '@mui/material';
import type { CourseDetailResponse, SessionResponse } from '@eduhub/api-client';
import { formatDate } from '../courseLabels';
import { CategoryBackdrop, DateBlock, EmptyState, Icon, ICONS, Meta, SectionHeader, StatusChip } from '../components/ui';
import { useCourse } from '../hooks/useCourse';

interface CourseDetailPageProps {
  courseId: number;
  onBack: () => void;
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      aria-label="← 목록으로"
      startIcon={<Icon d={ICONS.back} />}
      color="inherit"
      sx={{ mb: 2, ml: -1, color: 'text.secondary', '&:hover': { color: 'text.primary', bgcolor: 'grey.100' } }}
    >
      목록으로
    </Button>
  );
}

/** 남은 자리 막대. 모집 중인데 자리가 없으면 '마감', 종료된 회차는 흐리게 */
function Seats({ session }: { session: SessionResponse }) {
  const capacity = session.capacity ?? 0;
  const remaining = session.remainingSeats ?? 0;
  const open = session.status === 'OPEN';
  const full = open && remaining === 0;
  const remainingRatio = capacity ? (remaining / capacity) * 100 : 0;
  const tone = full ? 'error' : open && remaining <= Math.ceil(capacity * 0.2) ? 'warning' : 'success';
  return (
    <Box sx={{ width: { xs: '100%', sm: 200 }, flexShrink: 0 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline', mb: 0.75 }}>
        <Typography variant="caption" color="text.secondary">
          남은 자리
        </Typography>
        <Typography fontWeight={700} sx={{ color: open ? `${tone}.main` : 'text.disabled' }}>
          {full ? '마감' : `${remaining}석`}
          <Typography component="span" variant="caption" color="text.secondary" fontWeight={500}>
            {' '}
            / {capacity}명
          </Typography>
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={open ? remainingRatio : 0}
        color={open ? tone : 'inherit'}
        aria-label="남은 자리 비율"
        sx={{ color: open ? undefined : 'grey.400' }}
      />
    </Box>
  );
}

function SessionItem({ session, index }: { session: SessionResponse; index: number }) {
  const open = session.status === 'OPEN';
  return (
    <Paper
      component="li"
      sx={{
        listStyle: 'none',
        p: 2.5,
        borderRadius: 4,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        gap: { xs: 2, sm: 3 },
        bgcolor: open ? 'background.paper' : 'grey.50',
        transition: 'border-color .15s',
        '&:hover': { borderColor: open ? 'primary.light' : 'divider' },
      }}
    >
      <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center', flexGrow: 1, minWidth: 0 }}>
        <DateBlock date={session.startDate} muted={!open} />
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
            <Typography fontWeight={700} sx={{ color: open ? 'text.primary' : 'text.secondary' }}>
              {index + 1}회차
            </Typography>
            <StatusChip status={session.status} />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ xs: 0.5, md: 2 }}>
            <Meta icon={ICONS.calendar}>{formatDate(session.startDate)}</Meta>
            <Meta icon={ICONS.place}>{session.place}</Meta>
            <Meta icon={ICONS.people}>정원 {session.capacity}명</Meta>
          </Stack>
        </Box>
      </Stack>
      <Seats session={session} />
    </Paper>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ flex: 1, minWidth: 120 }}>
      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>{value}</Typography>
    </Box>
  );
}

function CourseHero({ course }: { course: CourseDetailResponse }) {
  const sessions = course.sessions ?? [];
  const openSessions = sessions.filter((s) => s.status === 'OPEN');
  const next = openSessions[0]; // 백엔드가 시작일 순으로 준다
  const seats = openSessions.reduce((sum, s) => sum + (s.remainingSeats ?? 0), 0);
  return (
    <CategoryBackdrop
      category={course.category}
      sx={{ borderRadius: 5, px: { xs: 3, md: 5 }, pt: { xs: 3, md: 4.5 }, pb: { xs: 3, md: 4 }, mb: 4, filter: course.status === 'CLOSED' ? 'grayscale(0.8)' : undefined }}
    >
      <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'center' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, opacity: 0.9 }}>{course.category}</Typography>
        <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.6)' }} />
        <StatusChip status={course.status} onDark />
      </Stack>
      <Typography variant="h3" component="h2" sx={{ fontSize: { xs: 28, md: 38 }, maxWidth: 760 }}>
        {course.title}
      </Typography>
      <Typography sx={{ mt: 1.5, maxWidth: 720, whiteSpace: 'pre-line', lineHeight: 1.7, color: 'rgba(255,255,255,0.88)' }}>
        {course.description || '과정 소개가 없습니다.'}
      </Typography>
      <Stack
        direction="row"
        sx={{ mt: 4, pt: 3, borderTop: '1px solid rgba(255,255,255,0.2)', flexWrap: 'wrap', rowGap: 2, columnGap: 3 }}
      >
        <Stat label="전체 회차" value={`${sessions.length}회`} />
        <Stat label="모집 중인 회차" value={`${openSessions.length}회`} />
        <Stat label="가장 가까운 회차" value={next ? formatDate(next.startDate).slice(5) : '-'} />
        <Stat label="남은 자리 합계" value={`${seats}석`} />
      </Stack>
    </CategoryBackdrop>
  );
}

function DetailSkeleton() {
  return (
    <>
      <Skeleton variant="rounded" height={300} sx={{ borderRadius: 5, mb: 4 }} animation="wave" />
      <Skeleton width={160} height={32} sx={{ mb: 2 }} />
      {[0, 1].map((i) => (
        <Skeleton key={i} variant="rounded" height={104} sx={{ borderRadius: 4, mb: 1.5 }} animation="wave" />
      ))}
    </>
  );
}

/** 과정 상세 화면 (FR-02). 데이터는 useCourse로만 가져오고 courseApi를 직접 부르지 않는다. */
export function CourseDetailPage({ courseId, onBack }: CourseDetailPageProps) {
  const { data, loading, error, notFound } = useCourse(courseId);

  if (loading) {
    return (
      <>
        <BackButton onClick={onBack} />
        <DetailSkeleton />
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <BackButton onClick={onBack} />
        <Alert severity={notFound ? 'warning' : 'error'} sx={{ borderRadius: 3 }}>
          {notFound ? '과정을 찾을 수 없습니다.' : '과정 정보를 불러오지 못했습니다.'}
        </Alert>
      </>
    );
  }

  const sessions = data.sessions ?? [];

  return (
    <>
      <BackButton onClick={onBack} />
      <CourseHero course={data} />
      <SectionHeader title="회차 일정" count={sessions.length} />
      {sessions.length === 0 ? (
        <Paper sx={{ borderRadius: 4 }}>
          <EmptyState title="예정된 회차가 없습니다" description="회차가 열리면 이곳에 일정이 표시됩니다." />
        </Paper>
      ) : (
        <Stack component="ul" aria-label="회차 일정" spacing={1.5} sx={{ p: 0, m: 0 }}>
          {sessions.map((s, i) => (
            <SessionItem key={s.id} session={s} index={i} />
          ))}
        </Stack>
      )}
    </>
  );
}
