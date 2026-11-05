import { AppBar, Box, Container, Toolbar, Typography } from '@mui/material';
import { CourseListPage } from './pages/CourseListPage';

/** 단독 실행용 레이아웃. 6주차에 shell이 생기면 헤더는 shell로 옮긴다. */
export function App() {
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
        <Typography variant="h4" component="h1">
          교육과정
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
          듣고 싶은 과정을 찾아보세요. 과정명이나 분류로 검색할 수 있습니다.
        </Typography>
        <CourseListPage />
      </Container>
    </Box>
  );
}
