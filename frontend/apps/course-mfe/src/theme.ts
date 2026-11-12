import { alpha, createTheme } from '@mui/material/styles';

/**
 * EduHub 디자인 토큰. 색·글꼴·모서리·그림자는 여기서만 정하고, 화면은 theme 값만 쓴다.
 *
 * 기준: 본문은 Pretendard, 주색은 인디고 계열, 면은 흰색 + 아주 옅은 회색 배경, 테두리는 1px 회색 선.
 */
const ink = {
  900: '#0B1220',
  700: '#1F2937',
  500: '#6B7280',
  400: '#9CA3AF',
  200: '#E5E7EB',
  100: '#F1F3F7',
  50: '#F7F8FB',
};

const brand = {
  main: '#4F46E5',
  dark: '#3730A3',
  light: '#EEF2FF',
};

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: brand.main, dark: brand.dark, light: brand.light, contrastText: '#FFFFFF' },
    success: { main: '#059669', light: '#ECFDF5', dark: '#047857' },
    warning: { main: '#D97706', light: '#FFFBEB' },
    error: { main: '#DC2626', light: '#FEF2F2' },
    background: { default: ink[50], paper: '#FFFFFF' },
    text: { primary: ink[900], secondary: ink[500], disabled: ink[400] },
    divider: ink[200],
    grey: { 50: ink[50], 100: ink[100], 200: ink[200], 400: ink[400], 500: ink[500], 700: ink[700], 900: ink[900] },
  },
  // sx의 borderRadius 숫자는 이 값의 배수다 (2 = 8px, 3 = 12px, 4 = 16px, 5 = 20px)
  shape: { borderRadius: 4 },
  typography: {
    fontFamily:
      '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
    h3: { fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.2 },
    h4: { fontWeight: 800, letterSpacing: '-0.025em' },
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.015em' },
    subtitle1: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle2: { fontWeight: 600 },
    body1: { letterSpacing: '-0.005em' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '-0.005em' },
    overline: { fontWeight: 700, letterSpacing: '0.08em' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
        '::selection': { background: alpha(brand.main, 0.18) },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { border: `1px solid ${ink[200]}`, backgroundImage: 'none' },
        rounded: { borderRadius: 12 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          border: 'none',
          borderBottom: `1px solid ${ink[200]}`,
          backgroundColor: alpha('#FFFFFF', 0.85),
          backdropFilter: 'saturate(180%) blur(12px)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, paddingInline: 16 },
        sizeLarge: { paddingBlock: 10, fontSize: 15 },
        containedPrimary: {
          boxShadow: `0 1px 2px ${alpha(brand.dark, 0.3)}, inset 0 1px 0 ${alpha('#FFFFFF', 0.15)}`,
          '&:hover': { backgroundColor: brand.dark },
        },
        outlined: { borderColor: ink[200], '&:hover': { borderColor: ink[400], backgroundColor: ink[50] } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
        sizeSmall: { height: 24, fontSize: 12 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: ink[200] },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: ink[400] },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1, borderColor: brand.main },
          '&.Mui-focused': { boxShadow: `0 0 0 4px ${alpha(brand.main, 0.12)}` },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: ink[100] },
        head: {
          fontSize: 12,
          fontWeight: 600,
          color: ink[500],
          backgroundColor: ink[50],
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        },
      },
    },
    MuiTab: {
      styleOverrides: { root: { textTransform: 'none', fontWeight: 600, fontSize: 15, minWidth: 0, paddingInline: 4, marginInline: 12 } },
    },
    MuiTabs: {
      styleOverrides: { indicator: { height: 3, borderRadius: '3px 3px 0 0' } },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16, border: 'none', boxShadow: '0 24px 48px -12px rgba(11,18,32,0.25)' },
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 700, fontSize: 18, paddingTop: 20 } } },
    MuiLinearProgress: {
      styleOverrides: { root: { height: 6, borderRadius: 999, backgroundColor: ink[100] }, bar: { borderRadius: 999 } },
    },
    MuiAlert: { styleOverrides: { root: { borderRadius: 12 } } },
    MuiTooltip: {
      styleOverrides: { tooltip: { backgroundColor: ink[900], fontSize: 12, borderRadius: 8 } },
    },
  },
});

/** 카드에 마우스를 올렸을 때의 그림자 */
export const hoverShadow = '0 12px 24px -8px rgba(11,18,32,0.12), 0 2px 6px -2px rgba(11,18,32,0.06)';
