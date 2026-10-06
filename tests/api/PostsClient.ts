import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface ApiResult {
  status: number;
  headers: Record<string, string>;
  durationMs: number;
  rawBody: string;
  json: unknown;
}

/** Thin client for the JSONPlaceholder /posts resource. Base URL comes from env config. */
export class PostsClient {
  constructor(private readonly request: APIRequestContext) {}

  async createPost(payload: unknown): Promise<ApiResult> {
    return this.send(() => this.request.post('/posts', { data: payload }));
  }

  /** Sends a body verbatim (e.g. malformed JSON) — Playwright would otherwise serialise objects. */
  async createPostRaw(body: string): Promise<ApiResult> {
    return this.send(() => this.request.post('/posts', { data: Buffer.from(body, 'utf8') }));
  }

  private async send(call: () => Promise<APIResponse>): Promise<ApiResult> {
    const started = Date.now();
    const response = await call();
    const durationMs = Date.now() - started;
    const rawBody = await response.text();
    let json: unknown = undefined;
    try {
      json = JSON.parse(rawBody);
    } catch {
      // Non-JSON body — kept in rawBody for assertions.
    }
    return { status: response.status(), headers: response.headers(), durationMs, rawBody, json };
  }
}
