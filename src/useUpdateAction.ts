import { useAction } from "./useAction"

export function useUpdateAction(ref: string, merge: boolean = true) {
    const { error: update_error, excute: update, loading: updating } = useAction(ref, null, merge ? 'PATCH' : 'PUT')
  
    return {
      updating,
      update_error,
      update
    }
  }