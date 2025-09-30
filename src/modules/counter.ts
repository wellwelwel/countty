import type { Env } from '../@types.js';
import { DurableObject } from 'cloudflare:workers';

export const createDurableObject = (stubName: string) =>
  class Countty extends DurableObject<Env> {
    ctx: DurableObjectState<{}>;
    env: Env;
    sql: SqlStorage;
    stubName: string;

    constructor(ctx: DurableObjectState<{}>, env: Env) {
      super(ctx, env);

      this.ctx = ctx;
      this.env = env;
      this.stubName = stubName.trim();
      this.sql = ctx.storage.sql;
      this.sql.exec(
        `CREATE TABLE IF NOT EXISTS \`${this.stubName}\`(\`id\` INTEGER PRIMARY KEY, \`slug\` VARCHAR(255) UNIQUE NOT NULL, \`views\` INTEGER DEFAULT 0);`
      );
    }

    async get(slug: string): Promise<number> {
      const sql = `SELECT \`views\` FROM \`${this.stubName}\` WHERE slug = ?`;
      const results = this.sql.exec(sql, slug).toArray();

      return Number(results[0]?.views) || 0;
    }

    async exists(slug: string): Promise<boolean> {
      const sql = `SELECT 1 FROM \`${this.stubName}\` WHERE \`slug\` = ? LIMIT 1`;
      const results = this.sql.exec(sql, slug).toArray();

      return results.length > 0;
    }

    async increment(slug: string): Promise<number> {
      try {
        const sql = `UPDATE \`${this.stubName}\` SET \`views\` = \`views\` + 1 WHERE \`slug\` = ?`;

        this.sql.exec(sql, slug);

        return this.get(slug);
      } catch {
        return 0;
      }
    }

    async create(slug: string): Promise<boolean> {
      const sql = `INSERT INTO \`${this.stubName}\` (\`slug\`, \`views\`) VALUES (?, 0)`;

      try {
        this.sql.exec(sql, slug);
        return true;
      } catch {
        return false;
      }
    }

    async set(slug: string, views: number): Promise<void> {
      const sql = `INSERT INTO \`${this.stubName}\` (\`slug\`, \`views\`) VALUES (?, ?) ON CONFLICT(\`slug\`) DO UPDATE SET \`views\` = \`excluded\`.\`views\``;
      this.sql.exec(sql, slug, views);
    }

    async delete(slug: string): Promise<boolean> {
      const sql = `DELETE FROM \`${this.stubName}\` WHERE \`slug\` = ?`;

      try {
        this.sql.exec(sql, slug);
        return true;
      } catch {
        return false;
      }
    }

    async reset(): Promise<boolean> {
      const sql = `DELETE FROM \`${this.stubName}\``;

      try {
        this.sql.exec(sql);
        return true;
      } catch {
        return false;
      }
    }

    async backup(): Promise<{
      filename: string;
      dump: Uint8Array;
    }> {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${this.stubName}_${timestamp}.sql`;
      const schema = this.sql
        .exec(
          `SELECT \`sql\` FROM \`sqlite_master\` WHERE \`type\`='table' AND name='${this.stubName}'`
        )
        .toArray();
      const data = this.sql
        .exec(`SELECT * FROM \`${this.stubName}\` ORDER BY \`id\` ASC`)
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
        sqlDump += `INSERT INTO \`${this.stubName}\` (\`id\`, \`slug\`, \`views\`) VALUES\n`;

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
  };
