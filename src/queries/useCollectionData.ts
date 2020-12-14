import { useContext, useEffect, useRef, useState } from "react"
import { FilterExpressionList, FilterExpressionResult } from "./expressions"
import { Entity } from "./Entity"
import { LiveQueryContext, RealtimeUpdateItem } from "../LiveQueryContext"
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
  const ctx = useContext(LiveQueryContext)
  const refs = ref?.split('?')[0].split('/') || []
  const isCollection = refs.length % 2 == 1


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
      setState(s => ({
        ...s,
        error: null,
        loading: true,
        filters,
        items: flush ? [] : s.items
      }))


      const opts = await ctx.options()
      const request_options: RequestOptions & { hooks: RequestHook[] } = {
        ...opts,
        uri: ref,
        cache: cache_config,
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
        const { data } = await ctx.request(request_options)

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
        const item = await ctx.request<T>(request_options)
        setState(s => ({ ...s, items: item ? [item] : [] }))
      }

    } catch (error) {
      setState(s => ({ ...s, error, loading: false }))
      console.error(error)
    }
    loading_more.current = false
  }

  const realtime_sync = ({ items }: { items: RealtimeUpdateItem[] }) => setState(s => {


    const updated_items = items.reduce((p, c) => (
      c.type == 'modified' && c.data.id && p.set(c.data.id, c.data),
      p
    ), new Map())
    const deleted_items = new Set(items.filter(d => d.type == 'remove').map(d => d.data.id))
    const add_items = items.filter(d => d.type == 'add').map(d => d.data)

    return {
      ...s,
      items: [
        ...add_items,
        ...s.items
          .filter(i => !deleted_items.has(i.id))
          .map(item => ({ ...item, ...updated_items.get(item.id) || {} }))
      ]
    }
  })


  useEffect(() => {
    if (options.reatime == false || !ref) return 
    const path = ref.split('?')[0].replace(/^\/+|\/+$/g, '')
    ctx.subcribe(path, realtime_sync)
    return () => ctx.unsubcribe(path, realtime_sync)
  }, [ref])


  useEffect(() => {
    ref && fetch_data(options.where)
  }, [ref])

  const reload = () => fetch_data(filters, {})

  useEffect(() => {
    ctx.on('re-connected', reload)
    return () => ctx.off('re-connected', reload)
  })


  return {
    items,
    loading,
    error,
    reload,
    reset: () => fetch_data({}),
    fetch_more: () => fetch_data({ ...filters, _cursor: cursor }, undefined, false),
    filter: (filters) => fetch_data(filters, {}),
    has_more,
    empty: items.length == 0 && !loading && !error,
    filters
  }
}
