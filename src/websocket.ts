import Router from 'koa-router';
import {WebSocketServer, WebSocket} from 'ws';

import conf from './config';
import {factory_t} from './factory';

class ws_man_t {
	protected socks = new Set<websocket_t>();

	protected static _inst?: ws_man_t;

	constructor()
	{
		setInterval(() => {
			for (const ws of this.socks) {
				ws.send_heartbeat();
			}
		}, 30000);
	}

	add(ws: websocket_t)
	{
		this.socks.add(ws);
	}

	delete(ws: websocket_t)
	{
		this.socks.delete(ws);
	}

	static inst()
	{
		if (!ws_man_t._inst) {
			ws_man_t._inst = new ws_man_t();
		}

		return ws_man_t._inst;
	}
}

class websocket_t {
	protected isAlive = true;
	constructor(protected ws: WebSocket) {
		ws.on('pong', () => {
			this.isAlive = true;
		});

		ws.on('message', async (data, isBinary) => {
			this.isAlive = true;
			// TODO: implement
		});

		ws.on('close', () => {
			ws_man_t.inst().delete(this);
		});

		ws.on('error', () => {
			ws.terminate();
		});

		ws_man_t.inst().add(this);
	}

	send_heartbeat()
	{
		if (!this.isAlive) {
			return this.terminate();
		}

		this.isAlive = false;
		this.ping();
	}

	terminate()
	{
		this.ws.terminate();
	}

	protected ping()
	{
		this.ws.ping();
	}

}

const wss = <factory_t<WebSocketServer>>(() => {
	if (!wss.inst) {
		wss.inst = new WebSocketServer({noServer:true});
	}

	return wss.inst;
});

export default function setup(router: Router)
{
	if (!conf().frontend.ws) return;

	wss().on('connection', (ws, ctx, resolve) => {
		resolve(new websocket_t(ws));
	});

	const {
		path,
	} = conf().frontend.ws!;

	router.get(path, async (ctx, next) => {
		const header = ctx.headers;

		// check websocket upgrade header
		if ( header.connection?.toLowerCase() !== 'upgrade'
		  || header.upgrade?.toLowerCase() !== 'websocket'
		)
		{
			ctx.throw(400, 'Bad Request');
		}

		await new Promise((resolve, reject) => {
			wss().handleUpgrade(
				ctx.req,
				ctx.request.socket,
				ctx.request.rawBody || Buffer.alloc(0),
				ws => {
					wss().emit('connection', ws, ctx, resolve);
				}
			);

			ctx.respond = false;
		});

		await next();
	});
}
