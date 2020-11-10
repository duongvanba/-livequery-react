import { ExcutorHandler, useAction } from "./useAction"

export function useCreateAction(ref: string, handler?: ExcutorHandler) {

  const { error: create_error, excute: create, loading: creating } = useAction(ref, null, 'POST', handler)

  return {
    creating,
    create_error,
    create
  }
}