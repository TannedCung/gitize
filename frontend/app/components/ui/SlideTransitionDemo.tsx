'use client';

import React, { useState } from 'react';
import { useSlideTransitions } from '../../hooks/useSlideTransitions';
import { useFeedNavigation } from '../../hooks/useFeedNavigation';

interface SlideTransitionDemoProps {
  totalSlides?: number;
  enablePerformanceMode?: boolean;
}

export function SlideTransitionDemo({
  totalSlides = 5,
  enablePerformanceMode = false,
}: SlideTransitionDemoProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Use the feed navigation hook
  const { navigationState, navigateToIndex, navigateNext, navigatePrevious } =
    useFeedNavigation({
      totalSlides,
      onNavigate: setCurrentIndex,
      enableKeyboard: true,
      enableTouch: true,
      enableWheel: true,
    });

  // Use the slide transitions hook
  const {
    transitionState,
    getSlideClasses,
    getSlideStyles,
    getViewportClasses,
    getViewportStyles,
  } = useSlideTransitions({
    totalSlides,
    currentIndex,
    enablePerformanceMode,
  });

  return (
    <div className="relative w-full h-screen bg-gray-100">
      {/* Viewport Container */}
      <div className={getViewportClasses()} style={getViewportStyles()}>
        {/* Render all slides */}
        {Array.from({ length: totalSlides }, (_, index) => (
          <div
            key={index}
            className={getSlideClasses(index)}
            style={getSlideStyles(index)}
          >
            {/* Slide Content */}
            <div className="flex items-center justify-center h-full w-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <div className="text-center">
                <h1 className="text-6xl font-bold mb-4">Slide {index + 1}</h1>
                <p className="text-xl opacity-80">
                  Current: {currentIndex + 1} / {totalSlides}
                </p>
                {transitionState.isTransitioning && (
                  <p className="text-sm mt-2 opacity-60">
                    Transitioning {transitionState.direction}...
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Debug Info */}
      <div className="fixed top-4 left-4 bg-black bg-opacity-50 text-white p-4 rounded-lg text-sm">
        <div>Current Index: {currentIndex}</div>
        <div>
          Is Transitioning: {transitionState.isTransitioning ? 'Yes' : 'No'}
        </div>
        <div>Direction: {transitionState.direction || 'None'}</div>
        <div>Scroll Velocity: {navigationState.scrollVelocity.toFixed(2)}</div>
        <div>
          User Scrolling: {navigationState.isUserScrolling ? 'Yes' : 'No'}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <button
          onClick={navigatePrevious}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={navigateNext}
          disabled={currentIndex === totalSlides - 1}
          className="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-1">
        {Array.from({ length: totalSlides }, (_, index) => (
          <button
            key={index}
            onClick={() => navigateToIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-30'
            }`}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="fixed top-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg text-sm max-w-xs">
        <h3 className="font-semibold mb-2">Navigation:</h3>
        <ul className="space-y-1 text-xs">
          <li>• Mouse wheel to scroll</li>
          <li>• Arrow keys (↑/↓)</li>
          <li>• Touch/swipe gestures</li>
          <li>• Click indicators</li>
          <li>• Home/End keys</li>
        </ul>
      </div>
    </div>
  );
}
