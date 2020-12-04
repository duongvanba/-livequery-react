import { stringify } from "query-string"
import { DedupliceRequestHook } from "./DedupliceRequestHook"
import { RequestCacheHook } from "./RequestCacheHook"
import { RetryHook } from "./RetryHook"


const run = (fn: Function) => fn()

export type CacheOption = { use?: boolean, update?: boolean }

export type RequestOptions = RequestInit & {
    prefix?: string
    uri: string
    form?: any,
    json?: any
    retry?: number
    Vcache?: CacheOption,
    query?: { [key: string]: number | string | boolean }
}

export class RequestHook {
    beforeRequest?(options: RequestOptions): Promise<any> | any | void { }
    onResponse?(options: RequestOptions, response: Response): Promise<any> | any | void { }
    onNetworkError?(options: RequestOptions): Promise<any> | any | void { }
}

export async function Request<T>(opts: RequestOptions) {
    const options = {
        method: 'get',
        ...opts
    }
    const hooks = [
        RequestCacheHook,
        DedupliceRequestHook,
        RetryHook
    ]
    for (const hook of hooks) {
        const data = hook.beforeRequest ? await hook.beforeRequest(options) : undefined
        if (data !== undefined) return data
    }

    let response 
    try {
        const query = options.query && stringify(options.query)
        response = await fetch(`${options.prefix || ''}${options.uri}?${query}`, {
            body: run(() => {
                if (options.json) return JSON.stringify(options.json)
                if (options.form) return stringify(options.form)
            }),
            ...options,
            headers: {
                'Content-Type': run(() => {
                    if (options.json) return 'application/json'
                    if (options.form) return 'application/x-www-form-urlencoded'
                }),
                ...options.headers
            }
        })


    } catch (e) {
        for (const hook of hooks) {
            const data = hook.onNetworkError ? await hook.onNetworkError(options) : undefined
            if (data !== undefined) return data
        }
        throw e
    }

    for (const hook of hooks) {
        const data = hook.onResponse ? await hook.onResponse(options, response.clone()) : undefined
        if (data !== undefined) return data
    }

    const data = await response?.json() as T
    if (response.ok) return data
    if (!response.ok) throw data
}