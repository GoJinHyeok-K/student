import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import type { CourseRequest } from '@eduhub/api-client';
import { CATEGORIES } from '../courseLabels';

interface CourseFormDialogProps {
  open: boolean;
  /** 수정할 때의 현재 값. 없으면 등록 */
  initial?: CourseRequest;
  saving?: boolean;
  /** 서버가 돌려준 실패 문구 */
  error?: string;
  onSubmit: (request: CourseRequest) => void;
  onClose: () => void;
}

const EMPTY: CourseRequest = { title: '', category: '', description: '' };

/** 과정 등록·수정 입력 창 (FR-03). 길이 제한은 백엔드 CourseRequest와 같다. */
export function CourseFormDialog({ open, initial, saving, error, onSubmit, onClose }: CourseFormDialogProps) {
  const [form, setForm] = useState<CourseRequest>(EMPTY);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY, ...initial, description: initial?.description ?? '' });
      setTouched(false);
    }
  }, [open, initial]);

  const titleError = !form.title.trim() ? '과정명을 입력하세요.' : form.title.length > 200 ? '200자까지 입력할 수 있습니다.' : '';
  const categoryError = !form.category ? '분류를 고르세요.' : '';
  // 고정 분류(D-08)에 없는 기존 값도 고를 수 있게 남겨 둔다
  const categories = form.category && !CATEGORIES.includes(form.category) ? [...CATEGORIES, form.category] : CATEGORIES;

  const submit = () => {
    setTouched(true);
    if (titleError || categoryError) return;
    onSubmit({ title: form.title.trim(), category: form.category, description: form.description?.trim() || undefined });
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? '과정 수정' : '과정 등록'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="과정명"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={touched && !!titleError}
            helperText={touched && titleError}
            autoFocus
          />
          <TextField
            select
            label="분류"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            error={touched && !!categoryError}
            helperText={touched && categoryError}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="과정 소개"
            multiline
            minRows={3}
            value={form.description ?? ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          취소
        </Button>
        <Button variant="contained" onClick={submit} disabled={saving}>
          {initial ? '저장' : '등록'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
