import { LiveQueryContext } from './LiveQueryContext'
import { stringify } from 'query-string'

async function fetch_retry(url: string, options: RequestInit) {
    for (let i = 1; i <= 3; i++) {
        try {
            return await fetch(url, options)
        } catch (e) {
            await new Promise(s => setTimeout(s, 500))
        }
    }
}




export async function request<T>(ctx: LiveQueryContext, uri: string, method: string = 'GET', query: any = {}, data?: any) {

    const { base_url = '', ...options } = ctx.options ? await ctx.options() : {}
    const m = method.toLowerCase()
    const url = `${base_url}${uri.replace(/^\/|\/$/g, '')}${m == 'get' ? '?' + stringify(query) : ''}`
    if (m != 'get' && m != 'delete' && data) {
        options.body = JSON.stringify(data)
        options.headers = { ...options.headers || {}, 'content-type': 'application/json' }
    }
    options.method = method


    const rs = await fetch_retry(url, options)
    if (rs.ok) {
        const body = await rs.text()
        try {
            return JSON.parse(body)
        } catch (e) {
            return body
        }
    }
    throw await rs.json()
}
