import { useState } from 'react';
import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CourseListPage } from './pages/CourseListPage';

/**
 * 단독 실행용 레이아웃. 6주차에 shell이 생기면 헤더는 shell로 옮긴다.
 *
 * 화면 전환은 라우터 없이 선택한 과정 id 상태로 한다 (D-09). 목록은 숨기기만 하고 내리지 않아서 상세에서 돌아와도 검색어·페이지가 남는다.
 */
export function App() {
  const [selectedCourseId, setSelectedCourseId] = useState<number>();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="static" color="inherit" elevation={0}>
        <Toolbar sx={{ gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: 'primary.main',
              color: 'common.white',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
            }}
          >
            E
          </Box>
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            EduHub
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Box hidden={selectedCourseId !== undefined}>
          <Typography variant="h4" component="h1">
            교육과정
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
            듣고 싶은 과정을 찾아보세요. 과정명이나 분류로 검색할 수 있습니다.
          </Typography>
          <CourseListPage onSelect={setSelectedCourseId} />
        </Box>
        {selectedCourseId !== undefined && (
          <CourseDetailPage
            courseId={selectedCourseId}
            onBack={() => setSelectedCourseId(undefined)}
          />
        )}
      </Container>
    </Box>
  );
}
