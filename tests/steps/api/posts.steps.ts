import { expect } from '@playwright/test';
import { When, Then } from '../fixtures';
import type { ApiResult } from '../../api/PostsClient';
import { INVALID_POSTS, SPECIAL_CHARACTER_TITLES, lookup, postWithTitle } from '../../api/payloads';
import { env } from '../../../config/environment';

When('I create a post with a title of {int} characters', async ({ postsApi, ctx, $testInfo }, length: number) => {
  const payload = postWithTitle('T'.repeat(length));
  ctx.sent = payload;
  ctx.response = await postsApi.createPost(payload);
  await $testInfo.attach('request', { body: `POST /posts — title length ${length}`, contentType: 'text/plain' });
});

When('I create a post whose title contains {string}', async ({ postsApi, ctx }, category: string) => {
  const payload = postWithTitle(lookup(SPECIAL_CHARACTER_TITLES, category));
  ctx.sent = payload;
  ctx.response = await postsApi.createPost(payload);
});

When(/^I create a post with (no userId|no title|an empty body|a string userId|a negative userId|a null title)$/, async ({ postsApi, ctx }, problem: string) => {
  const payload = lookup(INVALID_POSTS, problem);
  ctx.sent = payload;
  ctx.response = await postsApi.createPost(payload);
});

When('I send a post with a malformed JSON body', async ({ postsApi, ctx }) => {
  ctx.response = await postsApi.createPostRaw('{"title": "unterminated", "userId": 1');
});

function response(ctx: Record<string, unknown>): ApiResult {
  const result = ctx.response as ApiResult | undefined;
  if (!result) throw new Error('No API response captured — did a When step run?');
  return result;
}

// Every API scenario attaches the response so failures (and known defects) are self-explanatory in the report.
async function attachResponse(testInfo: import('@playwright/test').TestInfo, res: ApiResult): Promise<void> {
  await testInfo.attach('response', {
    body: `HTTP ${res.status} in ${res.durationMs} ms\n\n${res.rawBody.slice(0, 2000)}`,
    contentType: 'text/plain',
  });
}

Then('the response should not be a server error', async ({ ctx, $testInfo }) => {
  const res = response(ctx);
  await attachResponse($testInfo, res);
  expect(res.status, `server error body: ${res.rawBody.slice(0, 200)}`).toBeLessThan(500);
});

Then('the response status should be {int}', async ({ ctx, $testInfo }, status: number) => {
  const res = response(ctx);
  await attachResponse($testInfo, res);
  expect(res.status).toBe(status);
});

Then('the response should be JSON', async ({ ctx }) => {
  const res = response(ctx);
  expect(res.headers['content-type']).toContain('application/json');
  expect(res.json, 'body parses as JSON').toBeDefined();
  expect(typeof (res.json as { id?: unknown }).id, 'created resource has an id').toBe('number');
});

Then('the echoed {string} should be identical to what was sent', async ({ ctx }, field: string) => {
  const sent = (ctx.sent as Record<string, unknown>)[field];
  const echoed = (response(ctx).json as Record<string, unknown>)[field];
  // Compare length first for a readable failure on multi-MB strings.
  expect((echoed as string)?.length, `${field} length`).toBe((sent as string).length);
  expect(echoed === sent, `${field} round-trips byte-for-byte`).toBe(true);
});

Then('the response should arrive within the configured time limit', async ({ ctx }) => {
  expect(response(ctx).durationMs).toBeLessThan(env.apiMaxResponseMs);
});

Then('the response body should not contain a stack trace', async ({ ctx }) => {
  expect(response(ctx).rawBody).not.toMatch(/\n\s+at .+\(.+:\d+:\d+\)/);
});
