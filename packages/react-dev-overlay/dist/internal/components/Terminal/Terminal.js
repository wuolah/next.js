import Anser from 'anser';
import * as React from 'react';
export const Terminal = function Terminal({ content, }) {
    const decoded = React.useMemo(() => {
        return Anser.ansiToJson(content, {
            json: true,
            use_classes: true,
            remove_empty: true,
        });
    }, [content]);
    return (React.createElement("div", { "data-nextjs-terminal": true },
        React.createElement("pre", null, decoded.map((entry, index) => (React.createElement("span", { key: `terminal-entry-${index}`, style: {
                color: entry.fg ? `var(--color-${entry.fg})` : undefined,
                ...(entry.decoration === 'bold'
                    ? { fontWeight: 800 }
                    : entry.decoration === 'italic'
                        ? { fontStyle: 'italic' }
                        : undefined),
            } }, entry.content))))));
};
//# sourceMappingURL=Terminal.js.map