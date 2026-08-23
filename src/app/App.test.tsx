import { act, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameEngine } from '../game/engine/UiGameEngine';
import { App } from './App';

afterEach(() => {
  vi.useRealTimers();
});

describe('App', () => {
  it('renders the cursed slot machine UI shell', () => {
    render(<App />);

    expect(screen.getByText(/던전 탐사 시작/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /showcase mode/i })).toBeInTheDocument();
  });

  it('starts showcase mode from the title screen and shows the overlay', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /showcase mode/i }));

    expect(screen.getByText(/SHOWCASE MODE/i)).toBeInTheDocument();
    expect(screen.getByText(/STEP 1 \/ 4/i)).toBeInTheDocument();
  });

  it('advances showcase overlay steps through the existing command path', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /showcase mode/i }));

    expect(screen.getByText(/STEP 1 \/ 4/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }));

    expect(screen.queryByText(/STEP 1 \/ 4/i)).not.toBeInTheDocument();
    expect(screen.getByText(/STEP 2 \/ 4/i)).toBeInTheDocument();
  });

  it('hides showcase overlay controls while reward selection owns input', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /showcase mode/i }));
    fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }));
    fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }));

    expect(screen.getByText(/전투 보상/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /NEXT STEP/i })).not.toBeInTheDocument();
  });

  it('offers reward choices as semantic buttons in showcase reward step', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /showcase mode/i }));
    fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }));
    fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }));

    expect(screen.getByRole('button', { name: /\uBC29\uBCBD \uCF54\uC5B4 \uC120\uD0DD/ })).toBeInTheDocument();
  });

  it('uses local font fallbacks instead of external Google Fonts', () => {
    const css = readFileSync('src/styles.css', 'utf8');

    expect(css).not.toContain('fonts.googleapis.com');
    expect(css).toContain('--font-display');
  });

  it('does not let the enemy-defeat delay overwrite a newer navigation state', () => {
    vi.useFakeTimers();
    const engine = new GameEngine('app-defeat-transition');
    engine.dispatch({ type: 'START_RUN', seed: 'app-defeat-transition' });
    engine.dispatch({ type: 'SELECT_MAP_NODE', nodeId: 1502, nodeType: 'BOSS' });
    engine.dispatch({ type: 'SPIN_COMBAT_SLOT' });
    ;(engine as any).currentStructuredSlot = {
      action: 'bullet',
      target: 'enemy',
      modifier: 'x3',
      attackRoll: 1000,
      defenseRoll: 1,
      attackModifier: 'x3',
      defenseModifier: 'x2',
    };
    ;(engine as any).projectStructuredSlot((engine as any).currentStructuredSlot);

    render(<App engine={engine} />);
    fireEvent.click(screen.getByRole('button', { name: '결과 확정' }));
    const mapTab = screen.getByRole('button', { name: '경로 맵' });
    fireEvent.click(mapTab);
    expect(mapTab).toHaveClass('active');

    act(() => vi.advanceTimersByTime(900));

    expect(mapTab).toHaveClass('active');
  });
});
