import { ExcutorWrapper, useAction } from "./useAction"

export function useCreateAction(ref: string, wrapper?: ExcutorWrapper) {

  const { error: create_error, excute: create, loading: creating } = useAction(ref, null, 'POST', wrapper)

  return {
    creating,
    create_error,
    create
  }
}