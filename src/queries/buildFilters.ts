import { FilterExpressionList } from "./expressions"

export function buildFilters<T>(filters: FilterExpressionList<T>) {
    return Object.keys(filters).reduce((p, c) => {
      p[c] = c[0] == '_' ? filters[c] : `${filters[c].exp}|${JSON.stringify(filters[c].value)}`
      return p
    }, {})
  }