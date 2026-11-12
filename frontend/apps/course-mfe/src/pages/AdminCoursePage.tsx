import { useState } from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { CourseFormDialog } from '../components/CourseFormDialog';
import { Icon, ICONS } from '../components/ui';
import { useCourseAdmin } from '../hooks/useCourseAdmin';
import { AdminCourseEditPage } from './AdminCourseEditPage';
import { CourseListPage } from './CourseListPage';

/**
 * 과정 관리 화면 (FR-03). 목록은 임직원 목록(FR-01)을 표 모양으로 쓰고, 고르면 관리 화면을 연다.
 *
 * 관리 화면에서 돌아오면 목록을 새로 불러와 바뀐 제목·상태를 보여 준다 (D-10).
 */
export function AdminCoursePage() {
  const [selectedId, setSelectedId] = useState<number>();
  const [creating, setCreating] = useState(false);
  const admin = useCourseAdmin();

  if (selectedId !== undefined) {
    return <AdminCourseEditPage courseId={selectedId} onBack={() => setSelectedId(undefined)} />;
  }

  return (
    <>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 4, justifyContent: 'space-between', alignItems: { sm: 'flex-end' } }}
      >
        <Box>
          <Typography variant="overline" color="primary">
            Admin Console
          </Typography>
          <Typography variant="h4" component="h1">
            과정 관리
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            과정과 회차를 등록·수정하고, 끝난 과정은 종료합니다.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<Icon d={ICONS.plus} />}
          onClick={() => {
            admin.clearError();
            setCreating(true);
          }}
        >
          과정 등록
        </Button>
      </Stack>
      <CourseListPage variant="table" onSelect={setSelectedId} />
      <CourseFormDialog
        open={creating}
        saving={admin.saving}
        error={admin.error}
        onClose={() => setCreating(false)}
        onSubmit={async (req) => {
          const created = await admin.createCourse(req);
          if (created?.id !== undefined) {
            setCreating(false);
            setSelectedId(created.id); // 등록하면 바로 회차를 추가할 수 있게 관리 화면을 연다
          }
        }}
      />
    </>
  );
}
