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
- Built-in support for customizable Badges 🛡️
- **CLI** helper to simplify the creation, backup, and maintenance of your counter 🛠️
- **Countty** can be used both as a plug-in and a standalone [**Worker**](https://developers.cloudflare.com/workers/) app ⚡️

---

## 📦 Install

To automatically create all necessary files and install the dependencies, run in an empty directory:

### ⛅️ Standalone (Default)

```sh
npx -y countty@latest init
```

- **Easy:** Creates a self-contained **Worker** exclusive for **Countty**.

### 🧩 Plug-in

```sh
npx -y countty@latest init --plugin
```

- **Advanced:** It exposes **Countty** routes, allowing integration with different routes, as well as customization of existing ones.

---

### 🏁 Run Locally

```sh
npm run dev
```

> **Example**:
>
> <img src="./.github/assets/sample.png" width="480" />

> [!TIP]
>
> - You can test it locally, even if you don't have a [**Cloudflare**](https://dash.cloudflare.com/) account.

---

### 🔗 API Routes

#### `/create`

- Creates a new counter for the specified slug.
- Authentication: **Required**.
- Method: `POST`.
- Body:
  - `slug`: string.

#### `/views` and `/badge` ⭐️

- Increments a view and returns the number of views for the specified slug.
- Returns `0` when the slug does not exist.
- Authentication: **Public**.
- Method: `GET`.

**Examples:**

```sh
<url>/views?slug=github:profile
<url>/badge?slug=github:profile
```

> [!TIP]
>
> 🛡️ You can customize your **Badge**, for example:
>
> - **label**: `<url>/badge?slug:github:profile&label=views`
>   - Default: `views`.
> - **labelColor**: `<url>/badge?slug:github:profile&labelColor=70a1ff`
>   - Label color.
> - **color**: `<url>/badge?slug:github:profile&color=98cc00`
>   - Views background color.
> - **style**: `<url>/badge?slug:github:profile&style=flat`
>   - Supported: `flat`, `flat-square`, `plastic`, `social`, and `for-the-badge`.
> - **logo**: `<url>/badge?slug:github:profile&logo=PHN2Zy...C9zdmc+`
>   - An **SVG** directly encoded to [**Base64**](https://www.base64encode.org/).

#### `/remove`

- Permanently removes the specified slug.
- Authentication: **Required**.
- Method: `POST`.
- Body:
  - `slug`: string.

#### `/backup`

- Backup the **Countty** used table and returns the **SQL** dump as plain text.
- Authentication: **Required**.
- Method: `POST`.

#### `/list`

- Returns the number of slugs and list all **Countty** slugs.
- Authentication: **Required**.
- Method: `POST`.

#### `/reset`

- ⚠️ Permanently reset the **Countty** **Durable Object**.
- Authentication: **Required**.
- Method: `POST`.

#### `/restore`

- ⚠️ Drop the **Countty** used table if it exists, then run the **SQL** dump.
- ℹ️ Experimental.
- Authentication: **Required**.
- Method: `POST`.
- Body: `string` (send the **SQL** backup content directly).

> [!NOTE]
>
> - ⚠️ The `reset` and `restore` routes are destructive actions: use them carefully.

---

## 🔐 Production Usage

For production use, you will need a [**Cloudflare**](https://dash.cloudflare.com/) account to proceed.

### ⛅️ Create your worker

```sh
npm run deploy
```

> [!TIP]
>
> - You can have an `.env` file for development and another for production.
> - Change your **Worker** app name using the `name` property in `wrangler.jsonc`.
>   - Default is `countty`.

### 🔑 Personalize your Tokens

To safe use your token in production without uploading `.env` files, you can create a secret:

```sh
npm run secret # Then put your COUNTTY_TOKEN from .env file.
```

> [!IMPORTANT]
>
> By default, the token is randomly generated with `100` characters and the URL is `"http://localhost:8787"`. You can change it in the `.env` file, for example:
>
> ```sh
> COUNTTY_URL='https://countty.<your-subdomain>.workers.dev'
> COUNTTY_TOKEN='your-secret-token'
> ```

---

## 🛠️ CLI Helper

**Countty** includes a **CLI** helper to simplify the creation, backup, and maintenance of your counter directly from the terminal.

### Available Commands

- `npx countty create <slug>`: Create a new counter.
- `npx countty views <slug>`: View counter statistics.
- `npx countty remove <slug>`: Remove permanently an existing counter.
- `npx countty backup`: Backup the **Countty** used table to `./backups/` directory.
- `npx countty list`: Return the number of slugs and list all **Countty** slugs.
- `npx countty reset`: ⚠️ Reset all counters permanently.
- `npx countty restore <backupPath>.sql`: ⚠️ Drop the **Countty** used table if it exists, then run the **SQL** dump (experimental).

### Options

- `--help` - Show help message.
- `--env <path>` - Specify a custom .env file path.

> [!NOTE]
>
> - ℹ️ It's not possible to use custom routes with the **Counter CLI** helper.
> - ⚠️ The `reset` and `restore` commands are destructive actions: use them carefully.

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
    maxRequests: 100, // Maximum requests allowed in the time window.
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

## 🕵️‍♂️ Transparency

### 📦 `init`

The `init` command installs three dependencies in **package.json**:

#### Dependencies:

- [**countty**](https://www.npmjs.com/package/countty) (_itself_ 👋)

#### Development Dependencies:

- [**@cloudflare/workers-types**](https://www.npmjs.com/package/@cloudflare/workers-types)
- [**wrangler**](https://www.npmjs.com/package/wrangler)

> [!NOTE]
>
> #### [**countty**](https://www.npmjs.com/package/countty) subdependencies
>
> - [**badge-maker**](https://www.npmjs.com/package/badge-maker): To create badges dynamically.
> - [**bcryptjs**](https://www.npmjs.com/package/bcryptjs): For improved authentication security with native **Node.js**.
> - [**lru.min**](https://www.npmjs.com/package/lru.min): For cache in memory, performance improvements, and an efficient rate limit.

---

### ⚖️ Restrictions on the free plan:

- **Workers:** https://developers.cloudflare.com/workers/platform/pricing/
- **Durable Objects:** https://developers.cloudflare.com/durable-objects/platform/pricing/
- **SQLite:** https://developers.cloudflare.com/durable-objects/platform/pricing/#sqlite-storage-backend

<blockquote>

Data retrieved from the above links on <ins>October 1, 2025</ins>:

#### Workers:

- `100,000` requests per day.
- No charge for duration.
- `10 milliseconds` of CPU time per invocation.

#### Durable Objects:

- `100,000` requests per day.
- `13,000 GB-s` per day _(gigabyte-seconds of compute duration while the object is active in memory)_.

#### SQLite:

- `5 million` rows reads per day.
- `100,000` rows writes per day.
- `5 GB` (total) SQL Stored data.

</blockquote>

---

### 🔒 Privacy

**Countty** itself does not collect, process, or analyze any personal data whatsoever. However, **Cloudflare Workers** provides observability dashboards that may log request metadata for monitoring purposes.

- All view count data is stored exclusively in your own **Durable Object** instance and remains under your full control.

> [!TIP]
>
> For even more privacy, you can add the option `"send_metrics": false` to your **wrangler.jsonc** file.

---

## 📄 License

**Countty** is under the [**AGPL-3.0 License**](https://github.com/wellwelwel/countty/blob/main/LICENSE).<br />
Copyright © 2025-present [Weslley Araújo](https://github.com/wellwelwel) and **Countty** [contributors](https://github.com/wellwelwel/countty/graphs/contributors).
