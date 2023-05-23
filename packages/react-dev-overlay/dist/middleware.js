import { codeFrameColumns } from '@babel/code-frame';
import { constants as FS, promises as fs } from 'fs';
import path from 'path';
import { SourceMapConsumer } from 'source-map';
import url from 'url';
import { getRawSourceMap } from './internal/helpers/getRawSourceMap';
import { launchEditor } from './internal/helpers/launchEditor';
export { getErrorSource } from './internal/helpers/nodeStackFrames';
export { decorateServerError, getServerError, } from './internal/helpers/nodeStackFrames';
export { parseStack } from './internal/helpers/parseStack';
function getModuleId(compilation, module) {
    return compilation.chunkGraph.getModuleId(module);
}
function getModuleById(id, compilation) {
    return [...compilation.modules].find((searchModule) => {
        const moduleId = getModuleId(compilation, searchModule);
        return moduleId === id;
    });
}
function findModuleNotFoundFromError(errorMessage) {
    const match = errorMessage?.match(/'([^']+)' module/);
    return match && match[1];
}
function getModuleSource(compilation, module) {
    return ((module &&
        compilation.codeGenerationResults
            .get(module)
            ?.sources.get('javascript')) ??
        null);
}
function getSourcePath(source) {
    // Webpack prefixes certain source paths with this path
    if (source.startsWith('webpack:///')) {
        return source.substring(11);
    }
    // Make sure library name is filtered out as well
    if (source.startsWith('webpack://_N_E/')) {
        return source.substring(15);
    }
    if (source.startsWith('webpack://')) {
        return source.substring(10);
    }
    return source;
}
async function findOriginalSourcePositionAndContent(webpackSource, position) {
    const consumer = await new SourceMapConsumer(webpackSource.map());
    try {
        const sourcePosition = consumer.originalPositionFor({
            line: position.line,
            column: position.column ?? 0,
        });
        if (!sourcePosition.source) {
            return null;
        }
        const sourceContent = consumer.sourceContentFor(sourcePosition.source, 
        /* returnNullOnMissing */ true) ?? null;
        return {
            sourcePosition,
            sourceContent,
        };
    }
    finally {
        consumer.destroy();
    }
}
function findOriginalSourcePositionAndContentFromCompilation(moduleId, importedModule, compilation) {
    const module = getModuleById(moduleId, compilation);
    return module?.buildInfo?.importLocByPath?.get(importedModule) ?? null;
}
function findCallStackFramePackage(id, compilation) {
    if (!compilation) {
        return undefined;
    }
    const module = getModuleById(id, compilation);
    return module?.resourceResolveData?.descriptionFileData?.name;
}
export async function createOriginalStackFrame({ line, column, source, sourcePackage, moduleId, modulePath, rootDirectory, frame, errorMessage, clientCompilation, serverCompilation, edgeCompilation, }) {
    const moduleNotFound = findModuleNotFoundFromError(errorMessage);
    const result = await (async () => {
        if (moduleNotFound) {
            let moduleNotFoundResult = null;
            if (clientCompilation) {
                moduleNotFoundResult =
                    findOriginalSourcePositionAndContentFromCompilation(moduleId, moduleNotFound, clientCompilation);
            }
            if (moduleNotFoundResult === null && serverCompilation) {
                moduleNotFoundResult =
                    findOriginalSourcePositionAndContentFromCompilation(moduleId, moduleNotFound, serverCompilation);
            }
            if (moduleNotFoundResult === null && edgeCompilation) {
                moduleNotFoundResult =
                    findOriginalSourcePositionAndContentFromCompilation(moduleId, moduleNotFound, edgeCompilation);
            }
            return moduleNotFoundResult;
        }
        return await findOriginalSourcePositionAndContent(source, {
            line,
            column,
        });
    })();
    if (result === null) {
        return null;
    }
    const { sourcePosition, sourceContent } = result;
    if (!sourcePosition.source) {
        return null;
    }
    const filePath = path.resolve(rootDirectory, getSourcePath(
    // When sourcePosition.source is the loader path the modulePath is generally better.
    (sourcePosition.source.includes('|')
        ? modulePath
        : sourcePosition.source) || modulePath));
    const originalFrame = {
        file: sourceContent
            ? path.relative(rootDirectory, filePath)
            : sourcePosition.source,
        lineNumber: sourcePosition.line,
        column: sourcePosition.column,
        methodName: sourcePosition.name ||
            // default is not a valid identifier in JS so webpack uses a custom variable when it's an unnamed default export
            // Resolve it back to `default` for the method name if the source position didn't have the method.
            frame.methodName
                ?.replace('__WEBPACK_DEFAULT_EXPORT__', 'default')
                ?.replace('__webpack_exports__.', ''),
        arguments: [],
    };
    const originalCodeFrame = !(originalFrame.file?.includes('node_modules') ?? true) &&
        sourceContent &&
        sourcePosition.line
        ? codeFrameColumns(sourceContent, {
            start: {
                line: sourcePosition.line,
                column: sourcePosition.column ?? 0,
            },
        }, { forceColor: true })
        : null;
    return {
        originalStackFrame: originalFrame,
        originalCodeFrame,
        sourcePackage,
    };
}
export async function getSourceById(isFile, id, compilation) {
    if (isFile) {
        const fileContent = await fs
            .readFile(id, 'utf-8')
            .catch(() => null);
        if (fileContent == null) {
            return null;
        }
        const map = getRawSourceMap(fileContent);
        if (map == null) {
            return null;
        }
        return {
            map() {
                return map;
            },
        };
    }
    try {
        if (!compilation) {
            return null;
        }
        const module = getModuleById(id, compilation);
        return getModuleSource(compilation, module);
    }
    catch (err) {
        console.error(`Failed to lookup module by ID ("${id}"):`, err);
        return null;
    }
}
function getOverlayMiddleware(options) {
    return async function (req, res, next) {
        const { pathname, query } = url.parse(req.url, true);
        if (pathname === '/__nextjs_original-stack-frame') {
            const frame = query;
            const isAppDirectory = frame.isAppDirectory === 'true';
            const isServerError = frame.isServer === 'true';
            const isEdgeServerError = frame.isEdgeServer === 'true';
            const isClientError = !isServerError && !isEdgeServerError;
            if (!((frame.file?.startsWith('webpack-internal:///') ||
                frame.file?.startsWith('file://')) &&
                Boolean(parseInt(frame.lineNumber?.toString() ?? '', 10)))) {
                res.statusCode = 400;
                res.write('Bad Request');
                return res.end();
            }
            const moduleId = frame.file.replace(/^(webpack-internal:\/\/\/|file:\/\/)/, '');
            const modulePath = frame.file.replace(/^(webpack-internal:\/\/\/|file:\/\/)(\(.*\)\/)?/, '');
            let source = null;
            let sourcePackage = undefined;
            const clientCompilation = options.stats()?.compilation;
            const serverCompilation = options.serverStats()?.compilation;
            const edgeCompilation = options.edgeServerStats()?.compilation;
            try {
                if (isClientError || isAppDirectory) {
                    // Try Client Compilation first
                    // In `pages` we leverage `isClientError` to check
                    // In `app` it depends on if it's a server / client component and when the code throws. E.g. during HTML rendering it's the server/edge compilation.
                    source = await getSourceById(frame.file.startsWith('file:'), moduleId, clientCompilation);
                    sourcePackage = findCallStackFramePackage(moduleId, clientCompilation);
                }
                // Try Server Compilation
                // In `pages` this could be something imported in getServerSideProps/getStaticProps as the code for those is tree-shaken.
                // In `app` this finds server components and code that was imported from a server component. It also covers when client component code throws during HTML rendering.
                if ((isServerError || isAppDirectory) && source === null) {
                    source = await getSourceById(frame.file.startsWith('file:'), moduleId, serverCompilation);
                    sourcePackage = findCallStackFramePackage(moduleId, serverCompilation);
                }
                // Try Edge Server Compilation
                // Both cases are the same as Server Compilation, main difference is that it covers `runtime: 'edge'` pages/app routes.
                if ((isEdgeServerError || isAppDirectory) && source === null) {
                    source = await getSourceById(frame.file.startsWith('file:'), moduleId, edgeCompilation);
                    sourcePackage = findCallStackFramePackage(moduleId, edgeCompilation);
                }
            }
            catch (err) {
                console.log('Failed to get source map:', err);
                res.statusCode = 500;
                res.write('Internal Server Error');
                return res.end();
            }
            if (source == null) {
                res.statusCode = 204;
                res.write('No Content');
                return res.end();
            }
            const frameLine = parseInt(frame.lineNumber?.toString() ?? '', 10);
            let frameColumn = parseInt(frame.column?.toString() ?? '', 10);
            if (!frameColumn) {
                frameColumn = null;
            }
            try {
                const originalStackFrameResponse = await createOriginalStackFrame({
                    line: frameLine,
                    column: frameColumn,
                    source,
                    sourcePackage,
                    frame,
                    moduleId,
                    modulePath,
                    rootDirectory: options.rootDirectory,
                    errorMessage: frame.errorMessage,
                    clientCompilation: isClientError ? clientCompilation : undefined,
                    serverCompilation: isServerError ? serverCompilation : undefined,
                    edgeCompilation: isEdgeServerError ? edgeCompilation : undefined,
                });
                if (originalStackFrameResponse === null) {
                    res.statusCode = 204;
                    res.write('No Content');
                    return res.end();
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.write(Buffer.from(JSON.stringify(originalStackFrameResponse)));
                return res.end();
            }
            catch (err) {
                console.log('Failed to parse source map:', err);
                res.statusCode = 500;
                res.write('Internal Server Error');
                return res.end();
            }
        }
        else if (pathname === '/__nextjs_launch-editor') {
            const frame = query;
            const frameFile = frame.file?.toString() || null;
            if (frameFile == null) {
                res.statusCode = 400;
                res.write('Bad Request');
                return res.end();
            }
            // frame files may start with their webpack layer, like (middleware)/middleware.js
            const filePath = path.resolve(options.rootDirectory, frameFile.replace(/^\([^)]+\)\//, ''));
            const fileExists = await fs.access(filePath, FS.F_OK).then(() => true, () => false);
            if (!fileExists) {
                res.statusCode = 204;
                res.write('No Content');
                return res.end();
            }
            const frameLine = parseInt(frame.lineNumber?.toString() ?? '', 10) || 1;
            const frameColumn = parseInt(frame.column?.toString() ?? '', 10) || 1;
            try {
                await launchEditor(filePath, frameLine, frameColumn);
            }
            catch (err) {
                console.log('Failed to launch editor:', err);
                res.statusCode = 500;
                res.write('Internal Server Error');
                return res.end();
            }
            res.statusCode = 204;
            return res.end();
        }
        return next();
    };
}
export { getOverlayMiddleware };
//# sourceMappingURL=middleware.js.map