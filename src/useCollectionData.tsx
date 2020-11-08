import { useEffect, useRef, useState, useContext } from "react"
import { request } from "./request"
import { LiveQueryContext } from "./LiveQueryContext"
import { Response } from "./Response"

export enum FilterFunctions {
  "==" = "eq",
  "!=" = "ne",
  ">" = "gt",
  ">=" = "gte",
  "<" = "lt",
  "<=" = "lte",
}


export type useCollectionDataOptions<T extends { id: string }, K extends keyof T = keyof T> = {
  limit: number,
  where: Array<[
    K,
    "==" | "!=" | ">" | ">=" | "<" | "<=",
    string | number | boolean
  ]>
  fields: Array<keyof T>
  autoFetch: boolean
  reatime: boolean | Function
}






export const useCollectionData = <T extends { id: string }, K extends keyof T = keyof T>(
  ref: string,
  options: Partial<useCollectionDataOptions<T, K>> = {}
) => {

  const { autoFetch = true, fields = [], limit = 10, reatime = false, where = [] } = options

  const ctx = useContext(LiveQueryContext)

  const refs = ref?.split('/') || []


  const filters = where.reduce((p, [field, fn, value]) => {
    p[field as string] = `${FilterFunctions[fn]}|${JSON.stringify(value)}`
    return p
  }, {})

  const items = useRef<T[]>([])
  const loading = useRef<boolean>(false)
  const [error, set_error] = useState(null)
  const cursor = useRef<string>(null)
  const [_, __] = useState(0)
  const has_more = useRef(false)
  const re_render = () => __(Math.random())

  async function fetchMore(_cursor?: string) {

    // Prevent duplicate
    if (loading.current) return
    loading.current = true
    re_render()

    try {
      let query_params = {
        _limit: limit,
        _cursor,
        ...filters
      } as any
      fields.length > 0 && (query_params._fields = fields.join(',') as any)
      const rs = await request<Response<T>>(ctx, ref, 'GET', query_params)
      const isCollection = refs.length % 2 == 1
      const data = isCollection ? rs.data : { items: [rs], has_more: false, cursor: null }
      cursor.current = data.cursor
      has_more.current = data.has_more
      data.items.map(item => items.current.push(item))
      loading.current = false
      re_render()
    } catch (e) {
      loading.current = false
      set_error(e)
      throw e
    }

  }

  useEffect(() => { ref && autoFetch && fetchMore() }, [ref, autoFetch])

  function reload() {
    items.current = []
    fetchMore()
  }

  return {
    items: items.current,
    has_more,
    loading: loading.current,
    error,
    fetchMore: () => fetchMore(cursor.current),
    reload,
    empty: items.current.length == 0 && !loading.current
  }
}








