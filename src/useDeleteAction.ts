import { useAction } from "./useAction"

export function useDeleteAction(ref: string, handler?: (data: any, error: any) => any) {
  const { error, excute, loading, data, clear } = useAction(ref, 'DELETE', handler)

  return {
    deleting: loading,
    del: excute,
    delete_error: error,
    data,
    clear
  }
}