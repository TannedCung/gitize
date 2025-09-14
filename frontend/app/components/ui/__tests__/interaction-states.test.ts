import {
  createInteractionStates,
  createHoverState,
  createFocusState,
  createActiveState,
  createDisabledState,
  createSelectedState,
  createPressState,
  createLoadingState,
  createErrorState,
  createSuccessState,
  createWarningState,
  createEnhancedHoverState,
  createKeyboardNavigationStates,
  createTouchInteractionStates,
  createComprehensiveInteractionStates,
  InteractionPresets,
  InteractionStates,
  StateUtils,
  buildConditionalStates,
  type InteractiveComponent,
  type InteractionState,
} from '../interaction-states';

describe('Interaction States System', () => {
  describe('Basic State Creation', () => {
    it('creates hover states with light gray backgrounds only', () => {
      const buttonHover = createHoverState('button');
      expect(buttonHover).toContain('hover:bg-neutral-100');
      expect(buttonHover).toContain('dark:hover:bg-neutral-800');
      expect(buttonHover).not.toContain('shadow');
      expect(buttonHover).not.toContain('scale');
    });

    it('creates focus states with minimal outlines', () => {
      const buttonFocus = createFocusState('button');
      expect(buttonFocus).toContain('focus:outline-none');
      expect(buttonFocus).toContain('focus:ring-1');
      expect(buttonFocus).toContain('focus:ring-neutral-500');
      expect(buttonFocus).not.toContain('shadow');
    });

    it('creates active states with minimal visual changes', () => {
      const buttonActive = createActiveState('button');
      expect(buttonActive).toContain('active:bg-neutral-200');
      expect(buttonActive).toContain('dark:active:bg-neutral-700');
      expect(buttonActive).not.toContain('shadow');
    });

    it('creates disabled states with opacity and cursor changes only', () => {
      const buttonDisabled = createDisabledState('button');
      expect(buttonDisabled).toContain('disabled:opacity-50');
      expect(buttonDisabled).toContain('disabled:cursor-not-allowed');
      expect(buttonDisabled).toContain('disabled:pointer-events-none');
    });

    it('creates selected states with minimal visual indication', () => {
      const buttonSelected = createSelectedState('button');
      expect(buttonSelected).toContain('bg-neutral-200');
      expect(buttonSelected).toContain('dark:bg-neutral-700');
      expect(buttonSelected).not.toContain('shadow');
    });
  });

  describe('Enhanced State Creation', () => {
    it('creates press states with subtle feedback', () => {
      const buttonPress = createPressState('button');
      expect(buttonPress).toContain('active:scale-[0.98]');
      expect(buttonPress).toContain('transition-transform');
      expect(buttonPress).toContain('duration-75');
    });

    it('creates loading states maintaining flat design', () => {
      const buttonLoading = createLoadingState('button');
      expect(buttonLoading).toContain('cursor-wait');
      expect(buttonLoading).toContain('animate-pulse');
      expect(buttonLoading).toContain('opacity-75');
    });

    it('creates error states with minimal red accents', () => {
      const inputError = createErrorState('input');
      expect(inputError).toContain('border-accent-red-200');
      expect(inputError).toContain('text-accent-red-700');
      expect(inputError).toContain('focus:ring-accent-red-400');
    });

    it('creates success states with minimal green accents', () => {
      const inputSuccess = createSuccessState('input');
      expect(inputSuccess).toContain('border-accent-green-200');
      expect(inputSuccess).toContain('text-accent-green-700');
      expect(inputSuccess).toContain('focus:ring-accent-green-400');
    });

    it('creates warning states with minimal amber accents', () => {
      const inputWarning = createWarningState('input');
      expect(inputWarning).toContain('border-accent-amber-200');
      expect(inputWarning).toContain('text-accent-amber-700');
      expect(inputWarning).toContain('focus:ring-accent-amber-400');
    });
  });

  describe('Enhanced Hover States', () => {
    it('creates enhanced hover with optional transform', () => {
      const enhancedHover = createEnhancedHoverState('button', {
        includeTransform: true,
      });
      expect(enhancedHover).toContain('hover:scale-[1.02]');
      expect(enhancedHover).toContain('transition-transform');
    });

    it('creates enhanced hover without transform by default', () => {
      const enhancedHover = createEnhancedHoverState('button');
      expect(enhancedHover).not.toContain('scale');
    });

    it('includes border enhancement when specified', () => {
      const enhancedHover = createEnhancedHoverState('card', {
        includeBorder: true,
      });
      expect(enhancedHover).toContain('hover:border-neutral-300');
    });
  });

  describe('Keyboard Navigation States', () => {
    it('creates keyboard navigation with enhanced focus visibility', () => {
      const keyboardStates = createKeyboardNavigationStates('button');
      expect(keyboardStates).toContain('focus-visible:ring-2');
      expect(keyboardStates).toContain('focus-visible:ring-accent-blue-500');
    });
  });

  describe('Touch Interaction States', () => {
    it('creates touch-friendly states with minimum target size', () => {
      const touchStates = createTouchInteractionStates('button');
      expect(touchStates).toContain('touch-manipulation');
      expect(touchStates).toContain('select-none');
      expect(touchStates).toContain('min-h-[44px]');
      expect(touchStates).toContain('min-w-[44px]');
    });
  });

  describe('Comprehensive Interaction States', () => {
    it('creates comprehensive states with all feedback types', () => {
      const comprehensiveStates =
        createComprehensiveInteractionStates('button');
      expect(comprehensiveStates).toContain('hover:bg-neutral-100');
      expect(comprehensiveStates).toContain('focus:ring-1');
      expect(comprehensiveStates).toContain('active:bg-neutral-200');
      expect(comprehensiveStates).toContain('disabled:opacity-50');
    });

    it('includes enhanced feedback when specified', () => {
      const enhancedStates = createComprehensiveInteractionStates('button', {
        enhancedFeedback: true,
      });
      expect(enhancedStates).toContain('hover:scale-[1.01]');
      expect(enhancedStates).toContain('active:scale-[0.99]');
    });

    it('includes touch enhancements when specified', () => {
      const touchStates = createComprehensiveInteractionStates('button', {
        includeTouch: true,
      });
      expect(touchStates).toContain('touch-manipulation');
      expect(touchStates).toContain('min-h-[44px]');
    });
  });

  describe('Component-Specific Configurations', () => {
    const components: InteractiveComponent[] = [
      'button',
      'input',
      'checkbox',
      'toggle',
      'card',
      'link',
      'menu-item',
      'tab',
      'nav-item',
      'list-item',
    ];

    components.forEach(component => {
      it(`creates interaction states for ${component}`, () => {
        const states = createInteractionStates(component);
        expect(states).toBeTruthy();
        expect(states).toContain('transition');
        expect(states).not.toContain('shadow');
      });

      it(`creates hover state for ${component}`, () => {
        const hoverState = createHoverState(component);
        expect(hoverState).toBeTruthy();
        expect(hoverState).toContain('hover:');
      });

      it(`creates focus state for ${component}`, () => {
        const focusState = createFocusState(component);
        expect(focusState).toBeTruthy();
        expect(focusState).toContain('focus:');
      });
    });
  });

  describe('Interaction Presets', () => {
    it('creates minimal preset with hover and focus only', () => {
      const minimal = InteractionPresets.minimal('button');
      expect(minimal).toContain('hover:');
      expect(minimal).toContain('focus:');
      expect(minimal).not.toContain('active:');
    });

    it('creates standard preset with hover, focus, active, disabled', () => {
      const standard = InteractionPresets.standard('button');
      expect(standard).toContain('hover:');
      expect(standard).toContain('focus:');
      expect(standard).toContain('active:');
      expect(standard).toContain('disabled:');
    });

    it('creates complete preset with all states', () => {
      const complete = InteractionPresets.complete('button');
      expect(complete).toContain('hover:');
      expect(complete).toContain('focus:');
      expect(complete).toContain('active:');
      expect(complete).toContain('disabled:');
    });

    it('creates keyboard preset with enhanced focus', () => {
      const keyboard = InteractionPresets.keyboard('button');
      expect(keyboard).toContain('focus-visible:ring-2');
    });

    it('creates touch preset with touch optimizations', () => {
      const touch = InteractionPresets.touch('button');
      expect(touch).toContain('touch-manipulation');
      expect(touch).toContain('min-h-[44px]');
    });

    it('creates enhanced preset with subtle transforms', () => {
      const enhanced = InteractionPresets.enhanced('button');
      expect(enhanced).toContain('hover:scale-[1.01]');
      expect(enhanced).toContain('active:scale-[0.99]');
    });
  });

  describe('State Utilities', () => {
    it('provides access to all state creation functions', () => {
      expect(StateUtils.hover).toBe(createHoverState);
      expect(StateUtils.focus).toBe(createFocusState);
      expect(StateUtils.active).toBe(createActiveState);
      expect(StateUtils.disabled).toBe(createDisabledState);
      expect(StateUtils.selected).toBe(createSelectedState);
      expect(StateUtils.press).toBe(createPressState);
      expect(StateUtils.loading).toBe(createLoadingState);
      expect(StateUtils.error).toBe(createErrorState);
      expect(StateUtils.success).toBe(createSuccessState);
      expect(StateUtils.warning).toBe(createWarningState);
    });
  });

  describe('Conditional State Builder', () => {
    it('returns loading state when isLoading is true', () => {
      const state = buildConditionalStates('button', { isLoading: true });
      expect(state).toContain('cursor-wait');
      expect(state).toContain('animate-pulse');
    });

    it('returns disabled state when isDisabled is true', () => {
      const state = buildConditionalStates('button', { isDisabled: true });
      expect(state).toContain('disabled:opacity-50');
    });

    it('returns error state when hasError is true', () => {
      const state = buildConditionalStates('input', { hasError: true });
      expect(state).toContain('border-accent-red-200');
    });

    it('returns success state when isSuccess is true', () => {
      const state = buildConditionalStates('input', { isSuccess: true });
      expect(state).toContain('border-accent-green-200');
    });

    it('returns warning state when isWarning is true', () => {
      const state = buildConditionalStates('input', { isWarning: true });
      expect(state).toContain('border-accent-amber-200');
    });

    it('returns selected state when isSelected is true', () => {
      const state = buildConditionalStates('button', { isSelected: true });
      expect(state).toContain('bg-neutral-200');
    });

    it('returns active state when isActive is true', () => {
      const state = buildConditionalStates('button', { isActive: true });
      expect(state).toContain('active:bg-neutral-200');
    });

    it('returns focus state when isFocused is true', () => {
      const state = buildConditionalStates('button', { isFocused: true });
      expect(state).toContain('focus:ring-1');
    });

    it('returns hover state when isHovered is true', () => {
      const state = buildConditionalStates('button', { isHovered: true });
      expect(state).toContain('hover:bg-neutral-100');
    });

    it('follows priority order correctly', () => {
      // Loading should take priority over disabled
      const loadingOverDisabled = buildConditionalStates('button', {
        isLoading: true,
        isDisabled: true,
      });
      expect(loadingOverDisabled).toContain('cursor-wait');
      // Note: Loading state includes disabled classes but adds loading-specific ones

      // Error should take priority over success
      const errorOverSuccess = buildConditionalStates('input', {
        hasError: true,
        isSuccess: true,
      });
      expect(errorOverSuccess).toContain('border-accent-red-200');
      expect(errorOverSuccess).not.toContain('border-accent-green-200');
    });

    it('returns base state when no conditions are met', () => {
      const baseState = buildConditionalStates('button', {});
      expect(baseState).toContain('transition-colors');
      expect(baseState).toContain('border-none');
    });
  });

  describe('Flat Design Compliance', () => {
    const allComponents: InteractiveComponent[] = [
      'button',
      'input',
      'checkbox',
      'toggle',
      'card',
      'link',
      'menu-item',
      'tab',
      'nav-item',
      'list-item',
    ];

    // Components that should have border-none for flat design
    const borderlessComponents: InteractiveComponent[] = ['button', 'input'];

    // Components that use hover backgrounds
    const backgroundHoverComponents: InteractiveComponent[] = [
      'button',
      'input',
      'checkbox',
      'toggle',
      'card',
      'menu-item',
      'nav-item',
      'list-item',
    ];

    // Components that use focus rings
    const focusRingComponents: InteractiveComponent[] = [
      'button',
      'input',
      'checkbox',
      'toggle',
      'card',
      'link',
      'tab',
      'nav-item',
    ];

    allComponents.forEach(component => {
      it(`ensures ${component} states maintain flat design principles`, () => {
        const states = createInteractionStates(component);

        // Should not contain shadows, gradients, or 3D effects
        expect(states).not.toContain('shadow');
        expect(states).not.toContain('gradient');
        expect(states).not.toContain('drop-shadow');

        // Should contain transition for smooth interactions
        expect(states).toContain('transition');

        // Only certain components should use border-none
        if (borderlessComponents.includes(component)) {
          expect(states).toContain('border-none');
        }
      });

      it(`ensures ${component} hover states use appropriate feedback`, () => {
        const hoverState = createHoverState(component);

        // Should contain hover changes (background or text/border)
        if (backgroundHoverComponents.includes(component)) {
          expect(hoverState).toMatch(/hover:bg-/);
        } else {
          // Links and tabs use text/border changes instead of backgrounds
          expect(hoverState).toMatch(/hover:(text|border)-/);
        }

        // Should not contain shadows or transforms (except for enhanced variants)
        expect(hoverState).not.toContain('hover:shadow');
        expect(hoverState).not.toContain('hover:drop-shadow');
      });

      it(`ensures ${component} focus states use appropriate feedback`, () => {
        const focusState = createFocusState(component);

        // Should remove default outline
        expect(focusState).toContain('focus:outline-none');

        // Should contain focus feedback (ring or background)
        if (focusRingComponents.includes(component)) {
          expect(focusState).toContain('focus:ring-1');
        } else {
          // Some components use background changes for focus
          expect(focusState).toMatch(/focus:bg-/);
        }

        // Should not contain shadows
        expect(focusState).not.toContain('focus:shadow');
        expect(focusState).not.toContain('focus:drop-shadow');
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('ensures focus states meet accessibility requirements', () => {
      const focusState = createFocusState('button');
      expect(focusState).toContain('focus:ring-1');
      expect(focusState).toContain('focus:ring-offset-1');
    });

    it('ensures keyboard navigation has enhanced visibility', () => {
      const keyboardState = createKeyboardNavigationStates('button');
      expect(keyboardState).toContain('focus-visible:ring-2');
    });

    it('ensures touch targets meet minimum size requirements', () => {
      const touchState = createTouchInteractionStates('button');
      expect(touchState).toContain('min-h-[44px]');
      expect(touchState).toContain('min-w-[44px]');
    });

    it('ensures disabled states prevent interaction', () => {
      const disabledState = createDisabledState('button');
      expect(disabledState).toContain('disabled:pointer-events-none');
      expect(disabledState).toContain('disabled:cursor-not-allowed');
    });
  });
});
