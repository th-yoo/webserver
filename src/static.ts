import path from 'path';

import Koa from 'koa';
import mount from 'koa-mount';
import serve from 'koa-static';

import conf from './config';
import {factory_t} from './factory';

export default function setup(app: Koa)
{
	if (!conf().frontend.static) return;

	const {
		path: mount_point,
		local_path
	} = conf().frontend.static!;

	app.use(mount(
		mount_point,
		serve(path.join(
			process.cwd(),
			local_path
		))
	));
}
