export default function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Закрити">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ title, text, confirmText = 'Підтвердити', danger, onConfirm, onCancel, busy }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="muted">{text}</p>
      <div className="modal-actions">
        <button className="btn" onClick={onCancel} disabled={busy}>Скасувати</button>
        <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm} disabled={busy}>
          {busy ? 'Зачекайте…' : confirmText}
        </button>
      </div>
    </Modal>
  );
}
