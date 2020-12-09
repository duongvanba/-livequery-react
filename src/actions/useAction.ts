import { useContext, useState, useEffect } from 'react'
import { LiveQueryContext } from '../LiveQueryContext'
import { Request } from '../request'

type ActionState<T> = {
    data: T,
    loading: boolean,
    error?: { message: string, [key: string]: any }
}

export function useAction<RequestDataType = void, ResultDataType = any>(
    ref: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'GET' = 'POST',
    handler?: (data: ResultDataType, error: any, req: RequestDataType) => any
) {

    let mounting = true


    const ctx = useContext(LiveQueryContext)

    const [{ data, error, loading }, setState] = useState<ActionState<ResultDataType>>({ data: null, error: null, loading: false })


    async function excute(payload?: RequestDataType, query?: any) {
        setState({ data: null, error: null, loading: true })
        try {
            const options = await ctx.options()
            const data = await Request<ResultDataType>({
                uri: ref,
                method,
                query,
                json: payload,
                ...options
            })
            mounting && setState({ data, error: null, loading: false })
            handler && handler(data, null, payload)
            return data as ResultDataType
        } catch (error) {
            mounting && setState({ data: null, error, loading: false })
            handler && handler(null, error, payload)
        }
    }

    useEffect(() => () => mounting = false, [])

    return {
        data,
        error,
        loading,
        excute,
        clear: () => setState({ data: null, error: null, loading: null })
    }
} 