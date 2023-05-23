import * as React from 'react';
import { createPortal } from 'react-dom';
export const ShadowPortal = function Portal({ children, globalOverlay, }) {
    let mountNode = React.useRef(null);
    let portalNode = React.useRef(null);
    let shadowNode = React.useRef(null);
    let [, forceUpdate] = React.useState();
    React.useLayoutEffect(() => {
        const ownerDocument = globalOverlay
            ? document
            : mountNode.current.ownerDocument;
        portalNode.current = ownerDocument.createElement('nextjs-portal');
        shadowNode.current = portalNode.current.attachShadow({ mode: 'open' });
        ownerDocument.body.appendChild(portalNode.current);
        forceUpdate({});
        return () => {
            if (portalNode.current && portalNode.current.ownerDocument) {
                portalNode.current.ownerDocument.body.removeChild(portalNode.current);
            }
        };
    }, [globalOverlay]);
    return shadowNode.current ? (createPortal(children, shadowNode.current)) : globalOverlay ? null : (React.createElement("span", { ref: mountNode }));
};
//# sourceMappingURL=ShadowPortal.js.map