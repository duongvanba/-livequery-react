import { useContext, useState, useEffect } from 'react'
import { LiveQueryContext } from './LiveQueryContext'
import { request } from './request'

export type Excutor = (payload: any) => Promise<any>
export type ExcutorWrapper = (excute: Excutor) => Excutor

export function useAction(
    ref: string,
    action?: string,
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
    wrapper?: ExcutorWrapper
) {

    let mounting = true


    const ctx = useContext(LiveQueryContext)

    const [{ data, error, loading }, setState] = useState({ data: null, error: null, loading: false })


    const excutor: Excutor = async (payload: any) => {
        setState({ data: null, error: null, loading: true })
        try {
            const data = await request(ctx, `${ref}${action ? `/${action}` : ''}`, method, {}, payload)
            mounting && setState({ data, error: null, loading: false })
        } catch (error) {
            mounting && setState({ data: null, error, loading: false })
            throw error
        }
    }


    useEffect(() => () => mounting = false, [])

    return {
        data,
        error,
        loading,
        excute: wrapper ? wrapper(excutor) : excutor
    }
}
