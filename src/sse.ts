import {Readable} from 'stream';
import Router from 'koa-router';

import conf from './config';
import {factory_t} from './factory';

export class sse_clients_t {
	protected clients = new Map<string, Readable>();
	protected timer_id?: NodeJS.Timer;

	constructor()
	{
		this.timer_id = setInterval(() => {
			for (const stream of this.clients.values()) {
				stream.push('event: ping\n\n');
			}
		}, 10000);
	}

	create(id: string)
	{
		if (this.clients.has(id)) {
			throw new Error('sse: duplicated id');
		}

		const stream = new Readable({
			read: n => {}
		});

		stream.on('close', () => {
			this.clients.delete(id);
		});

		this.clients.set(id, stream);

		return stream;
	}

	send(id: string, event: string, data: any)
	{
		const client = this.clients.get(id);
		if (!client) return;

		const noti = [`event: ${event}`];

		switch (typeof data) {
		case 'object':
			noti.push(`data: ${JSON.stringify(data)}`);
			break;
		case 'undefined':
			break;
		default:
			noti.push(`data: ${data}`);
		}

		client.push(`${noti.join('\n')}\n\n`);
	}
}

const clients = <factory_t<sse_clients_t>>(() => {
	if (!clients.inst) {
		clients.inst = new sse_clients_t();
	}

	return clients.inst;
});

export function sse_send(id: string, event: string, data: any)
{
	clients().send(id, event, data);
}

export default function setup(router: Router)
{
	if (!conf().frontend.sse) return;

	const {
		path,
	} = conf().frontend.sse!;

	router.get(`${path}/:id`, (ctx, next) => {
		ctx.request.socket.setTimeout(0);
		ctx.req.socket.setNoDelay(true);
		ctx.req.socket.setKeepAlive(true);

		ctx.set({
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		});

		const stream = clients().create(ctx.params.id);

		ctx.status = 200;
		ctx.body = stream;

		next();
	});

	// TODO: add here stuff more
}
