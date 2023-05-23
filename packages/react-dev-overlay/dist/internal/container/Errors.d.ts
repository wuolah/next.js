import * as React from 'react';
import { UnhandledError, UnhandledRejection } from '../bus';
export declare type SupportedErrorEvent = {
    id: number;
    event: UnhandledError | UnhandledRejection;
};
export declare type ErrorsProps = {
    errors: SupportedErrorEvent[];
};
export declare const Errors: React.FC<ErrorsProps>;
export declare const styles: string;
