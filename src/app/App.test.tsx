import { fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the cursed slot machine UI shell', () => {
    render(<App />);

    expect(screen.getByText(/START/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /showcase mode/i })).toBeInTheDocument();
  });

  it('starts a seeded normal run and enters the fixed first stage', () => {
    render(<App />)

    fireEvent.change(screen.getByLabelText('런 시드'), { target: { value: 'ui-fixed-seed' } })
    fireEvent.click(screen.getByRole('button', { name: 'START NORMAL RUN' }))
    expect(screen.getByText('다음 방: 1. 전투')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: '1번 방 진입' }))
    expect(screen.getByText('STAGE 1 · 전투')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '릴 돌리기' })).toBeInTheDocument()
  })

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

    expect(screen.getByText(/VICTORY REWARD/i)).toBeInTheDocument();
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
});
