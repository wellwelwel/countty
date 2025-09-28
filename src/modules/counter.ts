import type { Env } from '../@types.js';
import { DurableObject } from 'cloudflare:workers';

export class Counter extends DurableObject<Env> {
  sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    const sql =
      'CREATE TABLE IF NOT EXISTS `counter`(`id` INTEGER PRIMARY KEY, `slug` VARCHAR(64) UNIQUE NOT NULL, `views` INTEGER DEFAULT 0);';

    this.sql = ctx.storage.sql;
    this.sql.exec(sql);
  }

  async get(slug: string): Promise<number> {
    const sql = 'SELECT `views` FROM `counter` WHERE slug = ?';
    const results = this.sql.exec(sql, slug).toArray();

    return Number(results[0]?.views) || 0;
  }

  async exists(slug: string): Promise<boolean> {
    const sql = 'SELECT 1 FROM `counter` WHERE `slug` = ? LIMIT 1';
    const results = this.sql.exec(sql, slug).toArray();

    return results.length > 0;
  }

  async increment(slug: string): Promise<number> {
    try {
      const sql = 'UPDATE `counter` SET `views` = `views` + 1 WHERE `slug` = ?';

      this.sql.exec(sql, slug);

      return this.get(slug);
    } catch {
      return 0;
    }
  }

  async create(slug: string): Promise<boolean> {
    const sql = 'INSERT INTO `counter` (`slug`, `views`) VALUES (?, 0)';

    try {
      this.sql.exec(sql, slug);
      return true;
    } catch {
      return false;
    }
  }

  async set(slug: string, views: number): Promise<void> {
    const sql =
      'INSERT INTO `counter` (`slug`, `views`) VALUES (?, ?) ON CONFLICT(`slug`) DO UPDATE SET `views` = `excluded`.`views`';
    this.sql.exec(sql, slug, views);
  }

  async backup(): Promise<{
    filename: string;
    dump: Uint8Array;
  }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `countty_${timestamp}.sql`;
    const schema = this.sql
      .exec(
        "SELECT `sql` FROM `sqlite_master` WHERE `type`='table' AND name='counter'"
      )
      .toArray();
    const data = this.sql
      .exec('SELECT * FROM `counter` ORDER BY `id` ASC')
      .toArray();

    let sqlDump = '-- Counter Database Backup\n';
    sqlDump += `-- Generated at: ${new Date().toISOString()}\n`;
    sqlDump += `-- Filename: ${filename}\n\n`;

    if (schema.length > 0) {
      sqlDump += '-- Table structure\n';
      sqlDump += `${schema[0].sql};\n\n`;
    }

    if (data.length > 0) {
      sqlDump += '-- Table data\n';
      sqlDump += 'INSERT INTO `counter` (`id`, `slug`, `views`) VALUES\n';

      const values = data
        .map((row) => `(${row.id}, '${String(row.slug)}', ${row.views})`)
        .join(',\n');

      sqlDump += `${values};\n\n`;
    } else sqlDump += '-- No data to backup\n\n';

    sqlDump += '-- End of backup\n';

    return {
      filename,
      dump: new TextEncoder().encode(sqlDump),
    };
  }
}
