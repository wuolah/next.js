import * as React from 'react';
import { Dialog, DialogBody, DialogContent, DialogHeader, } from '../components/Dialog';
import { Overlay } from '../components/Overlay';
import { Terminal } from '../components/Terminal';
import { noop as css } from '../helpers/noop-template';
export const BuildError = function BuildError({ message, }) {
    const noop = React.useCallback(() => { }, []);
    return (React.createElement(Overlay, { fixed: true },
        React.createElement(Dialog, { type: "error", "aria-labelledby": "nextjs__container_build_error_label", "aria-describedby": "nextjs__container_build_error_desc", onClose: noop },
            React.createElement(DialogContent, null,
                React.createElement(DialogHeader, { className: "nextjs-container-build-error-header" },
                    React.createElement("h4", { id: "nextjs__container_build_error_label" }, "Failed to compile")),
                React.createElement(DialogBody, { className: "nextjs-container-build-error-body" },
                    React.createElement(Terminal, { content: message }),
                    React.createElement("footer", null,
                        React.createElement("p", { id: "nextjs__container_build_error_desc" },
                            React.createElement("small", null, "This error occurred during the build process and can only be dismissed by fixing the error."))))))));
};
export const styles = css `
  .nextjs-container-build-error-header > h4 {
    line-height: 1.5;
    margin: 0;
    padding: 0;
  }

  .nextjs-container-build-error-body footer {
    margin-top: var(--size-gap);
  }
  .nextjs-container-build-error-body footer p {
    margin: 0;
  }

  .nextjs-container-build-error-body small {
    color: #757575;
  }
`;
//# sourceMappingURL=BuildError.js.map