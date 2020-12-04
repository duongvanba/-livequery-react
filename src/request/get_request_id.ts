import { RequestOptions } from "./Request";

export function get_request_id(options: RequestOptions) {
    return `${options.prefix}#${options.uri}#${JSON.stringify(options.query)}`
}