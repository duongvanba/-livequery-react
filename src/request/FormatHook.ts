import { stringify } from "query-string";
import { RequestHook } from "./Request";


export const FormatHook: RequestHook = {
    beforeRequest(options) {

        const query = options.query && stringify(options.query)
        options.url = `${options.prefix || ''}${options.uri}?${query ? `?${query}` : ''}`

        if (options.json) {
            options.body = JSON.stringify(options.json)
            options.headers['Cotent-Type'] = 'application/json'
        }

        if (options.form) {
            options.body = JSON.stringify(options.json)
            options.headers['Cotent-Type'] = 'application/x-www-form-urlencoded'
        }
    },


    async onResponse(options, response) {
        const data = await response?.json()
        if (response.ok) return data
        if (!response.ok) throw data
    }
}