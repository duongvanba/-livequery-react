import { useAction } from "./useAction"

export function useUpdateAction(ref: string, merge: boolean = true, handler?: (data: any, error: any) => any) {
  const { error: update_error, excute: update, loading: updating } = useAction(ref, null, merge ? 'PATCH' : 'PUT', handler)

  return {
    updating,
    update_error,
    update
  }
}