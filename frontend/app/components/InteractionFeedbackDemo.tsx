'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { TextField } from './ui/TextField';
import { Checkbox } from './ui/Checkbox';
import { Toggle } from './ui/Toggle';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from './ui/Card';
import { Link } from './ui/Link';
import {
  InteractionPresets,
  buildConditionalStates,
} from './ui/interaction-states';
import { cn } from './ui/utils';

/**
 * Demo component showcasing the enhanced interaction feedback system
 * Demonstrates flat design principles with subtle interaction states
 */
export const InteractionFeedbackDemo: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<string>('buttons');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [checkboxStates, setCheckboxStates] = useState({
    normal: false,
    error: false,
    success: false,
  });
  const [toggleStates, setToggleStates] = useState({
    normal: false,
    disabled: false,
  });

  const demoSections = [
    { id: 'buttons', label: 'Button Interactions' },
    { id: 'inputs', label: 'Input Interactions' },
    { id: 'forms', label: 'Form Element Interactions' },
    { id: 'cards', label: 'Card Interactions' },
    { id: 'states', label: 'Dynamic States' },
    { id: 'presets', label: 'Interaction Presets' },
  ];

  const handleLoadingDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    }, 2000);
  };

  const handleErrorDemo = () => {
    setHasError(true);
    setTimeout(() => setHasError(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          Interaction Feedback System
        </h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          Demonstrating subtle interaction feedback that maintains flat,
          borderless design principles. All interactions use light gray
          backgrounds, minimal outlines, and typography-first hierarchy.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-2 justify-center">
        {demoSections.map(section => (
          <Button
            key={section.id}
            variant={selectedDemo === section.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedDemo(section.id)}
          >
            {section.label}
          </Button>
        ))}
      </div>

      {/* Button Interactions Demo */}
      {selectedDemo === 'buttons' && (
        <Card>
          <CardHeader>
            <CardTitle>Button Interaction States</CardTitle>
            <CardDescription>
              Flat, borderless buttons with subtle hover and focus feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Primary Buttons
                </h4>
                <div className="space-y-2">
                  <Button variant="primary" size="sm">
                    Small Primary
                  </Button>
                  <Button variant="primary" size="md">
                    Medium Primary
                  </Button>
                  <Button variant="primary" size="lg">
                    Large Primary
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Secondary Buttons
                </h4>
                <div className="space-y-2">
                  <Button variant="secondary" size="sm">
                    Small Secondary
                  </Button>
                  <Button variant="secondary" size="md">
                    Medium Secondary
                  </Button>
                  <Button variant="secondary" size="lg">
                    Large Secondary
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Ghost Buttons
                </h4>
                <div className="space-y-2">
                  <Button variant="ghost" size="sm">
                    Small Ghost
                  </Button>
                  <Button variant="ghost" size="md">
                    Medium Ghost
                  </Button>
                  <Button variant="ghost" size="lg">
                    Large Ghost
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                Button States
              </h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Normal</Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
                <Button
                  variant="primary"
                  loading={isLoading}
                  onClick={handleLoadingDemo}
                >
                  {isLoading ? 'Loading...' : 'Click for Loading'}
                </Button>
                <Button variant="danger">Danger</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Interactions Demo */}
      {selectedDemo === 'inputs' && (
        <Card>
          <CardHeader>
            <CardTitle>Input Interaction States</CardTitle>
            <CardDescription>
              Borderless inputs with bottom-line and subtle-outline variants
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Borderless Variant (Default)
                </h4>
                <TextField
                  label="Borderless Input"
                  placeholder="Type something..."
                  variant="borderless"
                  helperText="Completely flat with subtle hover feedback"
                />
                <TextField
                  label="With Error"
                  placeholder="Error state..."
                  variant="borderless"
                  error="This field has an error"
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Bottom-line Variant
                </h4>
                <TextField
                  label="Bottom-line Input"
                  placeholder="Focus to see line..."
                  variant="bottom-line"
                  helperText="Shows bottom border on focus"
                />
                <TextField
                  label="With Success"
                  placeholder="Success state..."
                  variant="bottom-line"
                  state="success"
                  helperText="This field is valid"
                />
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                Subtle-outline Variant
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Subtle Outline"
                  placeholder="Minimal border on focus..."
                  variant="subtle-outline"
                  helperText="Subtle border appears on hover and focus"
                />
                <TextField
                  label="Disabled State"
                  placeholder="Cannot interact..."
                  variant="subtle-outline"
                  disabled
                  helperText="Disabled with reduced opacity"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Elements Demo */}
      {selectedDemo === 'forms' && (
        <Card>
          <CardHeader>
            <CardTitle>Form Element Interactions</CardTitle>
            <CardDescription>
              Flat checkboxes and toggles with minimal visual feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Checkbox States
                </h4>
                <div className="space-y-3">
                  <Checkbox
                    label="Normal Checkbox"
                    checked={checkboxStates.normal}
                    onChange={checked =>
                      setCheckboxStates(prev => ({ ...prev, normal: checked }))
                    }
                    helperText="Flat square with minimal check mark"
                  />
                  <Checkbox
                    label="Error State"
                    checked={checkboxStates.error}
                    onChange={checked =>
                      setCheckboxStates(prev => ({ ...prev, error: checked }))
                    }
                    error="This checkbox has an error"
                  />
                  <Checkbox
                    label="Success State"
                    checked={checkboxStates.success}
                    onChange={checked =>
                      setCheckboxStates(prev => ({ ...prev, success: checked }))
                    }
                    helperText="Valid checkbox state"
                  />
                  <Checkbox
                    label="Disabled Checkbox"
                    disabled
                    helperText="Cannot be interacted with"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Toggle States
                </h4>
                <div className="space-y-3">
                  <Toggle
                    label="Normal Toggle"
                    checked={toggleStates.normal}
                    onChange={checked =>
                      setToggleStates(prev => ({ ...prev, normal: checked }))
                    }
                    helperText="Flat sliding element with smooth animation"
                  />
                  <Toggle
                    label="Success Variant"
                    variant="success"
                    checked={toggleStates.normal}
                    onChange={checked =>
                      setToggleStates(prev => ({ ...prev, normal: checked }))
                    }
                    helperText="Green accent for success states"
                  />
                  <Toggle
                    label="Warning Variant"
                    variant="warning"
                    checked={toggleStates.normal}
                    onChange={checked =>
                      setToggleStates(prev => ({ ...prev, normal: checked }))
                    }
                    helperText="Amber accent for warnings"
                  />
                  <Toggle
                    label="Disabled Toggle"
                    disabled
                    helperText="Cannot be toggled"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Card Interactions Demo */}
      {selectedDemo === 'cards' && (
        <Card>
          <CardHeader>
            <CardTitle>Card Interaction States</CardTitle>
            <CardDescription>
              Interactive cards with subtle hover and focus feedback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card interactive onClick={() => alert('Card clicked!')}>
                <CardContent>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    Interactive Card
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Hover and click to see subtle feedback. No shadows or 3D
                    effects.
                  </p>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    Outlined Card
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Transparent background with subtle border.
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardContent>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    Elevated Card
                  </h4>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Subtle background with minimal border.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                Links with Interaction States
              </h4>
              <div className="flex flex-wrap gap-4">
                <Link href="#" variant="primary">
                  Primary Link
                </Link>
                <Link href="#" variant="secondary">
                  Secondary Link
                </Link>
                <Link href="#" variant="ghost">
                  Ghost Link
                </Link>
                <Link href="#" variant="danger">
                  Danger Link
                </Link>
                <Link href="https://example.com" external>
                  External Link
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dynamic States Demo */}
      {selectedDemo === 'states' && (
        <Card>
          <CardHeader>
            <CardTitle>Dynamic State Management</CardTitle>
            <CardDescription>
              Demonstrating conditional state building and state transitions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                State Controls
              </h4>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={handleLoadingDemo}
                  disabled={isLoading}
                >
                  Trigger Loading State
                </Button>
                <Button variant="secondary" onClick={handleErrorDemo}>
                  Trigger Error State
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setIsSuccess(!isSuccess)}
                >
                  Toggle Success State
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                Dynamic State Examples
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={cn(
                    'p-4 rounded-md border transition-all duration-200',
                    buildConditionalStates('card', {
                      isLoading,
                      hasError,
                      isSuccess,
                    })
                  )}
                >
                  <h5 className="font-medium mb-2">Dynamic Card State</h5>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {isLoading && 'Loading state active...'}
                    {hasError && 'Error state active!'}
                    {isSuccess && 'Success state active!'}
                    {!isLoading && !hasError && !isSuccess && 'Normal state'}
                  </p>
                </div>

                <TextField
                  label="Dynamic Input State"
                  placeholder="State changes based on controls..."
                  state={hasError ? 'error' : isSuccess ? 'success' : 'default'}
                  error={hasError ? 'Error state is active' : undefined}
                  helperText={
                    isSuccess ? 'Success state is active' : 'Normal state'
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interaction Presets Demo */}
      {selectedDemo === 'presets' && (
        <Card>
          <CardHeader>
            <CardTitle>Interaction Presets</CardTitle>
            <CardDescription>
              Different interaction preset configurations for various use cases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Minimal Preset
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Hover and focus only
                </p>
                <button
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium',
                    InteractionPresets.minimal('button')
                  )}
                >
                  Minimal Interactions
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Standard Preset
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Full interaction states
                </p>
                <button
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium bg-neutral-100 dark:bg-neutral-700',
                    InteractionPresets.standard('button')
                  )}
                >
                  Standard Interactions
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Enhanced Preset
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Subtle transforms included
                </p>
                <button
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium bg-accent-blue-500 text-white',
                    InteractionPresets.enhanced('button')
                  )}
                >
                  Enhanced Interactions
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Keyboard Preset
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Enhanced focus visibility
                </p>
                <button
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium bg-neutral-200 dark:bg-neutral-600',
                    InteractionPresets.keyboard('button')
                  )}
                >
                  Keyboard Optimized
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Touch Preset
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  Touch-friendly targets
                </p>
                <button
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium bg-accent-green-500 text-white',
                    InteractionPresets.touch('button')
                  )}
                >
                  Touch Optimized
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Complete Preset
                </h4>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                  All states including selected
                </p>
                <button
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium bg-neutral-800 text-white dark:bg-neutral-200 dark:text-neutral-900',
                    InteractionPresets.complete('button')
                  )}
                >
                  Complete Interactions
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Design Principles */}
      <Card>
        <CardHeader>
          <CardTitle>Flat Design Interaction Principles</CardTitle>
          <CardDescription>
            Key principles maintained throughout the interaction feedback system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                🎨 Flat Design
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                No shadows, gradients, or 3D effects. Pure flat design with
                minimal visual weight.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                🖱️ Subtle Feedback
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Light gray backgrounds and thin border appearances for hover
                states only.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                🎯 Minimal Focus
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Minimal outlines for focus states that maintain the flat
                aesthetic.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                📝 Typography First
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Typography weight and spacing create hierarchy instead of visual
                containers.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                🌬️ Generous Spacing
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Airy layouts with generous whitespace for comfortable
                interaction.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                ♿ Accessibility
              </h4>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                WCAG 2.1 AA compliance with proper focus indicators and contrast
                ratios.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractionFeedbackDemo;
