export function omitUndefined(obj:any){
    return Object.keys(obj).reduce((p,c) => {
        obj[c] !== undefined && (p[c] = obj[c])
        return p
    }, {})
}