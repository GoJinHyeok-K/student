import { useState } from 'react';
import {
  Alert,
  Box,
  ButtonBase,
  Chip,
  InputAdornment,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import type { CourseSummaryResponse } from '@eduhub/api-client';
import { CATEGORIES, categoryStyle } from '../courseLabels';
import { CategoryBackdrop, CategoryChip, EmptyState, Icon, ICONS, Meta, StatusChip } from '../components/ui';
import { useCourses } from '../hooks/useCourses';
import { hoverShadow } from '../theme';

const PAGE_SIZE = 9; // 카드 3열 x 3줄

interface CourseListPageProps {
  /** 과정을 고르면 부른다 (상세 또는 관리 화면으로 이동, FR-02·FR-03) */
  onSelect?: (courseId: number) => void;
  /** cards: 임직원용 카드 목록, table: 관리자용 표 */
  variant?: 'cards' | 'table';
}

/** 검색어와 분류 칩 */
function Filters({
  keyword,
  category,
  onKeyword,
  onCategory,
}: {
  keyword: string;
  category: string;
  onKeyword: (v: string) => void;
  onCategory: (v: string) => void;
}) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ alignItems: { md: 'center' }, mb: 3 }}>
      <TextField
        placeholder="과정명으로 검색"
        aria-label="과정명 검색"
        value={keyword}
        onChange={(e) => onKeyword(e.target.value)}
        sx={{ flex: 1, maxWidth: { md: 420 } }}
        slotProps={{
          input: {
            sx: { height: 46 },
            startAdornment: (
              <InputAdornment position="start">
                <Icon d={ICONS.search} sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          },
        }}
      />
      <Stack direction="row" role="group" aria-label="분류" sx={{ flexWrap: 'wrap', gap: 1 }}>
        {['', ...CATEGORIES].map((c) => {
          const selected = category === c;
          const style = c ? categoryStyle(c) : undefined;
          return (
            <Chip
              key={c || 'all'}
              label={c || '전체'}
              clickable
              aria-pressed={selected}
              onClick={() => onCategory(c)}
              sx={{
                height: 36,
                px: 0.5,
                fontSize: 14,
                borderRadius: 999,
                border: 1,
                transition: 'all .15s',
                ...(selected
                  ? { bgcolor: 'grey.900', color: '#fff', borderColor: 'grey.900', '&:hover': { bgcolor: 'grey.700' } }
                  : {
                      bgcolor: 'background.paper',
                      color: 'text.primary',
                      borderColor: 'divider',
                      '&:hover': { borderColor: style?.fg ?? 'grey.400', bgcolor: style?.bg ?? 'grey.50' },
                    }),
              }}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}

function CourseCard({ course, onSelect }: { course: CourseSummaryResponse; onSelect?: (id: number) => void }) {
  const closed = course.status === 'CLOSED';
  return (
    <ButtonBase
      aria-label={`${course.title} 자세히 보기`}
      onClick={() => course.id !== undefined && onSelect?.(course.id)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        textAlign: 'left',
        borderRadius: 4,
        overflow: 'hidden',
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        transition: 'transform .2s ease, box-shadow .2s ease, border-color .2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: hoverShadow, borderColor: 'transparent' },
        '&:hover .card-arrow': { transform: 'translateX(3px)', color: 'primary.main' },
        '&.Mui-focusVisible': { outline: '3px solid', outlineColor: 'primary.light', outlineOffset: 2 },
      }}
    >
      <CategoryBackdrop category={course.category} sx={{ height: 112, px: 2.5, py: 2, filter: closed ? 'grayscale(0.85)' : undefined }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, opacity: 0.9 }}>{course.category}</Typography>
          <StatusChip status={course.status} onDark />
        </Stack>
      </CategoryBackdrop>
      <Stack sx={{ p: 2.5, flexGrow: 1 }} spacing={2}>
        <Typography
          component="h3"
          sx={{
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: '-0.02em',
            lineHeight: 1.4,
            minHeight: '2.8em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: closed ? 'text.secondary' : 'text.primary',
          }}
        >
          {course.title}
        </Typography>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
          <Meta icon={ICONS.calendar}>{course.sessionCount ? `${course.sessionCount}개 회차` : '회차 준비 중'}</Meta>
          <Icon d={ICONS.chevron} sx={{ color: 'text.disabled', transition: 'all .2s' }} />
        </Stack>
      </Stack>
    </ButtonBase>
  );
}

function CardSkeletons() {
  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <Paper key={i} sx={{ borderRadius: 4, overflow: 'hidden' }}>
          <Skeleton variant="rectangular" height={112} animation="wave" />
          <Box sx={{ p: 2.5 }}>
            <Skeleton width="85%" height={26} />
            <Skeleton width="55%" height={26} />
            <Skeleton width="35%" sx={{ mt: 2 }} />
          </Box>
        </Paper>
      ))}
    </>
  );
}

