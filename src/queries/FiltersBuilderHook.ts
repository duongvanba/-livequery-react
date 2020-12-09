import { RequestHook } from "../request/Request"
import { FilterExpressionList } from "./expressions"
 
export const FiltersBuilderHook: RequestHook = {
  beforeRequest(options) {
    const filters = options.query as any
    options.query = Object.keys(filters).reduce((p, c) => {
      p[c] = c[0] == '_' ? filters[c] : `${filters[c].exp}|${JSON.stringify(filters[c].value)}`
      return p
    }, {})
  }
}