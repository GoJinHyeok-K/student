import { createTheme } from '@mui/material/styles';

/** EduHub 공통 테마. 색·글꼴·모서리는 여기서만 정한다. */
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4F46E5', light: '#EEF2FF', dark: '#3730A3' },
    success: { main: '#059669', light: '#ECFDF5' },
    background: { default: '#F6F7FB', paper: '#FFFFFF' },
    text: { primary: '#111827', secondary: '#6B7280' },
    divider: '#E5E7EB',
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    subtitle2: { fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { border: '1px solid #E5E7EB' } },
    },
    MuiAppBar: {
      styleOverrides: { root: { border: 'none', borderBottom: '1px solid #E5E7EB' } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontSize: 13,
          fontWeight: 600,
          color: '#6B7280',
          backgroundColor: '#F9FAFB',
        },
      },
    },
    MuiChip: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});
