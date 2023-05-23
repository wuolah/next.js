import { TYPE_UNHANDLED_ERROR, TYPE_UNHANDLED_REJECTION } from '../bus';
import { getErrorSource } from './nodeStackFrames';
import { getOriginalStackFrames } from './stack-frame';
export async function getErrorByType(ev) {
    const { id, event } = ev;
    switch (event.type) {
        case TYPE_UNHANDLED_ERROR:
        case TYPE_UNHANDLED_REJECTION: {
            const readyRuntimeError = {
                id,
                runtime: true,
                error: event.reason,
                frames: await getOriginalStackFrames(event.frames, getErrorSource(event.reason), event.reason.toString()),
            };
            if (event.type === TYPE_UNHANDLED_ERROR) {
                readyRuntimeError.componentStack = event.componentStack;
            }
            return readyRuntimeError;
        }
        default: {
            break;
        }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = event;
    throw new Error('type system invariant violation');
}
//# sourceMappingURL=getErrorByType.js.map