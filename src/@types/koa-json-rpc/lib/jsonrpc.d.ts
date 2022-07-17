export = Jsonrpc;
declare class Jsonrpc {
    static requestIsValid(request: any): boolean;
    static handleInvalidRequest(request: any): {
        jsonrpc: string;
    } | {
        jsonrpc: string;
        id: any;
        error: {
            code: number;
            message: string;
        };
    };
    static methodIsValid(method: any): any;
    static isNotification(request: any): boolean;
    static responseIsValid(response: any): boolean;
    static get parseError(): {
        jsonrpc: string;
        id: null;
        error: {
            code: number;
            message: string;
        };
    };
    static get invalidRequest(): {
        jsonrpc: string;
        id: null;
        error: {
            code: number;
            message: string;
        };
    };
    static get methodNotFound(): {
        jsonrpc: string;
        id: null;
        error: {
            code: number;
            message: string;
        };
    };
    constructor(options?: {});
    batch: any;
    invalidParams(data: any): void;
    error: {
        code: number;
        message: string;
    } | {
        code: any;
        message: string;
    } | undefined;
    result: any;
    data: any;
    serverError(code: any, data: any): void;
}
