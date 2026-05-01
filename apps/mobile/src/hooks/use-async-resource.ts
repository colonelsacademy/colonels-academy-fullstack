import { useEffect, useState, type DependencyList } from "react";

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
  }, dependencies);

  return state;
}
