import type { ReactNode } from 'react';
import { Box, Chip, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { categoryStyle, dateParts, STATUS } from '../courseLabels';

/** 화면 공통 작은 부품. 색은 theme와 courseLabels 값만 쓴다. */

export function Icon({ d, sx, fontSize = 'small' }: { d: string; sx?: SxProps<Theme>; fontSize?: 'small' | 'medium' | 'inherit' }) {
  return (
    <SvgIcon fontSize={fontSize} sx={sx}>
      <path d={d} />
    </SvgIcon>
  );
}

export const ICONS = {
  search: 'M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14',
  back: 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z',
  calendar: 'M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 16H5V10h14zm0-12H5V6h14z',
  place: 'M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7m0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5',
  people: 'M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3m-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3m0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13m8 0c-.29 0-.62.02-.97.05A4.2 4.2 0 0 1 17 16.5V19h6v-2.5c0-2.33-4.67-3.5-7-3.5',
  layers: 'm12 16.54-7.38-5.73L3 12.07l9 7 9-7-1.63-1.27zM12 14l7.36-5.73L21 7l-9-7-9 7 1.63 1.27z',
  plus: 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z',
  edit: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z',
  stop: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.9 7.9 0 0 1 4 12m8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.9 7.9 0 0 1 20 12c0 4.42-3.58 8-8 8',
  chevron: 'M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6z',
  lock: 'M18 8h-1V6A5 5 0 0 0 7 6v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2m-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4m3.1-9H8.9V6a3.1 3.1 0 0 1 6.2 0z',
  shield: 'M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5z',
};

/** 분류 칩 */
export function CategoryChip({ category, size = 'small' }: { category?: string; size?: 'small' | 'medium' }) {
  const c = categoryStyle(category);
  return <Chip label={category} size={size} sx={{ bgcolor: c.bg, color: c.fg }} />;
}

/** 상태 칩: 모집 중은 초록 점, 종료는 회색 */
export function StatusChip({ status, onDark }: { status?: string; onDark?: boolean }) {
  const s = status ? STATUS[status] : undefined;
  if (!s) return null;
  const open = s.color === 'success';
  return (
    <Chip
      size="small"
      label={s.label}
      icon={
        <Box
          component="span"
          sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: open ? 'success.main' : 'grey.400', ml: '8px !important' }}
        />
      }
      sx={
        onDark
          ? { bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', backdropFilter: 'blur(4px)', '& .MuiChip-icon': { mr: -0.25 } }
          : { bgcolor: open ? 'success.light' : 'grey.100', color: open ? 'success.dark' : 'text.secondary', '& .MuiChip-icon': { mr: -0.25 } }
      }
    />
  );
}

/** 분류 그라데이션 위에 아이콘과 은은한 무늬를 깐 배경 */
export function CategoryBackdrop({ category, children, sx }: { category?: string; children?: ReactNode; sx?: SxProps<Theme> }) {
  const c = categoryStyle(category);
  return (
    <Box
      sx={[
        {
          position: 'relative',
          overflow: 'hidden',
          background: c.gradient,
          color: '#fff',
          '&::before': {
            // 점 무늬
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)',
            backgroundSize: '14px 14px',
            maskImage: 'linear-gradient(120deg, transparent 30%, #000 100%)',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Icon
        d={c.icon}
        fontSize="inherit"
        sx={{ position: 'absolute', right: -12, bottom: -18, fontSize: 132, color: 'rgba(255,255,255,0.14)', transform: 'rotate(-8deg)' }}
      />
      <Box sx={{ position: 'relative' }}>{children}</Box>
    </Box>
  );
}

/** 회차 시작일을 달력 한 장처럼 보여 주는 블록 */
export function DateBlock({ date, muted }: { date?: string; muted?: boolean }) {
  const p = dateParts(date);
  if (!p) return null;
  return (
    <Box
      sx={{
        width: 60,
        flexShrink: 0,
        borderRadius: 2,
        overflow: 'hidden',
        textAlign: 'center',
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        opacity: muted ? 0.6 : 1,
      }}
    >
      <Box sx={{ bgcolor: muted ? 'grey.400' : 'primary.main', color: '#fff', fontSize: 11, fontWeight: 700, py: 0.25 }}>
        {p.month}
      </Box>
      <Typography sx={{ fontSize: 22, fontWeight: 800, lineHeight: 1.15, pt: 0.5, letterSpacing: '-0.03em' }}>{p.day}</Typography>
      <Typography sx={{ fontSize: 11, color: 'text.secondary', pb: 0.5 }}>{p.weekday}요일</Typography>
    </Box>
  );
}

/** 아이콘 + 짧은 정보 한 줄 */
export function Meta({ icon, children }: { icon: string; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', color: 'text.secondary', minWidth: 0 }}>
      <Icon d={icon} sx={{ fontSize: 16 }} />
      <Typography variant="body2" noWrap>
        {children}
      </Typography>
    </Stack>
  );
}

/** 결과가 없을 때 가운데에 놓는 안내 */
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <Stack sx={{ alignItems: 'center', textAlign: 'center', py: 8, px: 2 }} spacing={1}>
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: '20px',
          bgcolor: 'primary.light',
          color: 'primary.main',
          display: 'grid',
          placeItems: 'center',
          mb: 1,
        }}
      >
        <Icon d={ICONS.layers} fontSize="medium" />
      </Box>
      <Typography fontWeight={700}>{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  );
}

/** 섹션 제목 + 오른쪽 동작 */
export function SectionHeader({ title, count, action }: { title: string; count?: number; action?: ReactNode }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="h6" component="h3">
        {title}
        {count !== undefined && (
          <Box component="span" sx={{ ml: 1, color: 'primary.main' }}>
            {count}
          </Box>
        )}
      </Typography>
      {action}
    </Stack>
  );
}

/** 흰 카드 면 */
export function Surface({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return <Paper sx={[{ borderRadius: 4, overflow: 'hidden' }, ...(Array.isArray(sx) ? sx : [sx])]}>{children}</Paper>;
}
