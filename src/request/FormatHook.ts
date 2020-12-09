import { stringify } from "query-string";
import { RequestHook } from "./Request";


export const FormatHook: RequestHook = {
    beforeRequest(options) {

        const query = options.query && stringify(options.query)
        options.url = `${options.prefix || ''}${options.uri}${query ? `?${query}` : ''}`

        if (options.method.toLowerCase() == 'get') {
            delete options.form
            delete options.body
            delete options.json
        }

        if (options.json) {
            options.body = JSON.stringify(options.json)
            options.headers['Content-Type'] = 'application/json'
        }

        if (options.form) {
            options.body = JSON.stringify(options.json)
            options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        }
    },


    async onResponse(options, response) {
        let data
        try {
            data = await response?.json()
        } catch (e) {
            return {}
        }

        if (response.ok) return data
        if (!response.ok) throw data
    }
}