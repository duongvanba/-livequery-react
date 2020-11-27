import { useEffect, useRef, useState, useContext } from "react"
import { request } from "./request"
import { LiveQueryContext } from "./LiveQueryContext"
import { Response } from "./Response"
import { useCache } from "./useCache"



export type ApiObject = {
  id: string
}

export const ne = <T>(value: T) => ({ exp: 'ne', value }) as FilterExpression<T>
export const gt = <T>(value: T) => ({ exp: 'gt', value }) as FilterExpression<T>
export const gte = <T>(value: T) => ({ exp: 'gte', value }) as FilterExpression<T>
export const lt = <T>(value: T) => ({ exp: 'lt', value }) as FilterExpression<T>
export const lte = <T>(value: T) => ({ exp: 'lte', value }) as FilterExpression<T>
export const in_array = <T>(value: T[]) => ({ exp: 'in', value }) as FilterExpression<T>


type FilterExpression<T> = { exp: 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'in', value: any }
type FilterExpressionList<T> = { [key in keyof T]?: null | T[key] | FilterExpression<T[key]> } & { _q?: string }
type FilterExpressionResult<T> = { [key in keyof T]?: null | FilterExpression<T[key]> } & { _q?: string }

export type useCollectionDataOptions<T extends ApiObject> = {
  limit: number,
  where: FilterExpressionList<T>
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
  filters: FilterExpressionResult<T>
}

function filters_format<T>(filters: FilterExpressionList<T> = {}) {
  return Object.keys(filters).reduce((p, c) => {
    p[c] = filters[c]?.exp ? filters[c] : { exp: 'eq', value: filters[c] }
    return p
  }, {}) as FilterExpressionResult<T>
}


export const useCollectionData = <T extends ApiObject>(
  ref: string,
  options: Partial<useCollectionDataOptions<T>> = {}
) => {

  const { autoFetch = true, fields, limit = 10 } = options

  const refs = ref?.split('/') || []
  const isCollection = refs.length % 2 == 1

  const ctx = useContext(LiveQueryContext)
  const [cache, setCache] = useCache(ref && `#cache:${ref}#${JSON.stringify(options)}`, [])


  const [{ error, loading, cursor, has_more, items, ...query }, setState] = useState<State<T>>({
    items: [],
    loading: autoFetch,
    error: null,
    has_more: false,
    cursor: null,
    filters: filters_format(options.where)
  })


  // Fetch data
  const loading_more = useRef(false)

  function filters_builder(filters: FilterExpressionList<T>) {
    return Object.keys(filters).reduce((p, c) => {
      p[c] = c[0] == '_' ? filters[c] : `${filters[c].exp}|${JSON.stringify(filters[c].value)}`
      return p
    }, {})
  }

  async function fetch_more() {
    if (loading_more.current) return
    loading_more.current = true

    try {
      setState(s => ({
        ...s,
        error: null,
        loading: true
      }))

      const rs = await request<Response<T>>(ctx, ref, 'GET', {
        _limit: limit,
        _cursor: cursor,
        _fields: fields || undefined,
        ...filters_builder(query.filters)
      })


      const data = isCollection ? rs.data : { items: [rs], has_more: false, cursor: null }

      setState(s => {
        const items = [...s.items, ...data.items]
        s.items.length == 0 && setCache(items)
        return {
          ...s,
          cursor: data.cursor,
          items,
          error: null,
          has_more: data.has_more,
          loading: false
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

    loading_more.current = false
  }


  async function filter(new_filters: FilterExpressionList<T> = {}, merge: boolean = true) {

    const filters = filters_format(!merge ? new_filters : { ...query.filters, ...new_filters })

    try {
      setState(s => ({
        ...s,
        items: [],
        cursor: null,
        error: null,
        loading: true,
        filters
      }))

      const rs = await request<Response<T>>(ctx, ref, 'GET', {
        _limit: limit,
        _fields: fields || undefined,
        ...filters_builder(filters)
      })


      const data = isCollection ? rs.data : { items: [rs], has_more: false, cursor: null }

      setState(s => {
        const items = [...s.items, ...data.items]
        s.items.length == 0 && setCache(items)
        return {
          ...s,
          cursor: data.cursor,
          items,
          error: null,
          has_more: data.has_more,
          loading: false
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
  }

  useEffect(() => {
    ref && autoFetch && fetch_more()
  }, [ref, autoFetch])

  return {
    items: (loading && items.length == 0 && cache) ? cache as T[] : items,
    loading,
    error,
    reload: () => filter(query.filters, false),
    reset: () => filter({}, false),
    fetch_more,
    filter,
    has_more,
    empty: items.length == 0 && !loading,
    filters: query.filters
  }
}
