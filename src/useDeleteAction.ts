import { useAction } from "./useAction"

export function useDeleteAction(ref: string, handler?: (data: any, error: any) => any) {
  const { error, excute, loading } = useAction(ref, null, 'DELETE', handler)

  return {
    deleting: loading,
    del: excute,
    delete_error: error
  }
}