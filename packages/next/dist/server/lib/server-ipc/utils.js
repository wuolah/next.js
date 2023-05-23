"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    forbiddenHeaders: null,
    filterReqHeaders: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    forbiddenHeaders: function() {
        return forbiddenHeaders;
    },
    filterReqHeaders: function() {
        return filterReqHeaders;
    }
});
const forbiddenHeaders = [
    "accept-encoding",
    "content-length",
    "keepalive",
    "content-encoding",
    "transfer-encoding",
    // https://github.com/nodejs/undici/issues/1470
    "connection"
];
const filterReqHeaders = (headers)=>{
    for (const [key, value] of Object.entries(headers)){
        if (forbiddenHeaders.includes(key) || !(Array.isArray(value) || typeof value === "string")) {
            delete headers[key];
        }
    }
    return headers;
};

//# sourceMappingURL=utils.js.map