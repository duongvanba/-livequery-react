type FilterExpression<T> = { exp: 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'in', value: any }


export const ne = <T>(value: T) => ({ exp: 'ne', value }) as FilterExpression<T>
export const gt = <T>(value: T) => ({ exp: 'gt', value }) as FilterExpression<T>
export const gte = <T>(value: T) => ({ exp: 'gte', value }) as FilterExpression<T>
export const lt = <T>(value: T) => ({ exp: 'lt', value }) as FilterExpression<T>
export const lte = <T>(value: T) => ({ exp: 'lte', value }) as FilterExpression<T>
export const in_array = <T>(value: T[]) => ({ exp: 'in', value }) as FilterExpression<T>

export type FilterExpressionList<T> = { _q?: string, _order_by?: keyof T, _sort?: 'asc' | 'desc' } & {
    [key in keyof T]?: null | T[key] | FilterExpression<T[key]>
}
export type FilterExpressionResult<T> = { _q?: string } & {
    [key in keyof T]?: null | FilterExpression<T[key]>
}
