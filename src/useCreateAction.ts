import { useAction } from "./useAction"

export function useCreateAction(ref: string) {
    const { error: create_error, excute: create, loading: creating } = useAction(ref)
  
    return {
      creating,
      create_error,
      create
    }
  }