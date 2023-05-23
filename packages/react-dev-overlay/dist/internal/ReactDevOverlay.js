import * as React from 'react';
import * as Bus from './bus';
import { ShadowPortal } from './components/ShadowPortal';
import { BuildError } from './container/BuildError';
import { Errors } from './container/Errors';
import { ErrorBoundary } from './ErrorBoundary';
import { Base } from './styles/Base';
import { ComponentStyles } from './styles/ComponentStyles';
import { CssReset } from './styles/CssReset';
function pushErrorFilterDuplicates(errors, err) {
    return [
        ...errors.filter((e) => {
            // Filter out duplicate errors
            return e.event.reason !== err.event.reason;
        }),
        err,
    ];
}
function reducer(state, ev) {
    switch (ev.type) {
        case Bus.TYPE_BUILD_OK: {
            return { ...state, buildError: null };
        }
        case Bus.TYPE_BUILD_ERROR: {
            return { ...state, buildError: ev.message };
        }
        case Bus.TYPE_BEFORE_REFRESH: {
            return { ...state, refreshState: { type: 'pending', errors: [] } };
        }
        case Bus.TYPE_REFRESH: {
            return {
                ...state,
                buildError: null,
                errors: 
                // Errors can come in during updates. In this case, UNHANDLED_ERROR
                // and UNHANDLED_REJECTION events might be dispatched between the
                // BEFORE_REFRESH and the REFRESH event. We want to keep those errors
                // around until the next refresh. Otherwise we run into a race
                // condition where those errors would be cleared on refresh completion
                // before they can be displayed.
                state.refreshState.type === 'pending'
                    ? state.refreshState.errors
                    : [],
                refreshState: { type: 'idle' },
            };
        }
        case Bus.TYPE_UNHANDLED_ERROR:
        case Bus.TYPE_UNHANDLED_REJECTION: {
            switch (state.refreshState.type) {
                case 'idle': {
                    return {
                        ...state,
                        nextId: state.nextId + 1,
                        errors: pushErrorFilterDuplicates(state.errors, {
                            id: state.nextId,
                            event: ev,
                        }),
                    };
                }
                case 'pending': {
                    return {
                        ...state,
                        nextId: state.nextId + 1,
                        refreshState: {
                            ...state.refreshState,
                            errors: pushErrorFilterDuplicates(state.refreshState.errors, {
                                id: state.nextId,
                                event: ev,
                            }),
                        },
                    };
                }
                default:
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const _ = state.refreshState;
                    return state;
            }
        }
        default: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _ = ev;
            return state;
        }
    }
}
const shouldPreventDisplay = (errorType, preventType) => {
    if (!preventType || !errorType) {
        return false;
    }
    return preventType.includes(errorType);
};
const ReactDevOverlay = function ReactDevOverlay({ children, preventDisplay, globalOverlay }) {
    const [state, dispatch] = React.useReducer(reducer, {
        nextId: 1,
        buildError: null,
        errors: [],
        refreshState: {
            type: 'idle',
        },
    });
    React.useEffect(() => {
        Bus.on(dispatch);
        return function () {
            Bus.off(dispatch);
        };
    }, [dispatch]);
    const onComponentError = React.useCallback((_error, _componentStack) => {
        // TODO: special handling
    }, []);
    const hasBuildError = state.buildError != null;
    const hasRuntimeErrors = Boolean(state.errors.length);
    const errorType = hasBuildError
        ? 'build'
        : hasRuntimeErrors
            ? 'runtime'
            : null;
    const isMounted = errorType !== null;
    return (React.createElement(React.Fragment, null,
        React.createElement(ErrorBoundary, { globalOverlay: globalOverlay, isMounted: isMounted, onError: onComponentError }, children ?? null),
        isMounted ? (React.createElement(ShadowPortal, { globalOverlay: globalOverlay },
            React.createElement(CssReset, null),
            React.createElement(Base, null),
            React.createElement(ComponentStyles, null),
            shouldPreventDisplay(errorType, preventDisplay) ? null : hasBuildError ? (React.createElement(BuildError, { message: state.buildError })) : hasRuntimeErrors ? (React.createElement(Errors, { errors: state.errors })) : undefined)) : undefined));
};
export default ReactDevOverlay;
//# sourceMappingURL=ReactDevOverlay.js.map