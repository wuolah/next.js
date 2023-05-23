import { IncomingMessage, ServerResponse } from 'http';
import type { RawSourceMap } from 'source-map';
import { StackFrame } from 'stacktrace-parser';
import type webpack from 'webpack';
export { getErrorSource } from './internal/helpers/nodeStackFrames';
export { decorateServerError, getServerError, } from './internal/helpers/nodeStackFrames';
export { parseStack } from './internal/helpers/parseStack';
export declare type OverlayMiddlewareOptions = {
    rootDirectory: string;
    stats(): webpack.Stats | null;
    serverStats(): webpack.Stats | null;
    edgeServerStats(): webpack.Stats | null;
};
export declare type OriginalStackFrameResponse = {
    originalStackFrame: StackFrame;
    originalCodeFrame: string | null;
    sourcePackage?: string;
};
declare type Source = {
    map: () => RawSourceMap;
} | null;
export declare function createOriginalStackFrame({ line, column, source, sourcePackage, moduleId, modulePath, rootDirectory, frame, errorMessage, clientCompilation, serverCompilation, edgeCompilation, }: {
    line: number;
    column: number | null;
    source: any;
    sourcePackage?: string;
    moduleId?: string;
    modulePath?: string;
    rootDirectory: string;
    frame: any;
    errorMessage?: string;
    clientCompilation?: webpack.Compilation;
    serverCompilation?: webpack.Compilation;
    edgeCompilation?: webpack.Compilation;
}): Promise<OriginalStackFrameResponse | null>;
export declare function getSourceById(isFile: boolean, id: string, compilation?: webpack.Compilation): Promise<Source>;
declare function getOverlayMiddleware(options: OverlayMiddlewareOptions): (req: IncomingMessage, res: ServerResponse, next: Function) => Promise<any>;
export { getOverlayMiddleware };
