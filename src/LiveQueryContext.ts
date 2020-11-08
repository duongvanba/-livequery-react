import { createContext } from 'react'



export type RequestConfig = RequestInit & { base_url?: string }



export type LiveQueryContext = { options?: () => Promise<RequestConfig> | RequestConfig }
export const LiveQueryContext = createContext<LiveQueryContext>({})