/** Named test payloads so feature files stay readable and Gherkin-safe. */

export const SPECIAL_CHARACTER_TITLES: Record<string, string> = {
  'HTML and script injection': `<script>alert('xss')</script><img src=x onerror=alert(1)>`,
  'SQL injection': `'; DROP TABLE posts; -- " OR "1"="1`,
  'emoji and astral unicode': '😀🚀 𝔘𝔫𝔦𝔠𝔬𝔡𝔢 👨‍👩‍👧‍👦 🏳️‍🌈',
  'RTL override and zero-width': 'abc‮dcba​‌‍﻿',
  'control characters': 'line1\nline2\ttab\r\u0000null\u0007bell\u001Bescape',
  'JSON metacharacters': '{"nested": [1, 2]} \\ "quoted" \\u0041 /',
  'mixed scripts': 'हिन्दी 中文 العربية Ελληνικά русский',
};

const valid = { title: 'Boundary test', body: 'Created by the automation suite', userId: 1 };

export const INVALID_POSTS: Record<string, unknown> = {
  'no userId': { title: valid.title, body: valid.body },
  'no title': { body: valid.body, userId: valid.userId },
  'an empty body': {},
  'a string userId': { ...valid, userId: 'not-a-number' },
  'a negative userId': { ...valid, userId: -1 },
  'a null title': { ...valid, title: null },
};

export function postWithTitle(title: string) {
  return { ...valid, title };
}

export function lookup<T>(table: Record<string, T>, key: string): T {
  if (!(key in table)) throw new Error(`Unknown payload "${key}". Known: ${Object.keys(table).join(', ')}`);
  return table[key];
}
