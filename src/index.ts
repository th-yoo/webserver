import Koa from 'koa';
import Router from  'koa-router';
import bodyParser from 'koa-bodyparser';
//import JsonRpc from '@koalex/koa-json-rpc';

import {WebSocketServer} from 'ws';

import cors from '@koa/cors';

import http from 'http';
import https from 'https';

import conf from './config';

import static_setup from './static';
import jsonrpc_setup from './jsonrpc';
import sse_setup, {sse_send} from './sse';
import ws_setup from './websocket';

const app = new Koa();
const router = new Router();

//const ws_server = new WebSocketServer({noServer:true});

router.get('/ping', (ctx, next) => {
	ctx.body = 'pong';
	next();
});


jsonrpc_setup(router);
sse_setup(router);
ws_setup(router);

if (conf().frontend.cors) { 
	//app.use(cors({
	//	allowHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept']
	//}));
	app.use(cors(conf().frontend.cors));
}

static_setup(app);
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

function create_server()
{
	if (conf().frontend.protocol === 'http') {
		return http.createServer(app.callback());
	}
	else {
		const {key, cert} = conf().frontend;
		return https.createServer({key, cert}, app.callback());
	}
}

if (require.main === module) {
(async () => {
	const server = create_server();

	const {port, host} = conf().frontend;
	server.listen(port, host);
})();
}
