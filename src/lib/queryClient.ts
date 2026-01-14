import { QueryClient } from "@tanstack/react-query";

/**
 * Optimized QueryClient configuration with best practices:
 * - Aggressive caching to reduce API calls
 * - Smart retry logic
 * - Proper garbage collection timing
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 30 seconds before refetching
      staleTime: 30 * 1000,
      // Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,
      // Retry failed requests with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes("4")) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus to save API calls
      refetchOnWindowFocus: false,
      // Refetch on reconnect for data freshness
      refetchOnReconnect: true,
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      retryDelay: 1000,
    },
  },
});
