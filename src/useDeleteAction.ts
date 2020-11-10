import { ExcutorWrapper, useAction } from "./useAction"

export function useDeleteAction(ref: string, wrapper?: ExcutorWrapper) {
    const { error, excute, loading } = useAction(ref, null, 'DELETE',wrapper)
  
    return {
      deleting: loading,
      del: excute,
      delete_error: error
    }
  }