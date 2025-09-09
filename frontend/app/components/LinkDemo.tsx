import React from 'react';
import { Link } from './ui/Link';

/**
 * Demo component showcasing the Link component with different variants and states
 */
export const LinkDemo: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">Link Component Demo</h2>
        <p className="text-gray-600 mb-6">
          Showcasing the Link component with different variants, states, and
          features.
        </p>
      </div>

      {/* Basic Links */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Basic Links</h3>
        <div className="space-y-2">
          <div>
            <Link href="/internal">Internal Link</Link>
          </div>
          <div>
            <Link href="https://external-site.com">External Link</Link>
          </div>
          <div>
            <Link href="#section">Hash Link</Link>
          </div>
        </div>
      </div>

      {/* Link Variants */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Link Variants</h3>
        <div className="space-y-2">
          <div>
            <Link href="/test" variant="primary">
              Primary Link
            </Link>
          </div>
          <div>
            <Link href="/test" variant="secondary">
              Secondary Link
            </Link>
          </div>
          <div>
            <Link href="/test" variant="outline">
              Outline Link
            </Link>
          </div>
          <div>
            <Link href="/test" variant="ghost">
              Ghost Link
            </Link>
          </div>
          <div>
            <Link href="/test" variant="danger">
              Danger Link
            </Link>
          </div>
        </div>
      </div>

      {/* External Links */}
      <div>
        <h3 className="text-lg font-semibold mb-3">External Links</h3>
        <div className="space-y-2">
          <div>
            <Link href="https://github.com">GitHub (with icon)</Link>
          </div>
          <div>
            <Link href="https://github.com" showExternalIcon={false}>
              GitHub (no icon)
            </Link>
          </div>
          <div>
            <Link href="/internal" external>
              Forced External Link
            </Link>
          </div>
        </div>
      </div>

      {/* Disabled State */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Disabled State</h3>
        <div className="space-y-2">
          <div>
            <Link href="/test" disabled>
              Disabled Link
            </Link>
          </div>
          <div>
            <Link href="https://external.com" disabled>
              Disabled External Link
            </Link>
          </div>
        </div>
      </div>

      {/* Custom Styling */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Custom Styling</h3>
        <div className="space-y-2">
          <div>
            <Link href="/test" className="text-2xl font-bold">
              Large Bold Link
            </Link>
          </div>
          <div>
            <Link href="/test" className="bg-yellow-100 px-2 py-1 rounded">
              Link with Background
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Examples */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Interactive Examples</h3>
        <div className="space-y-2">
          <div>
            <Link
              href="/test"
              onClick={e => {
                e.preventDefault();
                alert('Link clicked!');
              }}
            >
              Link with onClick Handler
            </Link>
          </div>
          <div>
            <Link href="/test" aria-label="Custom accessibility label">
              Link with Custom ARIA Label
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkDemo;
