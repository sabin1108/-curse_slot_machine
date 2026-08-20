import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ShowcaseStep } from '../../types/game';
import { ShowcaseOverlay } from './ShowcaseOverlay';

const steps: ShowcaseStep[] = [
  {
    stepIndex: 4,
    title: '4단계: 보스 마무리 전투',
    instruction: '마지막 전투 흐름을 보여준다.',
    actionScript: 'NONE',
    highlightMessage: '확실한 구분이 필요하다.',
  },
];

describe('ShowcaseOverlay', () => {
  it('separates the step counter from the step title with a dedicated separator', () => {
    const { container } = render(
      <ShowcaseOverlay currentStepIndex={0} steps={steps} onDispatch={vi.fn()} />,
    );

    const heading = container.querySelector('.showcase-step-heading');
    const stepNum = container.querySelector('.showcase-step-heading .step-num');
    const separator = container.querySelector('.showcase-step-heading .step-separator');
    const stepTitle = container.querySelector('.showcase-step-heading .step-title');

    expect(heading).toBeInTheDocument();
    expect(stepNum).toHaveTextContent('STEP 4 / 1');
    expect(separator).toHaveTextContent('•');
    expect(separator).toHaveAttribute('aria-hidden', 'true');
    expect(stepTitle).toHaveTextContent('4단계: 보스 마무리 전투');
    expect(screen.getByText('마지막 전투 흐름을 보여준다.')).toBeInTheDocument();
  });
});
