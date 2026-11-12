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
import { categoryColor, formatDate, STATUS } from '../courseLabels';
import { useCourse } from '../hooks/useCourse';

interface CourseDetailPageProps {
  courseId: number;
  onBack: () => void;
}

function StatusChip({ status }: { status?: string }) {
  const s = status ? STATUS[status] : undefined;
  if (!s) return null;
  return (
    <Chip
      label={s.label}
      size="small"
      color={s.color}
      variant={s.color === 'success' ? 'filled' : 'outlined'}
    />
  );
}

/** 남은 자리. 모집 중인데 자리가 없으면 '마감'으로 강조하고, 종료된 회차는 흐리게 보여 준다. */
function RemainingSeats({ session }: { session: SessionResponse }) {
  const remaining = session.remainingSeats ?? 0;
  const open = session.status === 'OPEN';
  const full = open && remaining === 0;
  return (
    <Typography
      component="span"
      fontWeight={600}
      color={full ? 'error.main' : open ? 'success.main' : 'text.secondary'}
    >
      {full ? '마감' : `${remaining}석`}
    </Typography>
  );
}

/** 과정 상세 화면 (FR-02). 데이터는 useCourse로만 가져오고 courseApi를 직접 부르지 않는다. */
export function CourseDetailPage({ courseId, onBack }: CourseDetailPageProps) {
  const { data, loading, error, notFound } = useCourse(courseId);

  const backButton = (
    <Button onClick={onBack} sx={{ mb: 2, ml: -1 }}>
      ← 목록으로
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

  const sessions = data.sessions ?? [];
  const color = categoryColor(data.category);

  return (
    <>
      {backButton}
      <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 3 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
          <Chip label={data.category} size="small" sx={{ bgcolor: color.bg, color: color.fg }} />
          <StatusChip status={data.status} />
        </Stack>
        <Typography variant="h5" component="h2" fontWeight={700}>
          {data.title}
        </Typography>
        <Typography
          color={data.description ? 'text.primary' : 'text.secondary'}
          sx={{ mt: 1.5, whiteSpace: 'pre-line' }}
        >
          {data.description || '과정 소개가 없습니다.'}
        </Typography>
      </Paper>

      <Paper sx={{ overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" component="h3" fontWeight={700}>
            회차 일정{' '}
            <Typography component="span" color="text.secondary">
              {sessions.length}
            </Typography>
          </Typography>
        </Box>
        <TableContainer>
          <Table aria-label="회차 일정">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 80 }}>회차</TableCell>
                <TableCell sx={{ width: 160 }}>시작일</TableCell>
                <TableCell>장소</TableCell>
                <TableCell sx={{ width: 90 }} align="right">
                  정원
                </TableCell>
                <TableCell sx={{ width: 100 }} align="right">
                  남은 자리
                </TableCell>
                <TableCell sx={{ width: 110 }}>상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((s, i) => (
                <TableRow key={s.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell>{i + 1}회차</TableCell>
                  <TableCell>{formatDate(s.startDate)}</TableCell>
                  <TableCell>{s.place}</TableCell>
                  <TableCell align="right">{s.capacity}명</TableCell>
                  <TableCell align="right">
                    <RemainingSeats session={s} />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={s.status} />
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, borderBottom: 0 }}>
                    <Typography fontWeight={600}>예정된 회차가 없습니다</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
