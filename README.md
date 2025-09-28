<div align="center">
  <h1>Countty ✚</h1>
  <p>Easily create your own <b>Page View Counter</b> completely for free.</p>
</div>

---

- Based on Durable Objects and ready for use via Cloudflare Workers ⛅️
- No **VPS** or **Database** plans required ✨

---

> WIP 🚧

---

## Quick Test

> Do not use in production ❗️

### Worker

- `index.js`

```js
import { createCountty } from 'countty';

const { worker, Countty } = createCountty();

export default worker;

export { Countty };
```

- `wrangler.json`

```json
{
  "main": "index.js",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "durable_objects": {
    "bindings": [
      {
        "name": "countty",
        "class_name": "Countty"
      }
    ]
  },
  "migrations": [
    {
      "tag": "v1",
      "new_sqlite_classes": ["Countty"]
    }
  ],
  "vars": {
    "TOKEN": "123456"
  }
}
```

Then, run:

```sh
npx -y wrangler dev
```

---

### API

- `localhost:8787/create`

```js
const create = await fetch('http://localhost:8787/create?slug=test', {
  headers: {
    Authorization: 'Bearer 123456',
  },
});

console.log(await create.json());
```

- `localhost:8787/views`

```js
const views = await fetch('http://localhost:8787/views?slug=test');

console.log(await views.json());
```

- `localhost:8787/backup`

```js
const backup = await fetch('http://localhost:8787/backup', {
  headers: {
    Authorization: 'Bearer 123456',
  },
});

console.log(await backup.text());
```
