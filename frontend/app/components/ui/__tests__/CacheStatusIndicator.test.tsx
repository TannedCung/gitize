import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { CacheStatusIndicator } from '../CacheStatusIndicator';
import { useCacheStatus } from '../../../hooks/useRepositories';

// Mock the useCacheStatus hook
jest.mock('../../../hooks/useRepositories', () => ({
  useCacheStatus: jest.fn(),
}));

const mockUseCacheStatus = useCacheStatus as jest.MockedFunction<
  typeof useCacheStatus
>;

// Mock Chrome APIs
const mockChromeStorage = {
  storage: {
    local: {
      get: jest.fn(),
    },
  },
};

describe('CacheStatusIndicator', () => {
  beforeEach(() => {
    // Setup Chrome mock
    (global as any).chrome = mockChromeStorage;
    (global as any).window.chrome = mockChromeStorage;

    // Default mock values
    mockUseCacheStatus.mockReturnValue({
      isOffline: false,
      hasCachedData: false,
      isExtensionEnvironment: true,
    });

    mockChromeStorage.storage.local.get.mockResolvedValue({});

    jest.clearAllMocks();
  });

  afterEach(() => {
    delete (global as any).chrome;
    delete (global as any).window.chrome;
  });

  it('should not render in non-extension environment', () => {
    mockUseCacheStatus.mockReturnValue({
      isOffline: false,
      hasCachedData: true,
      isExtensionEnvironment: false,
    });

    render(<CacheStatusIndicator />);

    expect(screen.queryByText(/cached/i)).not.toBeInTheDocument();
  });

  it('should not render when online and showWhenOnline is false', () => {
    mockUseCacheStatus.mockReturnValue({
      isOffline: false,
      hasCachedData: true,
      isExtensionEnvironment: true,
    });

    render(<CacheStatusIndicator />);

    expect(screen.queryByText(/cached/i)).not.toBeInTheDocument();
  });

  it('should not render when no cached data is available', () => {
    mockUseCacheStatus.mockReturnValue({
      isOffline: true,
      hasCachedData: false,
      isExtensionEnvironment: true,
    });

    render(<CacheStatusIndicator />);

    expect(screen.queryByText(/cached/i)).not.toBeInTheDocument();
  });

  it('should show offline indicator when offline with cached data', () => {
    mockUseCacheStatus.mockReturnValue({
      isOffline: true,
      hasCachedData: true,
      isExtensionEnvironment: true,
    });

    render(<CacheStatusIndicator />);

    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText(/Showing cached data from/)).toBeInTheDocument();
  });

  it('should show cached data when online and showWhenOnline is true', () => {
    mockUseCacheStatus.mockReturnValue({
      isOffline: false,
      hasCachedData: true,
      isExtensionEnvironment: true,
    });

    render(<CacheStatusIndicator showWhenOnline={true} />);

    expect(screen.getByText(/Data cached/)).toBeInTheDocument();
    expect(screen.queryByText('Offline')).not.toBeInTheDocument();
  });

  it('should display data age correctly', async () => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;

    mockUseCacheStatus.mockReturnValue({
      isOffline: true,
      hasCachedData: true,
      isExtensionEnvironment: true,
    });

    mockChromeStorage.storage.local.get.mockResolvedValue({
      last_fetch_timestamp: oneHourAgo,
    });

    render(<CacheStatusIndicator />);

    await waitFor(() => {
      expect(screen.getByText(/1 hour ago/)).toBeInTheDocument();
    });
  });

  it('should display days when data is older than 24 hours', async () => {
    const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;

    mockUseCacheStatus.mockReturnValue({
      isOffline: true,
      hasCachedData: true,
      isExtensionEnvironment: true,
    });

    mockChromeStorage.storage.local.get.mockResolvedValue({
      last_fetch_timestamp: twoDaysAgo,
    });

    render(<CacheStatusIndicator />);

    await waitFor(() => {
      expect(screen.getByText(/2 days ago/)).toBeInTheDocument();
    });
  });

  it('should show warning when data is over 7 days old', async () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;

    mockUseCacheStatus.mockReturnValue({
      isOffline: true,
      hasCachedData: true,
      isExtensionEnvironment: true,
    });

    mockChromeStorage.storage.local.get.mockResolvedValue({
      last_fetch_timestamp: eightDaysAgo,
    });

    render(<CacheStatusIndicator />);

    await waitFor(() => {
      expect(screen.getByText(/Data is over 7 days old/)).toBeInTheDocument();
      expect(
        screen.getByText(/Please go online to refresh/)
      ).toBeInTheDocument();
    });
  });

  it('should handle storage errors gracefully', async () => {
    mockUseCacheStatus.mockReturnValue({
      isOffline: true,
      hasCachedData: true,
      isExtensionEnvironment: true,
    });

    mockChromeStorage.storage.local.get.mockRejectedValue(
      new Error('Storage error')
    );

    render(<CacheStatusIndicator />);

    await waitFor(() => {
      expect(screen.getByText(/Unknown/)).toBeInTheDocument();
    });
  });

  it('should show "Less than 1 hour ago" for recent data', async () => {
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

    mockUseCacheStatus.mockReturnValue({
      isOffline: true,
      hasCachedData: true,
      isExtensionEnvironment: true,
    });

    mockChromeStorage.storage.local.get.mockResolvedValue({
      last_fetch_timestamp: thirtyMinutesAgo,
    });

    render(<CacheStatusIndicator />);

    await waitFor(() => {
      expect(screen.getByText(/Less than 1 hour ago/)).toBeInTheDocument();
    });
  });
});
