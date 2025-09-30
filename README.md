<div align="center">
  <h1>Countty ✚</h1>
  <p>Easily persist your own <b>Page View Counter</b> for free.</p>
</div>

---

- Ready for use via [**Cloudflare Workers**](https://developers.cloudflare.com/workers/) and [**Durable Objects**](https://developers.cloudflare.com/durable-objects/) ⛅️
- No **VPS** or **Database** plans required 💳
- No need to configure servers or databases ✨
- **Countty** can be used both as a Plug-in and a self-contained [**Worker**](https://developers.cloudflare.com/workers/) app ⚡️

---

## 💻 Quickly try it out locally

> [!TIP]
>
> You can test it locally, even if you don't have a [**Cloudflare**](https://dash.cloudflare.com/) account.

### 📦 Install

```sh
npm i countty
```

### ⛅️ Worker

To use **Countty** as a self-contained **Worker**, create the files:

<b>index.js</code></b>

```ts
import { createCountty } from 'countty';

const { Worker, Countty } = createCountty();

// Worker App
export default Worker;

// Durable Object (SQLite)
export { Countty };
```

- See bellow how to use **Countty** as a plug-in 👋

<details>
<summary><b><code>wrangler.json</code></b></summary>

```json
{
  "name": "countty",
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
  "dev": {
    "port": 8787
  }
}
```

- Change the **Worker** app name in `name` property.
  - Default is `countty`.
- Change the **Worker** main file path in the `main` property.
  - Default is `index.js`.
  - It also supports **TypeScript** files.

</details>

### 🏁 Run

```sh
npx -y wrangler dev
```

> **Example**:
>
> <img src="./.github/assets/sample.png" width="480" />

You can also install [**wrangler**](https://www.npmjs.com/package/wrangler) as a development dependency:

```sh
npm i -D wrangler
```

---

### 🔗 Default API Routes

> [!IMPORTANT]
>
> By default, the token for private routes is `"123456"`. To change it, follow the steps in the next section.

#### `/create`

- Creates a new counter for the specified slug.
- Type: **private**.

```ts
fetch('http://localhost:8787/create', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer 123456',
  },
  body: JSON.stringify({ slug: 'test' }),
})
  .then((res) => res.json())
  .then(console.log);
```

#### `/views`

- Increments a view and returns the number of views for the specified slug.
- Returns `0` when the slug does not exist.
- Type: **public**.

```ts
fetch('http://localhost:8787/views?slug=test')
  .then((res) => res.json())
  .then(console.log);
```

#### `/backup`

- Performs a complete backup of the **Countty Durable Object** and returns the **SQL** dump as plain text.
- Type: **private**.

```ts
fetch('/backup', {
  headers: {
    Authorization: 'Bearer 123456',
  },
})
  .then((res) => res.text())
  .then(console.log);
```

> [!NOTE]
>
> Private routes ensure that other people cannot misuse your counter.

---

## 🔐 Production Usage

For production use, you will need a [**Cloudflare**](https://dash.cloudflare.com/) account to proceed.

### ⛅️ Create your worker

```sh
npx wrangler deploy
```

### 🔑 Personalize your Token

To use in production, please create your personal token:

```sh
npx wrangler secret put TOKEN # Then press `Enter` to insert your token
```

> [!TIP]
>
> Create an `.env` file with the `TOKEN` variable to use the same token locally.

---

## ⚖️ Restrictions on the free plan:

- **Workers:** https://developers.cloudflare.com/workers/platform/pricing/
- **Durable Objects (SQLite):** https://developers.cloudflare.com/durable-objects/platform/pricing/

---

## 🎓 Examples

### ⛅️ Running Countty as a Plug-in

> [!TIP]
>
> As a plug-in, you can also customize the routes.

```ts
/// <reference types="@cloudflare/workers-types" />

import type { Env } from 'countty';
import { createCountty } from 'countty';

const { Countty, routes } = createCountty();

// Durable Object (SQLite)
export { Countty };

const Worker: ExportedHandler<Env> = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const context = { request, env, Countty };

    switch (url.pathname) {
      // Your routes...

      // Personalize your Countty routes
      case '/views':
        return routes.views(context);
      case '/create':
        return routes.create(context);
      case '/backup':
        return routes.backup(context);
    }

    return new Response('Not found', { status: 404 });
  },
};

export default Worker;
```

---

### ✚ Countty Options

You can change the table name by specifying the name when creating **Countty**:

```ts
import type { CounttyOptions } from 'countty';
import { createCountty } from 'countty';

const options: CounttyOptions = {
  // Changes the table name in the SQLite Durable Object.
  table: 'my-table',
};

const { Worker, Countty } = createCountty(options);

// Worker App
export default Worker;

// Durable Object (SQLite)
export { Countty };
```
