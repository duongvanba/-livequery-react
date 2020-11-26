import { useEffect, useRef, useState, useContext } from "react"
import { request } from "./request"
import { LiveQueryContext } from "./LiveQueryContext"
import { Response } from "./Response"
import { useCache } from "./useCache"

export enum FilterFunctions {
  "==" = "eq",
  "!=" = "ne",
  ">" = "gt",
  ">=" = "gte",
  "<" = "lt",
  "<=" = "lte",
}



export const ne = value => `ne|${JSON.stringify(value)}`
export const gt = value => `gt|${JSON.stringify(value)}`
export const gte = value => `gte|${JSON.stringify(value)}`
export const lt = value => `lt|${JSON.stringify(value)}`
export const lte = value => `lte|${JSON.stringify(value)}`

export type ApiObject = {
  id: string
}

export type useCollectionDataOptions<T extends ApiObject> = {
  limit: number,
  where: { [key in keyof T]?: any }
  fields: string
  autoFetch: boolean
  reatime: boolean | Function
}




type State<T> = {
  items: T[],
  loading: boolean,
  error: any,
  has_more: boolean,
  cursor: string,
  filters: { [key in keyof T]?: any }
}

export const useCollectionData = <T extends ApiObject>(
  ref: string,
  options: Partial<useCollectionDataOptions<T>> = {}
) => {

  const { autoFetch = true, fields, limit = 10, reatime = false } = options

  const ctx = useContext(LiveQueryContext)

  const refs = ref?.split('/') || []

  const [cache, setCache] = useCache(ref && `#cache:${ref}#${JSON.stringify(options)}`, [])


  const [{ error, loading, cursor, has_more, items, filters }, setState] = useState<State<T>>({
    items: [],
    loading: autoFetch,
    error: null,
    has_more: false,
    cursor: null,
    filters: options.where
  })

  const isLoading = useRef(false)

  async function fetch_more(newFilters: { [key in keyof T]: string } = {} as any, reset: boolean = false) {
    if (isLoading.current) return
    isLoading.current = true

    try {
      setState(s => ({
        ...s,
        error: null,
        loading: true
      }))

      const mergeFilters = reset ? newFilters : { ...filters, ...newFilters }

      const rs = await request<Response<T>>(ctx, ref, 'GET', {
        _limit: limit,
        _cursor: cursor,
        _fields: fields,
        ...mergeFilters
      })

      const isCollection = refs.length % 2 == 1
      const data = isCollection ? rs.data : { items: [rs], has_more: false, cursor: null }
      setState(s => {
        const items = [...s.items, ...data.items]
        s.items.length == 0 && setCache(items)
        return {
          cursor: data.cursor,
          items,
          error: null,
          has_more: data.has_more,
          loading: false,
          filters: mergeFilters
        }
      })
    } catch (error) {
      setState(s => ({
        ...s,
        error,
        loading: false
      }))
      throw error
    }

    isLoading.current = false
  }

  useEffect(() => {
    setState(s => ({ ...s, items: [], loading: false, error: null }))
    ref && autoFetch && fetch_more()
  }, [ref, autoFetch])

  function reload() {
    setState(s => ({ ...s, error: null, loading: false, items: [] }))
    fetch_more()
  }

  return {
    items: (loading && items.length == 0 && cache) ? cache as T[] : items,
    loading,
    error,
    fetch_more,
    reload,
    has_more,
    empty: items.length == 0 && !loading
  }
} 