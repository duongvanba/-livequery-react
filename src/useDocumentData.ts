import { useCollectionData, useCollectionDataOptions } from "./useCollectionData"

export const useDocumentData = <T extends { id: string }>(
  ref: string,
  options: Partial<useCollectionDataOptions<T>> = {}
) => {

  const { items, loading, error, reload } = useCollectionData<T>(ref, options)

  return {
    item: items[0],
    loading,
    error,
    reload
  }

}
