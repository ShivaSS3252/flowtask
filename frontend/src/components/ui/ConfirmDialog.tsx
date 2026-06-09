import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
}

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Confirm action', message, confirmLabel = 'Confirm', loading = false }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="sm">
      <p className="text-sm" style={{ color: '#a8a29e' }}>{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
