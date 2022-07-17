// https://medium.com/@steveruiz/using-a-javascript-library-without-type-declarations-in-a-typescript-project-3643490015f3
// https://www.damirscorner.com/blog/posts/20200911-ExtendingTypescriptTypeDefinitions.html

declare module "@koalex/koa-json-rpc" {

export = Router;
declare class Router {
    static get parseError(): {
        jsonrpc: string;
        id: null;
        error: {
            code: number;
            message: string;
        };
    };
    constructor(props?: {});
    _handlers: {};
    onerror: any;
    parallel: true;
    bodyParser: any;
    method(method: any, ...middlewares: any[]): import("@koalex/koa-json-rpc");
    get methods(): string[];
    hasAllHandlersForRequest(reqBody: any): boolean | undefined;
    get middleware(): import("koa").Middleware<any, any, any> | ((ctx: any, next: any) => Promise<{
        jsonrpc: string;
        id: null;
        error: {
            code: number;
            message: string;
        };
    } | undefined>);
}

}
