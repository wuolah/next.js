/// <reference types="node" />
import type { Options as DevServerOptions } from './dev/next-dev-server';
import type { NextConfigComplete } from './config-shared';
import type { IncomingMessage, ServerResponse } from 'http';
import type { NextUrlWithParsedQuery } from './request-meta';
import './require-hook';
import './node-polyfill-fetch';
import './node-polyfill-crypto';
import { default as Server } from './next-server';
export declare type NextServerOptions = Partial<DevServerOptions> & {
    preloadedConfig?: NextConfigComplete;
    internal_setStandaloneConfig?: boolean;
};
export interface RequestHandler {
    (req: IncomingMessage, res: ServerResponse, parsedUrl?: NextUrlWithParsedQuery | undefined): Promise<void>;
}
declare const SYMBOL_SET_STANDALONE_MODE: unique symbol;
declare const SYMBOL_LOAD_CONFIG: unique symbol;
export declare class NextServer {
    private serverPromise?;
    private server?;
    private reqHandlerPromise?;
    private preparedAssetPrefix?;
    private standaloneMode?;
    options: NextServerOptions;
    constructor(options: NextServerOptions);
    get hostname(): string | undefined;
    get port(): number | undefined;
    [SYMBOL_SET_STANDALONE_MODE](): void;
    getRequestHandler(): RequestHandler;
    getUpgradeHandler(): (req: IncomingMessage, socket: any, head: any) => Promise<void>;
    setAssetPrefix(assetPrefix: string): void;
    logError(...args: Parameters<Server['logError']>): void;
    render(...args: Parameters<Server['render']>): Promise<void>;
    renderToHTML(...args: Parameters<Server['renderToHTML']>): Promise<string | null>;
    renderError(...args: Parameters<Server['renderError']>): Promise<void>;
    renderErrorToHTML(...args: Parameters<Server['renderErrorToHTML']>): Promise<string | null>;
    render404(...args: Parameters<Server['render404']>): Promise<void>;
    serveStatic(...args: Parameters<Server['serveStatic']>): Promise<void>;
    prepare(): Promise<void>;
    close(): Promise<any>;
    private createServer;
    private [SYMBOL_LOAD_CONFIG];
    private getServer;
    private getServerRequestHandler;
}
declare function createServer(options: NextServerOptions): NextServer;
export default createServer;
