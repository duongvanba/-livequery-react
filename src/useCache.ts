

export class SimpleCache {

    private storage = new Map<string, any>()

    get(key: string) {
        if(!key) return
        return this.storage.get(key)
    }

    push(key: string, value: any) {
        if(!key) return
        this.storage.set(key, value)
    }
}