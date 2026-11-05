import { useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
} from '@mui/material';
import { useCourses } from '../hooks/useCourses';

const PAGE_SIZE = 10;

// 분류 목록 API가 생기기 전까지는 화면에 고정한다
const CATEGORIES = ['개발', '데이터', '리더십', '공통'];

const STATUS_LABELS: Record<string, string> = {
  OPEN: '모집 중',
  CLOSED: '종료',
};

/** 과정 목록 화면 (FR-01). 데이터는 useCourses로만 가져오고 courseApi를 직접 부르지 않는다. */
export function CourseListPage() {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0); // MUI TablePagination도 0부터 시작
  const { data, loading, error } = useCourses({ keyword, category, page, size: PAGE_SIZE });

  if (error) return <Alert severity="error">과정 목록을 불러오지 못했습니다.</Alert>;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <TextField
          label="과정명 검색"
          value={keyword}
          fullWidth
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(0); // 검색어가 바뀌면 첫 페이지부터
          }}
        />
        <TextField
          select
          label="분류"
          value={category}
          sx={{ minWidth: 160 }}
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
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>과정명</TableCell>
              <TableCell>분류</TableCell>
              <TableCell>상태</TableCell>
              <TableCell align="right">회차 수</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.content?.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.title}</TableCell>
                <TableCell>{c.category}</TableCell>
                <TableCell>{c.status ? STATUS_LABELS[c.status] ?? c.status : ''}</TableCell>
                <TableCell align="right">{c.sessionCount}</TableCell>
              </TableRow>
            ))}
            {data?.content?.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
      <TablePagination
        component="div"
        count={data?.totalElements ?? 0}
        page={page}
        rowsPerPage={PAGE_SIZE}
        rowsPerPageOptions={[PAGE_SIZE]}
        onPageChange={(_, p) => setPage(p)}
      />
    </Stack>
  );
}
