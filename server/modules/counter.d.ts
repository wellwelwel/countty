import type { Env } from '../@types.js';
export type Counter = InstanceType<ReturnType<typeof createDurableObject>>;
export declare const createDurableObject: (stubName: string) => {
    new (ctx: DurableObjectState<{}>, env: Env): {
        ctx: DurableObjectState<{}>;
        env: Env;
        sql: SqlStorage;
        stubName: string;
        get(slug: string): Promise<number>;
        exists(slug: string): Promise<boolean>;
        increment(slug: string): Promise<number>;
        create(slug: string): Promise<boolean>;
        set(slug: string, views: number): Promise<void>;
        backup(): Promise<{
            filename: string;
            dump: Uint8Array;
        }>;
        fetch?(request: Request): Response | Promise<Response>;
        alarm?(alarmInfo?: AlarmInvocationInfo): void | Promise<void>;
        webSocketMessage?(ws: WebSocket, message: string | ArrayBuffer): void | Promise<void>;
        webSocketClose?(ws: WebSocket, code: number, reason: string, wasClean: boolean): void | Promise<void>;
        webSocketError?(ws: WebSocket, error: unknown): void | Promise<void>;
        __DURABLE_OBJECT_BRAND: never;
    };
};
