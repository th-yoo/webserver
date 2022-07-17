import fs from 'fs';
import path from 'path';

import log from 'loglevel';

import cors from '@koa/cors';

import {factory_t} from './factory';
import ro_t from './readonly';

type protocol_t = 'http' | 'https';

class config_t {
	readonly frontend: {
		protocol: protocol_t;
		host?: string;
		port: number;
		key?: string;
		cert?: string;
		static?: {
			path: string;
			local_path: string;
		};
		jsonrpc?: {
			path: string;
		};
		ws?: {
			path: string;
		};
		sse?: {
			path: string;
		};
		cors?: cors.Options;
	};
	constructor(args: {
		loglevel?: log.LogLevelDesc;
		frontend: {
			protocol?: protocol_t;
			host?: string;
			port: number;
			key?: string;
			cert?: string;
			static?: {
				path: string;
				local_path: string;
			};
			jsonrpc?: {
				path: string;
			};
			ws?: {
				path: string;
			};
			sse?: {
				path: string;
			};
			cors?: cors.Options;
		};
	})
	{
		let loglevel = args.loglevel || 'info';
		try {
			log.setLevel(loglevel);
		}
		catch (e: unknown) {
			log.setLevel('info');
		}

		const arg_frontend : {
			protocol: protocol_t;
			host?: string;
			port: number;
			key?: string;
			cert?: string;
			static?: {
				path: string;
				local_path: string;
			};
			jsonrpc?: {
				path: string;
			};
			ws?: {
				path: string;
			};
			sse?: {
				path: string;
			};
			cors?: cors.Options;
		} = {
			protocol: 'http',
			...args.frontend
		};

		if (arg_frontend.protocol === 'https') {
			const {key, cert} = arg_frontend;
			if (!key || !cert) {
				throw new Error('https needs vaild key and cert config');
			}
		}

		if (arg_frontend.static) {
			if (typeof arg_frontend.static!.path !== 'string') {
				throw new Error('invalid static path config');
			}
			if (typeof arg_frontend.static!.local_path !== 'string') {
				throw new Error('invalid static local_path config');
			}
		}

		if (arg_frontend.jsonrpc) {
			if (typeof arg_frontend.jsonrpc!.path !== 'string') {
				throw new Error('invalid jsonrpc config');
			}
		}

		if (arg_frontend.ws) {
			if (typeof arg_frontend.ws!.path !== 'string') {
				throw new Error('invalid ws config');
			}
		}

		if (arg_frontend.sse) {
			if (typeof arg_frontend.sse!.path !== 'string') {
				throw new Error('invalid sse config');
			}
		}

		this.frontend = {
			...arg_frontend,
			key: arg_frontend.key && fs.readFileSync(path.resolve(
				process.cwd(), arg_frontend.key)).toString() ||
				undefined,
			cert: arg_frontend.cert && fs.readFileSync(path.resolve(
				process.cwd(), arg_frontend.cert)).toString() ||
				undefined
		};
	}
}

const conf = <factory_t<config_t>>(() => {
	if (!conf.inst) {
		const conf_path = path.join(process.cwd(), 'config.json');
		conf.inst = ro_t.create(new config_t(
			JSON.parse(
				fs.readFileSync(conf_path, 'utf8')
			)
		));
	}

	return conf.inst;
});

export default conf;

if (require.main === module) {
	console.log(conf());
}
