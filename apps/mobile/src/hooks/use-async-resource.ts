import { type DependencyList, useEffect, useState } from "react";

interface AsyncResourceState<T> {
  data: T;
  error: string | null;
  loading: boolean;
}

export function useAsyncResource<T>(
  loader: () => Promise<T>,
  dependencies: DependencyList,
  initialData: T
): AsyncResourceState<T> {
  const [state, setState] = useState<AsyncResourceState<T>>({
    data: initialData,
    error: null,
    loading: true
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: loader is intentionally excluded to prevent infinite loops
  useEffect(() => {
    let isCancelled = false;

    setState((current) => ({
      ...current,
      error: null,
      loading: true
    }));

    void loader()
      .then((data) => {
        if (isCancelled) {
          return;
        }

        setState({
          data,
          error: null,
          loading: false
        });
      })
      .catch((error: unknown) => {
        if (isCancelled) {
          return;
        }

        setState((current) => ({
          data: current.data,
          error: error instanceof Error ? error.message : "Unable to load data.",
          loading: false
        }));
      });

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return state;
}
