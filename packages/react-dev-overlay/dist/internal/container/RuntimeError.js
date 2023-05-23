import * as React from 'react';
import { CodeFrame } from '../components/CodeFrame';
import { noop as css } from '../helpers/noop-template';
import { getFrameSource } from '../helpers/stack-frame';
const CallStackFrame = function CallStackFrame({ frame }) {
    // TODO: ability to expand resolved frames
    // TODO: render error or external indicator
    const f = frame.originalStackFrame ?? frame.sourceStackFrame;
    const hasSource = Boolean(frame.originalCodeFrame);
    const open = React.useCallback(() => {
        if (!hasSource)
            return;
        const params = new URLSearchParams();
        for (const key in f) {
            params.append(key, (f[key] ?? '').toString());
        }
        self
            .fetch(`${process.env.__NEXT_ROUTER_BASEPATH || ''}/__nextjs_launch-editor?${params.toString()}`)
            .then(() => { }, () => {
            console.error('There was an issue opening this code in your editor.');
        });
    }, [hasSource, f]);
    return (React.createElement("div", { "data-nextjs-call-stack-frame": true },
        React.createElement("h3", { "data-nextjs-frame-expanded": Boolean(frame.expanded) }, f.methodName),
        React.createElement("div", { "data-has-source": hasSource ? 'true' : undefined, tabIndex: hasSource ? 10 : undefined, role: hasSource ? 'link' : undefined, onClick: open, title: hasSource ? 'Click to open in your editor' : undefined },
            React.createElement("span", null, getFrameSource(f)),
            React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" },
                React.createElement("path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }),
                React.createElement("polyline", { points: "15 3 21 3 21 9" }),
                React.createElement("line", { x1: "10", y1: "14", x2: "21", y2: "3" })))));
};
const RuntimeError = function RuntimeError({ error, }) {
    const firstFirstPartyFrameIndex = React.useMemo(() => {
        return error.frames.findIndex((entry) => entry.expanded &&
            Boolean(entry.originalCodeFrame) &&
            Boolean(entry.originalStackFrame));
    }, [error.frames]);
    const firstFrame = React.useMemo(() => {
        return error.frames[firstFirstPartyFrameIndex] ?? null;
    }, [error.frames, firstFirstPartyFrameIndex]);
    const allLeadingFrames = React.useMemo(() => firstFirstPartyFrameIndex < 0
        ? []
        : error.frames.slice(0, firstFirstPartyFrameIndex), [error.frames, firstFirstPartyFrameIndex]);
    const [all, setAll] = React.useState(firstFrame == null);
    const toggleAll = React.useCallback(() => {
        setAll((v) => !v);
    }, []);
    const leadingFrames = React.useMemo(() => allLeadingFrames.filter((f) => f.expanded || all), [all, allLeadingFrames]);
    const allCallStackFrames = React.useMemo(() => error.frames.slice(firstFirstPartyFrameIndex + 1), [error.frames, firstFirstPartyFrameIndex]);
    const visibleCallStackFrames = React.useMemo(() => allCallStackFrames.filter((f) => f.expanded || all), [all, allCallStackFrames]);
    const canShowMore = React.useMemo(() => {
        return (allCallStackFrames.length !== visibleCallStackFrames.length ||
            (all && firstFrame != null));
    }, [
        all,
        allCallStackFrames.length,
        firstFrame,
        visibleCallStackFrames.length,
    ]);
    return (React.createElement(React.Fragment, null,
        firstFrame ? (React.createElement(React.Fragment, null,
            React.createElement("h2", null, "Source"),
            leadingFrames.map((frame, index) => (React.createElement(CallStackFrame, { key: `leading-frame-${index}-${all}`, frame: frame }))),
            React.createElement(CodeFrame, { stackFrame: firstFrame.originalStackFrame, codeFrame: firstFrame.originalCodeFrame }))) : undefined,
        error.componentStack ? (React.createElement(React.Fragment, null,
            React.createElement("h2", null, "Component Stack"),
            error.componentStack.map((component, index) => (React.createElement("div", { key: index, "data-nextjs-component-stack-frame": true },
                React.createElement("h3", null, component)))))) : null,
        visibleCallStackFrames.length ? (React.createElement(React.Fragment, null,
            React.createElement("h2", null, "Call Stack"),
            visibleCallStackFrames.map((frame, index) => (React.createElement(CallStackFrame, { key: `call-stack-${index}-${all}`, frame: frame }))))) : undefined,
        canShowMore ? (React.createElement(React.Fragment, null,
            React.createElement("button", { tabIndex: 10, "data-nextjs-data-runtime-error-collapsed-action": true, type: "button", onClick: toggleAll },
                all ? 'Hide' : 'Show',
                " collapsed frames"))) : undefined));
};
export const styles = css `
  button[data-nextjs-data-runtime-error-collapsed-action] {
    background: none;
    border: none;
    padding: 0;
    font-size: var(--size-font-small);
    line-height: var(--size-font-bigger);
    color: var(--color-accents-3);
  }

  [data-nextjs-call-stack-frame]:not(:last-child),
  [data-nextjs-component-stack-frame]:not(:last-child) {
    margin-bottom: var(--size-gap-double);
  }

  [data-nextjs-call-stack-frame] > h3,
  [data-nextjs-component-stack-frame] > h3 {
    margin-top: 0;
    margin-bottom: var(--size-gap);
    font-family: var(--font-stack-monospace);
    font-size: var(--size-font);
    color: #222;
  }
  [data-nextjs-call-stack-frame] > h3[data-nextjs-frame-expanded='false'] {
    color: #666;
  }
  [data-nextjs-call-stack-frame] > div {
    display: flex;
    align-items: center;
    padding-left: calc(var(--size-gap) + var(--size-gap-half));
    font-size: var(--size-font-small);
    color: #999;
  }
  [data-nextjs-call-stack-frame] > div > svg {
    width: auto;
    height: var(--size-font-small);
    margin-left: var(--size-gap);

    display: none;
  }

  [data-nextjs-call-stack-frame] > div[data-has-source] {
    cursor: pointer;
  }
  [data-nextjs-call-stack-frame] > div[data-has-source]:hover {
    text-decoration: underline dotted;
  }
  [data-nextjs-call-stack-frame] > div[data-has-source] > svg {
    display: unset;
  }
`;
export { RuntimeError };
//# sourceMappingURL=RuntimeError.js.map