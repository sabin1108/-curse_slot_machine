import React from 'react';
import { CURSE_LOGS } from '../../game/origins';

interface CurseLogModalProps {
  unlockedLogs?: string[];
  onClose: () => void;
}

export const CurseLogModal: React.FC<CurseLogModalProps> = ({ unlockedLogs = ['log_01'], onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content curse-log-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📜 저주 일지 (Curse Log)</h2>
          <button className="close-btn" onClick={onClose} type="button">
            ✖
          </button>
        </div>

        <div className="curse-log-body">
          <p className="curse-log-intro">
            던전을 탐사하며 마주친 저주받은 슬롯머신의 기록입니다.
          </p>

          <div className="curse-log-list">
            {CURSE_LOGS.map((log) => {
              const isUnlocked = unlockedLogs.includes(log.id);
              return (
                <div key={log.id} className={`curse-log-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  <div className="log-card-header">
                    <span className="log-title">{isUnlocked ? log.title : '🔒 봉인된 기록'}</span>
                    <span className="log-condition">해금 조건: {log.condition}</span>
                  </div>
                  <div className="log-fragment">
                    {isUnlocked ? log.fragment : '??? (던전을 더 깊이 탐사하면 조각이 드러납니다)'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="pixel-btn primary-btn" onClick={onClose} type="button">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
