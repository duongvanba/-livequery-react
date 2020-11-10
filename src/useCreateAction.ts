import { useAction } from "./useAction"

export function useCreateAction(ref: string, wrapper?: (excute: Function) => any) {

  const { error: create_error, excute: create, loading: creating } = useAction(ref, null, 'POST', wrapper)

  return {
    creating,
    create_error,
    create
  }
}