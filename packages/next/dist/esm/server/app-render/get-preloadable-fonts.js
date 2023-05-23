/**
 * Get hrefs for fonts to preload
 * Returns null if there are no fonts at all.
 * Returns string[] if there are fonts to preload (font paths)
 * Returns empty string[] if there are fonts but none to preload and no other fonts have been preloaded
 * Returns null if there are fonts but none to preload and at least some were previously preloaded
 */ export function getPreloadableFonts(serverCSSManifest, nextFontManifest, serverCSSForEntries, filePath, injectedFontPreloadTags) {
    if (!nextFontManifest || !filePath) {
        return null;
    }
    const layoutOrPageCss = serverCSSManifest.cssImports[filePath];
    if (!layoutOrPageCss) {
        return null;
    }
    const fontFiles = new Set();
    let foundFontUsage = false;
    for (const css of layoutOrPageCss){
        // We only include the CSS if it is used by this entrypoint.
        if (serverCSSForEntries.includes(css)) {
            const preloadedFontFiles = nextFontManifest.app[css];
            if (preloadedFontFiles) {
                foundFontUsage = true;
                for (const fontFile of preloadedFontFiles){
                    if (!injectedFontPreloadTags.has(fontFile)) {
                        fontFiles.add(fontFile);
                        injectedFontPreloadTags.add(fontFile);
                    }
                }
            }
        }
    }
    if (fontFiles.size) {
        return [
            ...fontFiles
        ].sort();
    } else if (foundFontUsage && injectedFontPreloadTags.size === 0) {
        return [];
    } else {
        return null;
    }
}

//# sourceMappingURL=get-preloadable-fonts.js.map