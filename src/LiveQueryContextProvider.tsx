
import React from 'react'
import { PropsWithChildren } from 'react'
import { LiveQueryContext } from "./LiveQueryContext"


export const LiveQueryContextProvider = (props: PropsWithChildren<LiveQueryContext>) => {
  const { children, ... options   } = props
  return (
    <LiveQueryContext.Provider value={options}>
      {children}
    </LiveQueryContext.Provider>
  )
} 