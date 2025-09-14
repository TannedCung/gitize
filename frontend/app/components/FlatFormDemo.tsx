import React, { useState } from 'react';
import { Checkbox } from './ui/Checkbox';
import { Toggle } from './ui/Toggle';
import { Avatar } from './ui/Avatar';

/**
 * Demo component showcasing the flat design form components
 */
export const FlatFormDemo: React.FC = () => {
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [toggleChecked, setToggleChecked] = useState(false);

  return (
    <div className="p-8 space-y-8 bg-white dark:bg-gray-900">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Flat Design Form Components
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Showcasing the transformed components with flat, borderless design
          principles
        </p>
      </div>

      {/* Checkbox Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Flat Checkboxes
        </h3>
        <div className="space-y-3">
          <Checkbox
            label="Default flat checkbox"
            checked={checkboxChecked}
            onChange={checked => setCheckboxChecked(checked)}
          />
          <Checkbox
            label="Checked flat checkbox"
            checked={true}
            onChange={() => {}}
          />
          <Checkbox
            label="Disabled flat checkbox"
            disabled={true}
            checked={false}
            onChange={() => {}}
          />
          <Checkbox
            label="Error state checkbox"
            error="This field is required"
            checked={false}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Toggle Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Flat Toggles
        </h3>
        <div className="space-y-3">
          <Toggle
            label="Default flat toggle"
            checked={toggleChecked}
            onChange={checked => setToggleChecked(checked)}
          />
          <Toggle
            label="Enabled flat toggle"
            checked={true}
            onChange={() => {}}
          />
          <Toggle
            label="Success variant toggle"
            variant="success"
            checked={true}
            onChange={() => {}}
          />
          <Toggle
            label="Error variant toggle"
            variant="error"
            checked={true}
            onChange={() => {}}
          />
          <Toggle
            label="Disabled flat toggle"
            disabled={true}
            checked={false}
            onChange={() => {}}
          />
        </div>
      </div>

      {/* Avatar Examples */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Flat Avatars
        </h3>
        <div className="flex items-center space-x-4">
          <Avatar alt="John Doe" fallback="John Doe" size="sm" />
          <Avatar alt="Jane Smith" fallback="Jane Smith" size="md" />
          <Avatar
            alt="Bob Johnson"
            fallback="Bob Johnson"
            size="lg"
            status="online"
            showStatus
          />
          <Avatar
            alt="Alice Brown"
            fallback="Alice Brown"
            size="xl"
            status="busy"
            showStatus
            onClick={() => alert('Avatar clicked!')}
          />
        </div>
      </div>

      {/* Design Principles */}
      <div className="space-y-4 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Flat Design Principles Applied
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li>
            • <strong>No shadows or 3D effects:</strong> All components use flat
            design with minimal visual weight
          </li>
          <li>
            • <strong>Minimal borders:</strong> Subtle borders only when
            necessary for functionality
          </li>
          <li>
            • <strong>Subtle hover states:</strong> Light background changes
            instead of heavy styling
          </li>
          <li>
            • <strong>Clean status indicators:</strong> Simple color dots
            without borders or shadows
          </li>
          <li>
            • <strong>Typography-focused:</strong> Content hierarchy through
            font weight and spacing
          </li>
          <li>
            • <strong>Generous whitespace:</strong> Airy layouts that prioritize
            readability
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FlatFormDemo;
