<div align="center">
  <h1>Countty ✚</h1>
  <p>Easily persist your own autonomous <b>Page View Counter</b> for free.</p>

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

## 📦 Create your App

In an empty directory, run:

```sh
npx -y countty@latest init
```

- This will automatically create all the necessary files and install the development dependencies 💫

> [!TIP]
>
> - You can test it locally, even if you don't have a [**Cloudflare**](https://dash.cloudflare.com/) account.
> - Change your **Worker** app name using the `name` property in `wrangler.jsonc`.
>   - Default is `countty`.

> [!IMPORTANT]
>
> By default, the token is randomly generated with `100` characters and the URL is `"http://localhost:8787"`. You can change it in the `.env` file, for example:
>
> ```sh
> COUNTTY_URL='https://countty.<your-subdomain>.workers.dev'
> COUNTTY_TOKEN='your-secret-token'
> ```

---

### ⛅️ Countty Standalone

To use **Countty** as a self-contained **Worker**, modify the `worker.ts` file content to:

```ts
import { createCountty } from 'countty';

const { Worker, Countty } = createCountty();

// Worker App
export default Worker;

// Durable Object (SQLite)
export { Countty };
```

</details>

### 🏁 Run

```sh
npm run dev
```

> **Example**:
>
> <img src="./.github/assets/sample.png" width="480" />

---

### 🔗 API Routes

#### `/create`

```sh
npm run create <slug>
```

- Creates a new counter for the specified slug.
- Type: **private**.

#### `/views`

```sh
npm run views <slug>
```

- Increments a view and returns the number of views for the specified slug.
- Returns `0` when the slug does not exist.
- Type: **public**.

#### `/remove`

```sh
npm run remove <slug>
```

- Permanently removes the specified slug.
- Type: **private**.

#### `/backup`

```sh
npm run backup
```

- Performs a complete backup of the **Countty Durable Object** and returns the **SQL** dump as plain text.
- Type: **private**.

#### `/reset`

```sh
npm run reset
```

- ⚠️ Permanently reset the **Countty** **Durable Object**.
- Type: **private**.

---

## 🔐 Production Usage

For production use, you will need a [**Cloudflare**](https://dash.cloudflare.com/) account to proceed.

### ⛅️ Create your worker

```sh
npm run deploy
```

> [!TIP]
>
> You can have an `.env` file for development and another for production.

### 🔑 Personalize your Token

To safe use your token in production without uploading `.env` files, you can create a secret:

```sh
npx wrangler secret put COUNTTY_TOKEN # Then press `Enter` to insert your token
```

---

## 🛠️ CLI Helper

**Countty** includes a **CLI** helper to simplify the creation, backup, and maintenance of your counter directly from the terminal.

> [!NOTE]
>
> It's not possible to use custom routes with the **Counter CLI**.

### 🧩 Available Commands

- `npx countty create <slug>`: Create a new counter.
- `npx countty views <slug>`: View counter statistics.
- `npx countty remove <slug>`: Remove permanently an existing counter.
- `npx countty backup`: Backup the Countty Durable Object to `./backups/` directory.
- `npx countty reset`: Reset all counters permanently.

### 🕹️ Options

- `--help` - Show help message.
- `--env <path>` - Specify a custom .env file path.

> [!TIP]
>
> The **CLI** automatically loads environment variables from `.env` file in your current directory. Use `--env` flag to specify a different location.

---

### ✚ Countty Options

You can customize your **Countty** using the options available at the time of creation:

```ts
import type { CounttyOptions } from 'countty';
import { createCountty } from 'countty';

const options: CounttyOptions = {
  // Specifies the table name in the SQLite Durable Object.
  table: 'countty',

  // Rate limiting configuration:
  rateLimit: {
    maxRequests: 30, // Maximum requests allowed in the time window.
    windowMs: 10000, // Time window in milliseconds.
    blockDurationMs: 10000, // Block duration when limit exceeded.
  },
};

const { Worker, Countty } = createCountty(options);

// ...
```

> [!IMPORTANT]
>
> Changing the table name won't migrate data from a previous table.

---

## ⚖️ Restrictions on the free plan:

- **Workers:** https://developers.cloudflare.com/workers/platform/pricing/
- **Durable Objects (SQLite):** https://developers.cloudflare.com/durable-objects/platform/pricing/
