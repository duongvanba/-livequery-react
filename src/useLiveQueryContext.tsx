import {PropsWithChildren} from 'react'
import { LiveQueryContext } from "./LiveQueryContext"

export const useLiveQueryContext = (props: PropsWithChildren<LiveQueryContext>) => {
    const { children, ...request_options } = props
    return (
      <LiveQueryContext.Provider value={request_options}>
        {children}
      </LiveQueryContext.Provider>
    )
  }
  