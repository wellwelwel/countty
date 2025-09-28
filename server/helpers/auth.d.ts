export declare const getApi: (request: Request) => string | null;
export declare const checkToken: (token: string, api: string | null) => Promise<boolean>;
