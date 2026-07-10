import { useCallback, useState } from 'react';

/**
 * État homogène d'une opération asynchrone : idle → loading → success | error.
 * `T` = donnée produite en cas de succès, `E` = erreur déjà prête à afficher.
 */
export type RequestState<T, E> =
  | { readonly status: 'idle' }
  | { readonly status: 'loading' }
  | { readonly status: 'success'; readonly data: T }
  | { readonly status: 'error'; readonly error: E };

interface UseRequestOptions<T, E> {
  /** Transforme l'erreur brute en une erreur affichable (message + nature). */
  readonly mapError: (error: unknown) => E;
  /** Effet à déclencher au succès (ex. naviguer vers le résultat). */
  readonly onSuccess?: ((data: T) => void) | undefined;
}

interface UseRequestResult<T, E, Args extends readonly unknown[]> {
  readonly state: RequestState<T, E>;
  readonly run: (...args: Args) => Promise<void>;
  readonly reset: () => void;
}

/**
 * Encapsule le cycle d'une requête asynchrone pour éviter de réécrire à la main
 * les états chargement / erreur / résultat dans chaque écran. Volontairement
 * minimal : pas de cache, pas d'annulation — juste un état clair et réutilisable.
 */
export function useRequest<T, E, Args extends readonly unknown[]>(
  task: (...args: Args) => Promise<T>,
  options: UseRequestOptions<T, E>,
): UseRequestResult<T, E, Args> {
  const [state, setState] = useState<RequestState<T, E>>({ status: 'idle' });
  const { mapError, onSuccess } = options;

  const run = useCallback(
    async (...args: Args): Promise<void> => {
      setState({ status: 'loading' });
      try {
        const data = await task(...args);
        setState({ status: 'success', data });
        onSuccess?.(data);
      } catch (error) {
        setState({ status: 'error', error: mapError(error) });
      }
    },
    [task, mapError, onSuccess],
  );

  const reset = useCallback((): void => {
    setState({ status: 'idle' });
  }, []);

  return { state, run, reset };
}
