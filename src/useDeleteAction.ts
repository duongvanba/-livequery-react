import { useAction } from "./useAction"

export function useDeleteAction(ref: string, wrapper?: (excute: Function) => any) {
    const { error, excute, loading } = useAction(ref, null, 'DELETE',wrapper)
  
    return {
      deleting: loading,
      del: excute,
      delete_error: error
    }
  }