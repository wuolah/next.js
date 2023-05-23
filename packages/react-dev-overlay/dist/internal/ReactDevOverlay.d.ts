import * as React from 'react';
declare type ErrorType = 'runtime' | 'build';
declare type ReactDevOverlayProps = {
    children?: React.ReactNode;
    preventDisplay?: ErrorType[];
    globalOverlay?: boolean;
};
declare const ReactDevOverlay: React.FunctionComponent<ReactDevOverlayProps>;
export default ReactDevOverlay;
