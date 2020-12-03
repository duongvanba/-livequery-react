import { useAction } from "./useAction"

export function useDeleteAction<RequestDataType, ResultDataType = any>(ref: string, handler?: (data: ResultDataType, error: any) => any) {

  const { error, excute, loading, data, clear } = useAction<RequestDataType, ResultDataType>(ref, 'DELETE', handler)

  return {
    deleting: loading,
    del: excute,
    delete_error: error,
    data,
    clear
  }
}