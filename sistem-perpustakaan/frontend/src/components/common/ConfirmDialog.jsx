import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Konfirmasi', message, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-gray-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Batal
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          Ya, Hapus
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
