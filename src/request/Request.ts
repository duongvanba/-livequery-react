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

export async function Request<T>(doptions: RequestOptions) {
    const options = {
        method: 'get',
        ...doptions
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

    try {
        const query = options.query && stringify(options.query)
        const response = await fetch(`${options.prefix || ''}${options.uri}?${query}`, {
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

        for (const hook of hooks) {
            const data = hook.onResponse ? await hook.onResponse(options, response.clone()) : undefined
            if (data !== undefined) return data
        }

        return await response?.json() as T
    } catch (e) { 
        for (const hook of hooks) {
            const data = hook.onNetworkError ? await hook.onNetworkError(options) : undefined
            if (data !== undefined) return data
        }
    }
}