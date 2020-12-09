import { useAction } from "./useAction"

export function useCreateAction<RequestDataType = void, ResultDataType = any>(ref: string, handler?: (data: ResultDataType, error: any, req: RequestDataType) => any) {

  const { error: create_error, excute: create, loading: creating, clear, data } = useAction<RequestDataType, ResultDataType>(ref, 'POST', handler)

  return {
    creating,
    create_error,
    create,
    data,
    clear
  }
}