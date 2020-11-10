import { useContext, useState, useEffect } from 'react'
import { LiveQueryContext } from './LiveQueryContext'
import { request } from './request'


export function useAction(
    ref: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
    handler?: (data: any, error: any) => any
) {

    let mounting = true


    const ctx = useContext(LiveQueryContext)

    const [{ data, error, loading }, setState] = useState({ data: null, error: null, loading: false })


    async function excute(payload: any) {
        setState({ data: null, error: null, loading: true })
        try {
            const data = await request(ctx, ref, method, {}, payload)
            mounting && setState({ data, error: null, loading: false })
            handler && handler(data, null)
        } catch (error) {
            mounting && setState({ data: null, error, loading: false })
            handler && handler(null, error)
            throw error
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