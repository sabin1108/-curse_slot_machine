import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const browserAssetFiles = ['index.html', 'src/styles.css'];

describe('offline browser asset policy', () => {
  it('does not depend on externally hosted Google Fonts', () => {
    const contents = browserAssetFiles
      .map((file) => readFileSync(resolve(process.cwd(), file), 'utf8'))
      .join('\n');

    expect(contents).not.toMatch(/fonts\.googleapis\.com|fonts\.gstatic\.com/);
    expect(contents).not.toMatch(/@import\s+url\(['"]?https?:\/\//);
  });
});
