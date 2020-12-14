
import React, { useEffect, useMemo, useRef } from 'react'
import { PropsWithChildren } from 'react'
import { LiveQuery, LiveQueryContext } from "./LiveQueryContext"
import { RequestOptions } from './request/Request'


export type LiveQueryContextProvider = {
  options?: () => Promise<Partial<RequestOptions>>
  websocket_url?: string
}

export const LiveQueryContextProvider = (props: PropsWithChildren<LiveQueryContextProvider>) => {
  const { children, websocket_url, options } = props

  const livequery = useMemo(() => new LiveQuery(
    options,
    websocket_url
  ), [])

  return (
    <LiveQueryContext.Provider value={livequery}>
      {children}
    </LiveQueryContext.Provider>
  )
} 