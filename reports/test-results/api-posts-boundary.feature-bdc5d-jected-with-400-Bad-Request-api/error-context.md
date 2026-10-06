# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api/posts-boundary.feature.spec.js >> JSONPlaceholder — boundary and invalid data on POST /posts >> Missing or invalid required fields >> Post with <problem> is rejected with 400 Bad Request >> Post with a string userId is rejected with 400 Bad Request
- Location: .features-gen/api/posts-boundary.feature.spec.js:175:11

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 201
```

# Test source

```ts
  1  | import { expect } from '@playwright/test';
  2  | import { When, Then } from '../fixtures';
  3  | import type { ApiResult } from '../../api/PostsClient';
  4  | import { INVALID_POSTS, SPECIAL_CHARACTER_TITLES, lookup, postWithTitle } from '../../api/payloads';
  5  | import { env } from '../../../config/environment';
  6  | 
  7  | When('I create a post with a title of {int} characters', async ({ postsApi, ctx, $testInfo }, length: number) => {
  8  |   const payload = postWithTitle('T'.repeat(length));
  9  |   ctx.sent = payload;
  10 |   ctx.response = await postsApi.createPost(payload);
  11 |   await $testInfo.attach('request', { body: `POST /posts — title length ${length}`, contentType: 'text/plain' });
  12 | });
  13 | 
  14 | When('I create a post whose title contains {string}', async ({ postsApi, ctx }, category: string) => {
  15 |   const payload = postWithTitle(lookup(SPECIAL_CHARACTER_TITLES, category));
  16 |   ctx.sent = payload;
  17 |   ctx.response = await postsApi.createPost(payload);
  18 | });
  19 | 
  20 | When(/^I create a post with (no userId|no title|an empty body|a string userId|a negative userId|a null title)$/, async ({ postsApi, ctx }, problem: string) => {
  21 |   const payload = lookup(INVALID_POSTS, problem);
  22 |   ctx.sent = payload;
  23 |   ctx.response = await postsApi.createPost(payload);
  24 | });
  25 | 
  26 | When('I send a post with a malformed JSON body', async ({ postsApi, ctx }) => {
  27 |   ctx.response = await postsApi.createPostRaw('{"title": "unterminated", "userId": 1');
  28 | });
  29 | 
  30 | function response(ctx: Record<string, unknown>): ApiResult {
  31 |   const result = ctx.response as ApiResult | undefined;
  32 |   if (!result) throw new Error('No API response captured — did a When step run?');
  33 |   return result;
  34 | }
  35 | 
  36 | // Every API scenario attaches the response so failures (and known defects) are self-explanatory in the report.
  37 | async function attachResponse(testInfo: import('@playwright/test').TestInfo, res: ApiResult): Promise<void> {
  38 |   await testInfo.attach('response', {
  39 |     body: `HTTP ${res.status} in ${res.durationMs} ms\n\n${res.rawBody.slice(0, 2000)}`,
  40 |     contentType: 'text/plain',
  41 |   });
  42 | }
  43 | 
  44 | Then('the response should not be a server error', async ({ ctx, $testInfo }) => {
  45 |   const res = response(ctx);
  46 |   await attachResponse($testInfo, res);
  47 |   expect(res.status, `server error body: ${res.rawBody.slice(0, 200)}`).toBeLessThan(500);
  48 | });
  49 | 
  50 | Then('the response status should be {int}', async ({ ctx, $testInfo }, status: number) => {
  51 |   const res = response(ctx);
  52 |   await attachResponse($testInfo, res);
> 53 |   expect(res.status).toBe(status);
     |                      ^ Error: expect(received).toBe(expected) // Object.is equality
  54 | });
  55 | 
  56 | Then('the response should be JSON', async ({ ctx }) => {
  57 |   const res = response(ctx);
  58 |   expect(res.headers['content-type']).toContain('application/json');
  59 |   expect(res.json, 'body parses as JSON').toBeDefined();
  60 |   expect(typeof (res.json as { id?: unknown }).id, 'created resource has an id').toBe('number');
  61 | });
  62 | 
  63 | Then('the echoed {string} should be identical to what was sent', async ({ ctx }, field: string) => {
  64 |   const sent = (ctx.sent as Record<string, unknown>)[field];
  65 |   const echoed = (response(ctx).json as Record<string, unknown>)[field];
  66 |   // Compare length first for a readable failure on multi-MB strings.
  67 |   expect((echoed as string)?.length, `${field} length`).toBe((sent as string).length);
  68 |   expect(echoed === sent, `${field} round-trips byte-for-byte`).toBe(true);
  69 | });
  70 | 
  71 | Then('the response should arrive within the configured time limit', async ({ ctx }) => {
  72 |   expect(response(ctx).durationMs).toBeLessThan(env.apiMaxResponseMs);
  73 | });
  74 | 
  75 | Then('the response body should not contain a stack trace', async ({ ctx }) => {
  76 |   expect(response(ctx).rawBody).not.toMatch(/\n\s+at .+\(.+:\d+:\d+\)/);
  77 | });
  78 | 
```