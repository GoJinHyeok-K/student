import { useState } from 'react';
import { AppBar, Avatar, Box, Chip, Container, Stack, Tab, Tabs, Toolbar, Typography } from '@mui/material';
import { Icon, ICONS } from './components/ui';
import { AdminCoursePage } from './pages/AdminCoursePage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { CourseListPage } from './pages/CourseListPage';

type Section = 'courses' | 'admin';

function Logo() {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #818CF8 0%, #4F46E5 50%, #3730A3 100%)',
          boxShadow: '0 4px 10px -2px rgba(79,70,229,0.45), inset 0 1px 0 rgba(255,255,255,0.3)',
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          fontWeight: 800,
          fontSize: 17,
          letterSpacing: '-0.04em',
        }}
      >
        E
      </Box>
      <Typography sx={{ fontWeight: 800, fontSize: 19, letterSpacing: '-0.03em' }}>
        EduHub
      </Typography>
    </Stack>
  );
}

/** 임직원 목록 위의 큰 머리말 */
function Hero() {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 5,
        px: { xs: 3, md: 6 },
        py: { xs: 4, md: 6 },
        mb: 4,
        color: '#fff',
        background:
          'radial-gradient(1200px 400px at 85% -20%, rgba(129,140,248,0.55), transparent 60%), radial-gradient(600px 300px at 0% 120%, rgba(34,211,238,0.35), transparent 60%), linear-gradient(135deg, #1E1B4B 0%, #312E81 45%, #4338CA 100%)',
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at 80% 20%, #000 0%, transparent 65%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 640 }}>
        <Chip
          label="2026 하반기 교육과정 모집 중"
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: '#E0E7FF', border: '1px solid rgba(255,255,255,0.2)', mb: 2.5 }}
        />
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: 30, md: 42 } }}>
          일하면서 자라는 시간,
          <br />
          EduHub에서 시작하세요
        </Typography>
        <Typography sx={{ mt: 2, color: 'rgba(224,231,255,0.85)', fontSize: { xs: 15, md: 17 }, lineHeight: 1.7 }}>
          개발·데이터·리더십까지, 사내 전문가가 만든 교육과정을 한곳에서 찾고 신청하세요.
        </Typography>
      </Box>
    </Box>
  );
}

/** 관리 화면 머리말 아래에 붙는 권한 안내 */
function AdminNotice() {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ alignItems: 'center', px: 2, py: 1.25, mb: 3, borderRadius: 3, bgcolor: 'warning.light', color: 'warning.main' }}
    >
      <Icon d={ICONS.shield} sx={{ fontSize: 18 }} />
      <Typography variant="body2" sx={{ color: '#92400E' }}>
        관리자 권한 검사는 로그인 기능(D-04)과 함께 붙습니다. 지금은 개발용으로 누구나 열 수 있습니다.
      </Typography>
    </Stack>
  );
}

/**
 * 단독 실행용 레이아웃. 6주차에 shell이 생기면 헤더는 shell로 옮긴다.
 *
 * 화면 전환은 라우터 없이 상태로 한다 (D-09). 임직원 목록은 숨기기만 하고 내리지 않아서 상세에서 돌아와도 검색어·페이지가 남는다.
 * '과정 관리'(FR-03)는 인증(D-04)이 붙기 전까지 누구나 열 수 있다 (D-10).
 */
export function App() {
  const [section, setSection] = useState<Section>('courses');
  const [selectedCourseId, setSelectedCourseId] = useState<number>();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 3, minHeight: { xs: 60, md: 64 } }}>
            <Logo />
            <Tabs
              value={section}
              onChange={(_, v: Section) => setSection(v)}
              sx={{ alignSelf: 'stretch', '& .MuiTab-root': { minHeight: { xs: 60, md: 64 } } }}
            >
              <Tab label="교육과정" value="courses" />
              <Tab label="과정 관리" value="admin" />
            </Tabs>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', display: { xs: 'none', sm: 'flex' } }}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                  게스트
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  로그인 준비 중
                </Typography>
              </Box>
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.light', color: 'primary.main', fontSize: 14, fontWeight: 700 }}>
                G
              </Avatar>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, flexGrow: 1 }}>
        <Box hidden={section !== 'courses'}>
          <Box hidden={selectedCourseId !== undefined}>
            <Hero />
            {/* 관리 화면에서 바꾼 내용이 보이도록 탭을 오갈 때 목록을 다시 불러온다 */}
            {section === 'courses' && <CourseListPage onSelect={setSelectedCourseId} />}
          </Box>
          {selectedCourseId !== undefined && (
            <CourseDetailPage courseId={selectedCourseId} onBack={() => setSelectedCourseId(undefined)} />
          )}
        </Box>
        {section === 'admin' && (
          <>
            <AdminNotice />
            <AdminCoursePage />
          </>
        )}
      </Container>

      <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ py: 3, justifyContent: 'space-between', color: 'text.secondary' }}
          >
            <Typography variant="body2">© 2026 EduHub · 사내 교육과정 조회·수강 신청</Typography>
            <Typography variant="body2">문의: 인재개발팀</Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
