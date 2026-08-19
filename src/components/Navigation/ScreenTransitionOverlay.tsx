import React, { useState, useEffect, useRef } from 'react';
import { GameScreen } from '../../types/game';

interface ScreenTransitionOverlayProps {
  screen: GameScreen;
  children: React.ReactNode;
}

export const ScreenTransitionOverlay: React.FC<ScreenTransitionOverlayProps> = ({ screen, children }) => {
  const [isWiping, setIsWiping] = useState(false);
  const prevScreenRef = useRef<GameScreen>(screen);

  useEffect(() => {
    if (prevScreenRef.current !== screen) {
      prevScreenRef.current = screen;
      setIsWiping(true);
      const timer = setTimeout(() => {
        setIsWiping(false);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  const getLoadingMessage = (targetScreen: GameScreen) => {
    switch (targetScreen) {
      case 'BATTLE':
        return '⚔️ 저주받은 방에 진입하고 있습니다...';
      case 'MAP':
        return '🗺️ 탐사 지도를 정렬하고 있습니다...';
      case 'REWARD':
        return '🎁 전리품 릴이 정렬되는 중...';
      case 'SHOP':
        return '🪙 암시장의 상인이 호객 중...';
      case 'REST':
        return '🔥 모닥불 온기가 피어오릅니다...';
      case 'PROLOGUE':
      case 'ORIGIN':
        return '📜 운명의 기원을 엮는 중...';
      default:
        return '🎰 저주받은 릴이 회전 중...';
    }
  };

  return (
    <div className="screen-transition-wrapper">
      {children}
      {isWiping && (
        <div className="curtain-wipe-overlay">
          <div className="curtain-left" />
          <div className="curtain-right" />
          <div className="wipe-loader-content">
            <span className="wipe-spinner">🎰</span>
            <span className="wipe-message">{getLoadingMessage(screen)}</span>
          </div>
        </div>
      )}
    </div>
  );
};
