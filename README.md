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

### Status

This repo is archived. To make @supabase/supabase-js not be broken by this issue in wx envronment, just add a postinstall script and force modify this file.

```javascript
/**
 * patch-node-fetch
 * fixes: TypeError: Cannot read property 'bind' of undefined
 */

const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../node_modules/@supabase/node-fetch/browser.js');

if (!fs.existsSync(targetFile)) {
  console.error('File not found:', targetFile);
  console.error('Run `yarn install` first');
  process.exit(1);
}

try {
  let content = fs.readFileSync(targetFile, 'utf-8');

  if (content.includes('// export default globalObject.fetch.bind(globalObject);') &&
      content.includes('export default globalObject.fetch;')) {
    console.log('Patch is made already');
    process.exit(0);
  }

  content = content.replace(
    'export default globalObject.fetch.bind(globalObject);',
    '// export default globalObject.fetch.bind(globalObject);\nexport default globalObject.fetch;'
  );

  fs.writeFileSync(targetFile, content, 'utf-8');
  console.log('Patch is made to:', targetFile);
  console.log('Fixed: TypeError: Cannot read property \'bind\' of undefined');
} catch (error) {
  console.error('Error while trying to patch:', error);
  process.exit(1);
}
```
