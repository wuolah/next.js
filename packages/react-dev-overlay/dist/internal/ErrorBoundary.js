import React from 'react';
class ErrorBoundary extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { error: null };
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error, 
    // Loosely typed because it depends on the React version and was
    // accidentally excluded in some versions.
    errorInfo) {
        this.props.onError(error, errorInfo?.componentStack || null);
        if (!this.props.globalOverlay) {
            this.setState({ error });
        }
    }
    render() {
        // The component has to be unmounted or else it would continue to error
        return this.state.error ||
            (this.props.globalOverlay && this.props.isMounted) ? (
        // When the overlay is global for the application and it wraps a component rendering `<html>`
        // we have to render the html shell otherwise the shadow root will not be able to attach
        this.props.globalOverlay ? (React.createElement("html", null,
            React.createElement("head", null),
            React.createElement("body", null))) : null) : (this.props.children);
    }
}
export { ErrorBoundary };
//# sourceMappingURL=ErrorBoundary.js.map