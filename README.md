# `node-fetch` - [Wechat Miniprogram](https://developers.weixin.qq.com/miniprogram/dev/framework/) compatible

Forked from supabase/node-fetch, the origional documentation can be found in <https://github.com/supabase/node-fetch>

## Usage

As it serves only as a submodule and workspace dependency in <https://github.com/supabase-wechat/supabase-js>, there will be no independent builds out of this repository.

## Background and major changes

### Background

Using `@supabase/supabase-js`, a user can use a custom fetch based on specific requirements.

```javascript
new SupabaseClient(url, key, {
  global: {
    fetch: customFetch
  }
})
```

This setting is passed down to other `@supabase` js clients that `supabase-js` requires (eg: `auth-js`, `postgrest-js`, etc). Some of them statically import `node-fetch` which may throw an error from `node-fetch/browser.js`.

postgrest-js/src/PostgrestBuilder.ts

<https://github.com/supabase/postgrest-js/blob/cc9344a8221d099fff0f0386de0cd0e819068751/src/PostgrestBuilder.ts#L2>

```javascript
import nodeFetch from '@supabase/node-fetch' 
```

```text
TypeError: Cannot read property 'bind' of undefined
    at path/to/node_modules/@supabase/node-fetch/browser.js
```

The error is thrown when the runtime environment does not have native fetch on globalObject at all.

<https://github.com/supabase/node-fetch/blob/bd8f50a4ae647e56cda296b8301d7dff01d4a87b/browser.js#L18>

```javascript
/* @supabase/node-fetch/browser.js#L18 */
export default globalObject.fetch.bind(globalObject);
```

### Changes

The correct way is to dynamic import `node-fetch` only if required. Before these changes are officialy resolved (<https://github.com/supabase/supabase-js/issues/1303>, <https://github.com/supabase/postgrest-js/issues/574>), polyfill `node-fetch` locally is easier.

- remove wx incompatible `globalObject.fetch.bind(globalObject)` in `browser.js`

```javascript
// export default globalObject.fetch.bind(globalObject);
```
