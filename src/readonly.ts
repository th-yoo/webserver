export default class ro_t implements ProxyHandler<any> {
	protected cache = {};
	protected constructor() {}

	get(target, prop)
	{
		if (typeof target[prop] === 'object' && target[prop] !== null) {
			if (prop in this.cache) {
				return this.cache[prop];
			}

			const rv = ro_t.create(target[prop]);
			this.cache[prop] = rv;
			return rv;
		}

		return target[prop];
	}

	set(target, prop, value)
	{
		return false;
	}

	static create(o)
	{
		return new Proxy(o, new this());
	}
}

if (require.main === module) {
	const ro = ro_t.create({
		foo: 1,
		bar: {
			baz: 'baz'
		}
	});

	console.log(ro.foo);
	console.log(ro.bar);
	console.log(ro.bar.baz);

	ro.bar.baz = 'BAZ';
}
