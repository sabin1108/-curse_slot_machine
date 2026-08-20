import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the cursed slot machine UI shell', () => {
    render(<App />);

    expect(screen.getAllByText(/저주받은 슬롯머신/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/START/i)).toBeInTheDocument();
    expect(screen.getByText(/던전 탐사 시작/i)).toBeInTheDocument();
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

  it('keeps showcase next step available over reward selection and exposes reward cards as buttons', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /showcase mode/i }));
    fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }));
    fireEvent.click(screen.getByRole('button', { name: /NEXT STEP/i }));

    expect(screen.getByText(/STEP 3 \/ 4/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /NEXT STEP/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /선택하기/i }).length).toBeGreaterThanOrEqual(1);
  });

  it('uses local font fallbacks instead of external Google Fonts', () => {
    const css = readFileSync('src/styles.css', 'utf8');

    expect(css).not.toContain('fonts.googleapis.com');
    expect(css).toContain('--font-display');
  });
});
