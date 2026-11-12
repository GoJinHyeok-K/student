import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import type { SessionRequest } from '@eduhub/api-client';

interface SessionFormDialogProps {
  open: boolean;
  /** 수정할 때의 현재 값. 없으면 추가 */
  initial?: SessionRequest;
  saving?: boolean;
  error?: string;
  onSubmit: (request: SessionRequest) => void;
  onClose: () => void;
}

const MAX_CAPACITY = 1000; // D-10

/** 회차 추가·수정 입력 창 (FR-03). 검증 규칙은 백엔드 SessionRequest와 같다. */
export function SessionFormDialog({ open, initial, saving, error, onSubmit, onClose }: SessionFormDialogProps) {
  const [startDate, setStartDate] = useState('');
  const [place, setPlace] = useState('');
  const [capacity, setCapacity] = useState('');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setStartDate(initial?.startDate ?? '');
      setPlace(initial?.place ?? '');
      setCapacity(initial ? String(initial.capacity) : '');
      setTouched(false);
    }
  }, [open, initial]);

  const capacityNumber = Number(capacity);
  const errors = {
    startDate: startDate ? '' : '시작일을 고르세요.',
    place: !place.trim() ? '장소를 입력하세요.' : place.length > 100 ? '100자까지 입력할 수 있습니다.' : '',
    capacity:
      Number.isInteger(capacityNumber) && capacityNumber >= 1 && capacityNumber <= MAX_CAPACITY
        ? ''
        : `정원은 1~${MAX_CAPACITY}명으로 입력하세요.`,
  };

  const submit = () => {
    setTouched(true);
    if (errors.startDate || errors.place || errors.capacity) return;
    onSubmit({ startDate, place: place.trim(), capacity: capacityNumber });
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>{initial ? '회차 수정' : '회차 추가'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="시작일"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            error={touched && !!errors.startDate}
            helperText={touched && errors.startDate}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <TextField
            label="장소"
            required
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            error={touched && !!errors.place}
            helperText={touched && errors.place}
          />
          <TextField
            label="정원"
            type="number"
            required
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            error={touched && !!errors.capacity}
            helperText={touched && errors.capacity}
            slotProps={{ htmlInput: { min: 1, max: MAX_CAPACITY } }}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          취소
        </Button>
        <Button variant="contained" onClick={submit} disabled={saving}>
          {initial ? '저장' : '추가'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
