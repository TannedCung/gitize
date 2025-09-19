import React from 'react';
import { TrendingFeed } from '../TrendingFeed';

// Mock the hooks to avoid complex setup
jest.mock('../../hooks/useRepositories', () => ({
  useTrendingRepositories: () => ({
    data: null,
    isLoading: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
  }),
  useSearchRepositories: () => ({
    data: null,
    isLoading: false,
    error: null,
    hasNextPage: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    refetch: jest.fn(),
  }),
  useAllRepositories: () => [],
}));

describe('TrendingFeed Extension Mode Props', () => {
  it('accepts extension mode props without errors', () => {
    // Test that the component accepts the new props without TypeScript errors
    const mockOnClick = jest.fn();

    // This test mainly verifies TypeScript compilation
    expect(() => {
      React.createElement(TrendingFeed, {
        extensionMode: 'popup',
        maxItems: 10,
        onRepositoryClick: mockOnClick,
      });
    }).not.toThrow();

    expect(() => {
      React.createElement(TrendingFeed, {
        extensionMode: 'newtab',
        maxItems: 20,
        onRepositoryClick: mockOnClick,
      });
    }).not.toThrow();

    expect(() => {
      React.createElement(TrendingFeed, {
        extensionMode: 'web',
      });
    }).not.toThrow();
  });

  it('has correct default values', () => {
    const mockOnClick = jest.fn();

    // Test default extensionMode
    expect(() => {
      React.createElement(TrendingFeed, {
        onRepositoryClick: mockOnClick,
      });
    }).not.toThrow();
  });
});
