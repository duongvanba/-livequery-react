import { useCollectionData, useCollectionDataOptions } from "./useCollectionData"

export const useDocumentData = <T extends { id: string }, K extends keyof T = keyof T>(
  ref: string,
  options: Partial<useCollectionDataOptions<T, K>> = {}
) => {

  const { items, loading, error, reload } = useCollectionData<T, K>(ref, options)

  return {
    item: items[0],
    loading,
    error,
    reload
  }

}
