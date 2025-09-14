import React from 'react';
import { renderWithProviders } from '../test-utils';
import { auditFlatDesignAccessibility } from '../../../utils/flatDesignAccessibility';

describe('Debug Accessibility Checks', () => {
  it('debugs color contrast check', async () => {
    const { container } = renderWithProviders(
      <div>
        <p style={{ color: '#ccc', backgroundColor: '#ddd' }}>
          Poor contrast text
        </p>
      </div>
    );

    const results = await auditFlatDesignAccessibility(container);

    console.log('Color contrast result:', results.checks.colorContrast);
    console.log('All results:', results);
  });

  it('debugs focus indicator check', async () => {
    const { container } = renderWithProviders(
      <div>
        <button style={{ outline: 'none' }}>
          Button without focus indicator
        </button>
      </div>
    );

    const results = await auditFlatDesignAccessibility(container);

    console.log('Focus indicator result:', results.checks.focusIndicators);
  });

  it('debugs semantic structure check', async () => {
    const { container } = renderWithProviders(
      <div>
        <h1>Main Title</h1>
        <h2>Section Title</h2>
        <h3>Subsection Title</h3>
        <p>Content</p>
      </div>
    );

    const results = await auditFlatDesignAccessibility(container);

    console.log('Semantic structure result:', results.checks.semanticStructure);
  });

  it('debugs typography hierarchy check', async () => {
    const { container } = renderWithProviders(
      <div>
        <h1 className="text-4xl leading-tight">Large Heading</h1>
        <h2 className="text-2xl leading-snug">Medium Heading</h2>
        <p className="text-base leading-relaxed">
          Body text with good line height
        </p>
      </div>
    );

    const results = await auditFlatDesignAccessibility(container);

    console.log(
      'Typography hierarchy result:',
      results.checks.typographyHierarchy
    );
  });
});
