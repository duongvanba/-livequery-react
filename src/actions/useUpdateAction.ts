import { useAction } from "./useAction"

export function useUpdateAction<RequestDataType = void, ResultDataType = any>(ref: string, merge: boolean = true, handler?: (data: ResultDataType, error: any, req: RequestDataType) => any) {
  const { error: update_error, excute: update, loading: updating, clear, data } = useAction<RequestDataType, ResultDataType>(ref, merge ? 'PATCH' : 'PUT', handler)

  return {
    updating,
    update_error,
    update,
    data,
    clear
  }
}