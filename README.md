<div align="center">
  <h1>Countty ✚</h1>
  <p>Easily persist your own <b>Page View Counter</b> for free.</p>

[![NPM Version](https://img.shields.io/npm/v/countty.svg?label=&color=70a1ff&logo=npm&logoColor=white)](https://www.npmjs.com/package/countty)
[![NPM Downloads](https://img.shields.io/npm/dm/countty.svg?label=&logo=npm&logoColor=white&color=45aaf2)](https://www.npmjs.com/package/countty)

</div>

---

- Ready for use via [**Cloudflare Workers**](https://developers.cloudflare.com/workers/) and [**Durable Objects**](https://developers.cloudflare.com/durable-objects/) ⛅️
- No hosting, domains, **VPS** or database plans required 💸
- No need to configure servers or databases ✨
- **Countty** can be used both as a plug-in and a self-contained [**Worker**](https://developers.cloudflare.com/workers/) app ⚡️
- **CLI** helper to simplify the creation, backup, and maintenance of your counter 🛠️

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

#### `/remove`

- Removes the specified slug.
- Type: **private**.

```ts
fetch('http://localhost:8787/remove', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer 123456',
  },
  body: JSON.stringify({ slug: 'test' }),
})
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

#### `/reset`

- **Danger:** reset the **Countty** **Durable Object**.
- Type: **private**.

```ts
fetch('http://localhost:8787/reset', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer 123456',
  },
})
  .then((res) => res.json())
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

## 🛠️ CLI Helper

**Countty** includes a powerful CLI helper to simplify the creation, backup, and maintenance of your counter directly from the terminal.

### 📋 Prerequisites

Before using the CLI, make sure you have the required environment variables set:

- `COUNTTY_URL` - Your Countty API base URL (required)
- `COUNTTY_TOKEN` - Your authentication token (required for private commands)

You can set these in a `.env` file or export them directly:

```sh
COUNTTY_URL='https://your-countty-worker.your-subdomain.workers.dev'
COUNTTY_TOKEN='your-secret-token'
```

### ✚ Available Commands

- `create <slug>`: Create a new counter.
- `views <slug>`: View counter statistics.
- `remove <slug>`: Remove an existing counter.
- `backup`: Backup the Countty Durable Object to `./backups/` directory.
- `reset`: ⚠️ Reset all counters.

### 🧩 Options

- `--help` - Show help message
- `--env <path>` - Specify custom .env file path

### 💡 CLI Examples

```sh
# Create a new counter:
npx countty create "my-blog-post"

# View counter statistics:
npx countty views "my-blog-post"

# Remove a counter:
npx countty remove "my-blog-post"

# Create backup:
npx countty backup

# ⚠️ Reset all counters:
npx countty reset

# Using custom .env file:
npx countty --env ./config/.env create "my-blog-post"

# Show help:
npx countty --help
```

> [!TIP]
>
> The CLI automatically loads environment variables from `.env` file in your current directory. Use `--env` flag to specify a different location.

> [!WARNING]
>
> ⚠️ The `reset` command will permanently delete all your counters. Use with caution.

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

type Routes = Record<
  string,
  (ctx: {
    request: Request;
    env: Env;
    Countty: typeof Countty;
  }) => Promise<Response>
>;

const { Countty, routes } = createCountty();

const Worker: ExportedHandler<Env> = {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Your logic...

    const url = new URL(request.url);
    const context = { request, env, Countty };
    const { pathname } = url;

    const notFound = new Response(JSON.stringify({ message: 'Not found.' }), {
      status: 404,
    });

    const routeHandlers: Routes = {
      // Your routes...

      // Personalize your Countty routes:
      '/create': routes.create,
      '/views': routes.views,
      '/remove': routes.remove,
      '/backup': routes.backup,
      '/reset': routes.reset,
    };

    return routeHandlers[pathname](context) || notFound;
  },
};

// Durable Object (SQLite)
export { Countty };

// Your Worker App
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
  table: 'countty',
};

const { Worker, Countty } = createCountty(options);

// Worker App
export default Worker;

// Durable Object (SQLite)
export { Countty };
```
