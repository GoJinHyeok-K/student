import { Alert, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  saving?: boolean;
  error?: string;
  onConfirm: () => void;
  onClose: () => void;
}

/** 되돌릴 수 없는 작업(과정·회차 종료) 전에 한 번 더 묻는 창. */
export function ConfirmDialog({ open, title, message, confirmLabel, saving, error, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          취소
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={saving}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
