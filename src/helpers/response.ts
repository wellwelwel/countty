export type ResponseOptions = {
  response: unknown;
  headers?: Record<string, string>;
  status?: number;
};

export const response = ({
  response,
  headers,
  status = 200,
}: ResponseOptions) =>
  new Response(JSON.stringify(response), {
    status,
    headers,
  });
