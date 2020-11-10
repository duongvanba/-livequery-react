import { ExcutorWrapper, useAction } from "./useAction"

export function useUpdateAction(ref: string, merge: boolean = true, wrapper?: ExcutorWrapper) {
  const { error: update_error, excute: update, loading: updating } = useAction(ref, null, merge ? 'PATCH' : 'PUT', wrapper)

  return {
    updating,
    update_error,
    update
  }
}