import JsonRpc from '@koalex/koa-json-rpc';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';

import conf from './config';
import {factory_t} from './factory';

const jsonrpc = <factory_t<JsonRpc>>(() => {
	if (!jsonrpc.inst) {
		jsonrpc.inst = new JsonRpc({
			bodyParser: bodyParser({
				onerror(e, ctx) {
					ctx.status = 200;
					ctx.body = JsonRpc.parseError;
				}
			})
		});
	}

	return jsonrpc.inst;

});

export default function setup(router: Router)
{
	if (!conf().frontend.jsonrpc) return;

	const {
		path,
	} = conf().frontend.jsonrpc!;

	router.post(path, jsonrpc().middleware);

	jsonrpc().method('echo', async (ctx, next) => {
		ctx.body = ctx.jsonrpc.params;
		await next();
	});

	// TODO: add necessary JSON-RPC methods here
}

