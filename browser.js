"use strict";

// ref: https://github.com/tc39/proposal-global
var getGlobal = function() {
    // the only reliable means to get the global object is
    // `Function('return this')()`
    // However, this causes CSP violations in Chrome apps.
    if (typeof self !== 'undefined') { return self; }
    if (typeof window !== 'undefined') { return window; }
    if (typeof global !== 'undefined') { return global; }
    throw new Error('unable to locate global object');
}

var globalObject = getGlobal();

export const fetch = globalObject.fetch;

// The original `globalObject.fetch.bind(globalObject)` will throw.
// `globalObject.fetch` will be `undefined` in wx environment and be replaced by custom fetch implementation
export default globalObject.fetch;

export const Headers = globalObject.Headers;
export const Request = globalObject.Request;
export const Response = globalObject.Response;
