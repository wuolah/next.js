import * as React from 'react';
export const Toast = function Toast({ onClick, children, className, }) {
    return (React.createElement("div", { "data-nextjs-toast": true, onClick: onClick, className: className },
        React.createElement("div", { "data-nextjs-toast-wrapper": true }, children)));
};
//# sourceMappingURL=Toast.js.map