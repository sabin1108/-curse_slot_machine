import React from 'react';

interface CurseLogModalProps {
  unlockedLogs?: string[];
  onClose: () => void;
}

export const CurseLogModal: React.FC<CurseLogModalProps> = ({ onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content curse-log-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>Curse Log</h2>
          <button className="close-btn" onClick={onClose} type="button">
            Close
          </button>
        </div>

        <div className="curse-log-body">
          <p className="curse-log-intro">
            Curse records are locked for a later content update.
          </p>

          <div className="curse-log-list">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="curse-log-card locked future-log-card">
                <div className="log-card-header">
                  <span className="log-title">Coming soon</span>
                  <span className="log-condition">Future reveal</span>
                </div>
                <div className="log-fragment">
                  This entry will open after narrative and curse progression are finalized.
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="pixel-btn primary-btn" onClick={onClose} type="button">
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
