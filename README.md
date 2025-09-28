<div align="center">
  <h1>Countty ✚</h1>
  <p>Easily persist your own <b>Page View Counter</b> completely for free.</p>
</div>

---

- Based on Durable Objects and ready for use via Cloudflare Workers ⛅️
- No **VPS** or **Database** plans required ✨

---

> WIP 🚧

---

## Quick Test Locally

```sh
npm i countty
```

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
  ]
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
fetch('http://localhost:8787/create?slug=test', {
  headers: {
    Authorization: 'Bearer 123456',
  },
})
  .then((res) => res.json())
  .then(console.log);
```

- `localhost:8787/views`

```js
fetch('http://localhost:8787/views?slug=test')
  .then((res) => res.json())
  .then(console.log);
```

- `localhost:8787/backup`

```js
fetch('http://localhost:8787/backup', {
  headers: {
    Authorization: 'Bearer 123456',
  },
})
  .then((res) => res.text())
  .then(console.log);
```

---

## Production Usage

### Create your worker

```sh
npx wrangler deploy
```

### Personal Token

🔐 To use in production, please modify your personal token:

```sh
npx wrangler secret put TOKEN # Then press `Enter` to insert your token
```
