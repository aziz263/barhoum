import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

const ConfirmModal = ({ show, title, message, confirmText = 'Confirmer', cancelText = 'Annuler', onConfirm, onCancel, variant = 'danger' }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="confirm-modal-close" onClick={onCancel}><FiX /></button>
        <div className={`confirm-modal-icon ${variant}`}>
          <FiAlertTriangle />
        </div>
        <h3 className="confirm-modal-title">{title || 'Confirmation'}</h3>
        <p className="confirm-modal-message">{message || 'Êtes-vous sûr de vouloir continuer ?'}</p>
        <div className="confirm-modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
          <button className={`btn btn-${variant}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
