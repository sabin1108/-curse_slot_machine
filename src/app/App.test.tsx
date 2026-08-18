import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders the cursed slot machine UI shell', () => {
    render(<App />);

    expect(screen.getAllByText(/저주받은 슬롯머신/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/START/i)).toBeInTheDocument();
    expect(screen.getByText(/던전 탐사 시작/i)).toBeInTheDocument();
  });
});
