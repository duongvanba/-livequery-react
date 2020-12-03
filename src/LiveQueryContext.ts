import { createContext } from 'react' 
import { RequestOptions } from './request/Request'

export type LiveQueryContext = { options?: () => Promise<Partial<RequestOptions>> }
export const LiveQueryContext = createContext<LiveQueryContext>({}) 
 