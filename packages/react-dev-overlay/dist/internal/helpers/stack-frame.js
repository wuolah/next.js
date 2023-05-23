export function getOriginalStackFrame(source, type, errorMessage) {
    async function _getOriginalStackFrame() {
        const params = new URLSearchParams();
        params.append('isServer', String(type === 'server'));
        params.append('isEdgeServer', String(type === 'edge-server'));
        params.append('errorMessage', errorMessage);
        for (const key in source) {
            params.append(key, (source[key] ?? '').toString());
        }
        const controller = new AbortController();
        const tm = setTimeout(() => controller.abort(), 3000);
        const res = await self
            .fetch(`${process.env.__NEXT_ROUTER_BASEPATH || ''}/__nextjs_original-stack-frame?${params.toString()}`, {
            signal: controller.signal,
        })
            .finally(() => {
            clearTimeout(tm);
        });
        if (!res.ok || res.status === 204) {
            return Promise.reject(new Error(await res.text()));
        }
        const body = await res.json();
        return {
            error: false,
            reason: null,
            external: false,
            expanded: !Boolean(
            /* collapsed */
            (source.file?.includes('node_modules') ||
                body.originalStackFrame?.file?.includes('node_modules')) ??
                true),
            sourceStackFrame: source,
            originalStackFrame: body.originalStackFrame,
            originalCodeFrame: body.originalCodeFrame || null,
        };
    }
    if (!(source.file?.startsWith('webpack-internal:') ||
        source.file?.startsWith('file:'))) {
        return Promise.resolve({
            error: false,
            reason: null,
            external: true,
            expanded: false,
            sourceStackFrame: source,
            originalStackFrame: null,
            originalCodeFrame: null,
        });
    }
    return _getOriginalStackFrame().catch((err) => ({
        error: true,
        reason: err?.message ?? err?.toString() ?? 'Unknown Error',
        external: false,
        expanded: false,
        sourceStackFrame: source,
        originalStackFrame: null,
        originalCodeFrame: null,
    }));
}
export function getOriginalStackFrames(frames, type, errorMessage) {
    return Promise.all(frames.map((frame) => getOriginalStackFrame(frame, type, errorMessage)));
}
export function getFrameSource(frame) {
    let str = '';
    try {
        const u = new URL(frame.file);
        // Strip the origin for same-origin scripts.
        if (typeof globalThis !== 'undefined' &&
            globalThis.location?.origin !== u.origin) {
            // URLs can be valid without an `origin`, so long as they have a
            // `protocol`. However, `origin` is preferred.
            if (u.origin === 'null') {
                str += u.protocol;
            }
            else {
                str += u.origin;
            }
        }
        // Strip query string information as it's typically too verbose to be
        // meaningful.
        str += u.pathname;
        str += ' ';
    }
    catch {
        str += (frame.file || '(unknown)') + ' ';
    }
    if (frame.lineNumber != null) {
        if (frame.column != null) {
            str += `(${frame.lineNumber}:${frame.column}) `;
        }
        else {
            str += `(${frame.lineNumber}) `;
        }
    }
    return str.slice(0, -1);
}
//# sourceMappingURL=stack-frame.js.map