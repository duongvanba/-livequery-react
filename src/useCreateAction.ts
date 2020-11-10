import { useAction } from "./useAction"

export function useCreateAction(ref: string, handler?: (data: any, error: any) => any) {

  const { error: create_error, excute: create, loading: creating, clear, data } = useAction(ref, null, 'POST', handler)

  return {
    creating,
    create_error,
    create,
    data,
    clear
  }
}