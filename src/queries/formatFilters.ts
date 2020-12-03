import { FilterExpressionList, FilterExpressionResult } from "./expressions"

export function formatFilters<T>(filters: FilterExpressionList<T> = {}) {
    return Object.keys(filters).reduce((p, c) => {

        p[c] = (filters[c]?.exp || c[0] == '_') ? filters[c] : { exp: 'eq', value: filters[c] }
        return p
    }, {}) as FilterExpressionResult<T>
}