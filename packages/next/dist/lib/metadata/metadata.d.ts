/// <reference types="react" />
import type { GetDynamicParamFromSegment } from '../../server/app-render/app-render';
import type { LoaderTree } from '../../server/lib/app-dir-module';
export declare function MetadataTree({ tree, pathname, searchParams, getDynamicParamFromSegment, }: {
    tree: LoaderTree;
    pathname: string;
    searchParams: {
        [key: string]: any;
    };
    getDynamicParamFromSegment: GetDynamicParamFromSegment;
}): Promise<JSX.Element>;
