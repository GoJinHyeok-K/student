import { useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useCourses } from '../hooks/useCourses';

const PAGE_SIZE = 10;

// 분류 목록 API가 생기기 전까지는 화면에 고정한다 (D-08)
const CATEGORIES = ['개발', '데이터', '리더십', '공통'];

const CATEGORY_COLORS: Record<string, { bg: string; fg: string }> = {
  개발: { bg: '#EEF2FF', fg: '#4338CA' },
  데이터: { bg: '#ECFEFF', fg: '#0E7490' },
  리더십: { bg: '#FFF7ED', fg: '#C2410C' },
  공통: { bg: '#F3F4F6', fg: '#374151' },
};

const STATUS: Record<string, { label: string; color: 'success' | 'default' }> = {
  OPEN: { label: '모집 중', color: 'success' },
  CLOSED: { label: '종료', color: 'default' },
};

function SearchIcon() {
  return (
    <SvgIcon fontSize="small" sx={{ color: 'text.secondary' }}>
      <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14" />
    </SvgIcon>
  );
}

/** 과정 목록 화면 (FR-01). 데이터는 useCourses로만 가져오고 courseApi를 직접 부르지 않는다. */
export function CourseListPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0); // MUI TablePagination도 0부터 시작
  const { data, loading, error } = useCourses({ keyword, category, page, size: PAGE_SIZE });

  if (error) return <Alert severity="error">과정 목록을 불러오지 못했습니다.</Alert>;

  const courses = data?.content ?? [];
  const total = data?.totalElements ?? 0;

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ p: 2, alignItems: { sm: 'center' } }}
      >
        <TextField
          placeholder="과정명으로 검색"
          aria-label="과정명 검색"
          value={keyword}
          size="small"
          fullWidth
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(0); // 검색어가 바뀌면 첫 페이지부터
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          label="분류"
          value={category}
          size="small"
          sx={{ minWidth: { sm: 180 } }}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
        >
          <MenuItem value="">전체</MenuItem>
          {CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Box sx={{ px: 2, pb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">
          총 <b>{total}</b>개 과정
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={32} />
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>과정명</TableCell>
                <TableCell sx={{ width: 140 }}>분류</TableCell>
                <TableCell sx={{ width: 120 }}>상태</TableCell>
                <TableCell sx={{ width: 100 }} align="right">
                  회차 수
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((c) => {
                const status = c.status ? STATUS[c.status] : undefined;
                const color = (c.category && CATEGORY_COLORS[c.category]) || CATEGORY_COLORS['공통'];
                return (
                  <TableRow key={c.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell>
                      <Typography fontWeight={600}>{c.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.category}
                        size="small"
                        sx={{ bgcolor: color.bg, color: color.fg }}
                      />
                    </TableCell>
                    <TableCell>
                      {status && (
                        <Chip
                          label={status.label}
                          size="small"
                          color={status.color}
                          variant={status.color === 'success' ? 'filled' : 'outlined'}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography color={c.sessionCount ? 'text.primary' : 'text.secondary'}>
                        {c.sessionCount ?? 0}회
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
              {courses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 8, borderBottom: 0 }}>
                    <Typography fontWeight={600}>검색 결과가 없습니다</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      다른 검색어나 분류로 찾아보세요.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={PAGE_SIZE}
        rowsPerPageOptions={[PAGE_SIZE]}
        onPageChange={(_, p) => setPage(p)}
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} / 총 ${count}개`}
        sx={{ borderTop: 1, borderColor: 'divider' }}
      />
    </Paper>
  );
}
