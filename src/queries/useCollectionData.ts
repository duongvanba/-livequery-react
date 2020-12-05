import { useEffect, useRef, useState, useContext } from "react"
import { FilterExpressionList, FilterExpressionResult } from "./expressions"
import { Entity } from "./Entity"
import { LiveQueryContext } from "../LiveQueryContext"
import { formatFilters } from "./formatFilters"
import { buildFilters } from "./buildFilters"
import { CacheOption, Request, RequestOptions } from "../request/Request"





export type useCollectionDataOptions<T extends Entity> = {
  limit: number,
  where: FilterExpressionList<T>
  fields: string
  reatime: boolean | Function,
  cache: CacheOption | true
}


export const useCollectionData = <T extends Entity>(
  ref: string,
  options: Partial<useCollectionDataOptions<T>> = {}
) => {

  const refs = ref?.split('/') || []
  const isCollection = refs.length % 2 == 1
  const ctx = useContext(LiveQueryContext)
  const cache_options = options.cache == true ? { update: true, use: true } : options.cache

  const [{ error, loading, cursor, has_more, items, filters }, setState] = useState<{
    items: T[],
    loading: boolean,
    error: any,
    has_more: boolean,
    cursor: string,
    filters: FilterExpressionResult<T>
  }>({
    items: [],
    loading: true,
    error: null,
    has_more: false,
    cursor: null,
    filters: formatFilters(options.where)
  })


  // Fetch data
  const loading_more = useRef(false)


  async function fetch_data(
    filters: FilterExpressionList<T> = {},
    cache_config: CacheOption = {}
  ) {

    if (loading_more.current) return
    loading_more.current = true

    try {

      setState(s => ({ ...s, error: null, loading: true, filters: formatFilters(filters) }))

      const request_options: RequestOptions = {
        uri: ref,
        Vcache: cache_config || cache_options,
        query: {
          _limit: options.limit,
          _fields: options.fields,
          ...buildFilters<T>(filters),
        },
        ...await ctx.options()
      }

      // If collection
      if (isCollection) {

        const { data } = await Request(request_options)

        setState(s => {
          const items = [...s.items, ...data?.items || []]
          return {
            ...s,
            cursor: data?.cursor || null,
            items,
            error: null,
            has_more: data?.has_more || false,
            loading: false
          }
        })

        // If not colleciton
      } else {
        const item = await Request<T>(request_options)
        setState(s => ({ ...s, items: item ? [item] : [] }))
      }

    } catch (error) {
      setState(s => ({ ...s, error, loading: false }))
      console.error(error)
    }
    loading_more.current = false
  }

  useEffect(() => {
    ref && fetch_data({}, cache_options)
  }, [ref])


  return {
    items,
    loading,
    error,
    reload: () => fetch_data(filters, {}),
    reset: () => fetch_data({}),
    fetch_more: () => fetch_data({ ...filters, _cursor: cursor }, cache_options),
    filter: (filters) => fetch_data(filters, cache_options),
    has_more,
    empty: items.length == 0 && !loading && !error,
    filters
  }
}
