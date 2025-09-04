'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../lib/api';
import { Repository, SummaryState } from '../components/ui/RepositoryCard';

interface GenerateSummaryRequest {
  repository_id: number;
}

interface GenerateSummaryResponse {
  summary: string;
  repository_id: number;
}

export function useSummaryGeneration() {
  const queryClient = useQueryClient();

  const generateSummaryMutation = useMutation({
    mutationFn: async (
      request: GenerateSummaryRequest
    ): Promise<GenerateSummaryResponse> => {
      const response = await apiClient.post('/summaries/generate', request);
      return response.data;
    },
    onSuccess: data => {
      // Update the repository in all relevant queries
      queryClient.setQueriesData(
        { queryKey: ['repositories'] },
        (oldData: any) => {
          if (!oldData) return oldData;

          // Handle infinite query structure
          if (oldData.pages) {
            return {
              ...oldData,
              pages: oldData.pages.map((page: any) => ({
                ...page,
                repositories: page.repositories.map((repo: Repository) =>
                  repo.id === data.repository_id
                    ? { ...repo, summary: data.summary }
                    : repo
                ),
              })),
            };
          }

          // Handle regular query structure
          if (oldData.repositories) {
            return {
              ...oldData,
              repositories: oldData.repositories.map((repo: Repository) =>
                repo.id === data.repository_id
                  ? { ...repo, summary: data.summary }
                  : repo
              ),
            };
          }

          return oldData;
        }
      );
    },
  });

  const generateSummary = useCallback(
    (repositoryId: number) => {
      return generateSummaryMutation.mutate({ repository_id: repositoryId });
    },
    [generateSummaryMutation]
  );

  return {
    generateSummary,
    isGenerating: generateSummaryMutation.isPending,
    error: generateSummaryMutation.error?.message,
    isSuccess: generateSummaryMutation.isSuccess,
  };
}

export function useSummaryState(): SummaryState {
  const [localState] = useState<SummaryState>({});
  const summaryGeneration = useSummaryGeneration();

  // If this repository is currently being processed by the mutation
  const isCurrentlyGenerating = summaryGeneration.isGenerating;
  const currentError = summaryGeneration.error;

  return {
    isLoading: localState.isLoading || isCurrentlyGenerating,
    error: localState.error || currentError,
  };
}

// Hook for managing summary state for a specific repository
export function useRepositorySummary(repository: Repository) {
  const [summaryState, setSummaryState] = useState<SummaryState>({});
  const summaryGeneration = useSummaryGeneration();

  const generateSummary = useCallback(async () => {
    if (repository.summary || summaryState.isLoading) {
      return; // Already has summary or is loading
    }

    setSummaryState({ isLoading: true });

    try {
      await summaryGeneration.generateSummary(repository.id);
      setSummaryState({ isLoading: false });
    } catch (error) {
      setSummaryState({
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'Failed to generate summary',
      });
    }
  }, [
    repository.id,
    repository.summary,
    summaryState.isLoading,
    summaryGeneration,
  ]);

  const retrySummary = useCallback(() => {
    setSummaryState({});
    generateSummary();
  }, [generateSummary]);

  return {
    summaryState: {
      isLoading: summaryState.isLoading || summaryGeneration.isGenerating,
      error: summaryState.error || summaryGeneration.error,
    },
    generateSummary,
    retrySummary,
    canGenerate: !repository.summary && !summaryState.isLoading,
  };
}
