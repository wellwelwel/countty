export const request = async (
  url: string,
  options: {
    method: string;
    headers?: Record<string, string>;
    body?: string;
  }
): Promise<{ status: number; data: any }> => {
  const response = await fetch(url, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body,
  });

  const contentType = response.headers.get('content-type');

  const data = contentType?.includes('application/json')
    ? await response.json()
    : await response.text();

  return { status: response.status, data };
};

export const help = () => {
  console.log(`
Countty CLI - Available commands:

  npx countty create <slug>     - Create a new counter
  npx countty remove <slug>     - Remove an existing counter
  npx countty reset             - Reset all counters
  npx countty backup            - Backup data to ./backups/ directory
  npx countty views <slug>      - View counter statistics (public)
  npx countty help              - Show this help message

Options:
  --env <path>                  - Specify custom .env file path

Examples:
  npx countty create "my-blog-site-a"
  npx countty remove "my-blog-site-a"
  npx countty views "my-blog-site-a"
  npx countty --env ./config/.env create "my-blog-site-a"

Environment Variables:
  COUNTTY_TOKEN                 - Required for create, remove, reset and backup commands
  COUNTTY_URL                   - API base URL (required)
`);
};
