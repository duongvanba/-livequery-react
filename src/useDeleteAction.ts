import { useAction } from "./useAction"

export function useDeleteAction(ref: string) {
    const { error, excute, loading } = useAction(ref, null, 'DELETE')
  
    return {
      deleting: loading,
      del: excute,
      delete_error: error
    }
  }