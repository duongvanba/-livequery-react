import { EventEmitter } from 'events'
import { createContext } from 'react'
import { RequestHook, RequestOptions, Request } from './request/Request'


export const RealtimeUpdateBus = new EventEmitter()

export type SocketEvent<T> = T & {
    event: string
}

export type RealtimeUpdateItem = {
    data: { id: string },
    type: 'add' | 'modified' | 'remove'
}

export type RealtimeUpdate = SocketEvent<{
    items: RealtimeUpdateItem[]
    ref: string
}>


export class LiveQuery extends EventEmitter {

    private socket_connection_id: string
    private websocket?: WebSocket
    private connected_amount = 0

    constructor(
        public options: () => Promise<Partial<RequestOptions>>,
        public websocket_url: string
    ) {
        super()
        this.init()
    }

    private update_connection_info(evt: SocketEvent<{ id: string }>) {
        this.socket_connection_id = evt.id
        this.emit('connected', this.connected_amount)
        this.connected_amount++
    }

    private realtime_update(evt: RealtimeUpdate) {
        this.emit(evt.ref, evt)
    }

    private async message_handler(evt: SocketEvent<{ [key: string]: any }>) {
        if (evt.event == 'info') return this.update_connection_info(evt as any)
        if (evt.event == 'realtime-update') return this.realtime_update(evt as any)
    }

    request<T>(opts: RequestOptions & { hooks?: RequestHook[] }) {
        if (this.socket_connection_id) {
            opts.headers["ws_connection_id"] = this.socket_connection_id
        }
        return Request<T>(opts)
    }

    async init() {
        if (!this.websocket_url || typeof WebSocket == 'undefined') return


        console.log('Init websocket')
        while (true) {
            this.websocket = new WebSocket(this.websocket_url)

            // Message handler
            this.websocket.addEventListener('open', () => {
                console.log('Websocket connected')
                this.websocket.addEventListener('message', msg => {
                    this.message_handler(JSON.parse(msg.data))
                })
            })

            // Wait connection close
            await new Promise(s => this.websocket.addEventListener('close', s))
            console.log('Socket closed, reconnect in 3s ...')
            await new Promise(s => setTimeout(s, 3000))
        }
    } 

}


export const LiveQueryContext = createContext<LiveQuery>(null)

