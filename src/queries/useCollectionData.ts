import { useEffect, useRef, useState, useContext } from "react"
import { FilterExpressionList, FilterExpressionResult } from "./expressions"
import { Entity } from "./Entity"
import { LiveQueryContext } from "../LiveQueryContext"
import { formatFilters } from "./formatFilters"
import { FiltersBuilderHook } from "./FiltersBuilderHook"
import { CacheOption, Request, RequestHook, RequestOptions } from "../request/Request"





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
    query_filters: FilterExpressionList<T> = {},
    cache_config: CacheOption = (options.cache == true ? { update: true, use: true } : options.cache),
    flush: boolean = true
  ) {

    if (loading_more.current) return
    loading_more.current = true

    try {
      const filters = formatFilters(query_filters)
      setState(s => ({ ...s, error: null, loading: true, filters, items: flush ? [] : s.items }))


      const opts = await ctx.options()
      const request_options: RequestOptions & { hooks: RequestHook[] } = {
        ...opts,
        uri: ref,
        Vcache: cache_config,
        query: {
          _limit: options.limit,
          _fields: options.fields,
          ...filters as any,
          ...opts.query || {}
        },
        hooks: [FiltersBuilderHook]
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
    ref && fetch_data(options.where)
  }, [ref])


  return {
    items,
    loading,
    error,
    reload: () => fetch_data(filters, {}),
    reset: () => fetch_data({}),
    fetch_more: () => fetch_data({ ...filters, _cursor: cursor }, undefined, false),
    filter: (filters) => fetch_data(filters, {}),
    has_more,
    empty: items.length == 0 && !loading && !error,
    filters
  }
}
