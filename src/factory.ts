export type factory_t<T> = {
	(): T;
	inst: T;
};