function CourseTable({ courses, loading, onSelect }: { courses: CourseSummaryResponse[]; loading: boolean; onSelect?: (id: number) => void }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>과정명</TableCell>
            <TableCell sx={{ width: 120 }}>분류</TableCell>
            <TableCell sx={{ width: 120 }}>상태</TableCell>
            <TableCell sx={{ width: 100 }} align="right">
              회차 수
            </TableCell>
            <TableCell sx={{ width: 48 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 5 }, (_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton height={28} />
                  </TableCell>
                </TableRow>
              ))
            : courses.map((c) => (
                <TableRow
                  key={c.id}
                  hover
                  onClick={() => c.id !== undefined && onSelect?.(c.id)}
                  sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 }, '&:hover .row-arrow': { color: 'primary.main' } }}
                >
                  <TableCell>
                    <ButtonBase
                      onClick={(e) => {
                        e.stopPropagation();
                        if (c.id !== undefined) onSelect?.(c.id);
                      }}
                      sx={{ fontWeight: 600, fontSize: 15, textAlign: 'left', borderRadius: 1 }}
                    >
                      {c.title}
                    </ButtonBase>
                  </TableCell>
                  <TableCell>
                    <CategoryChip category={c.category} />
                  </TableCell>
                  <TableCell>
                    <StatusChip status={c.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Typography color={c.sessionCount ? 'text.primary' : 'text.secondary'}>{c.sessionCount ?? 0}회</Typography>
                  </TableCell>
                  <TableCell>
                    <Icon d={ICONS.chevron} sx={{ color: 'text.disabled', transition: 'color .15s' }} />
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

/** 과정 목록 화면 (FR-01). 데이터는 useCourses로만 가져오고 courseApi를 직접 부르지 않는다. */
export function CourseListPage({ onSelect, variant = 'cards' }: CourseListPageProps) {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(0); // 백엔드 페이지는 0부터, 화면의 Pagination은 1부터
  const { data, loading, error } = useCourses({ keyword, category, page, size: PAGE_SIZE });

  const courses = data?.content ?? [];
  const total = data?.totalElements ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <Box>
      <Filters
        keyword={keyword}
        category={category}
        onKeyword={(v) => {
          setKeyword(v);
          setPage(0); // 검색어가 바뀌면 첫 페이지부터
        }}
        onCategory={(v) => {
          setCategory(v);
          setPage(0);
        }}
      />

      {error ? (
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          과정 목록을 불러오지 못했습니다.
        </Alert>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            총 <Box component="b" sx={{ color: 'text.primary' }}>{total}</Box>개 과정
          </Typography>

          {!loading && courses.length === 0 ? (
            <Paper sx={{ borderRadius: 4 }}>
              <EmptyState title="검색 결과가 없습니다" description="다른 검색어나 분류로 찾아보세요." />
            </Paper>
          ) : variant === 'table' ? (
            <CourseTable courses={courses} loading={loading} onSelect={onSelect} />
          ) : (
            <Box
              sx={{
                display: 'grid',
                gap: 2.5,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              }}
            >
              {loading ? <CardSkeletons /> : courses.map((c) => <CourseCard key={c.id} course={c} onSelect={onSelect} />)}
            </Box>
          )}

          {pageCount > 1 && (
            <Stack sx={{ alignItems: 'center', mt: 4 }}>
              <Pagination
                count={pageCount}
                page={page + 1}
                onChange={(_, p) => setPage(p - 1)}
                shape="rounded"
                color="primary"
              />
            </Stack>
          )}
        </>
      )}
    </Box>
  );
}
