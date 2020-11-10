import { ExcutorHandler, useAction } from "./useAction"

export function useDeleteAction(ref: string, handler?: ExcutorHandler) {
  const { error, excute, loading } = useAction(ref, null, 'DELETE', handler)

  return {
    deleting: loading,
    del: excute,
    delete_error: error
  }
}