/**
 * AI self-healing locator POC.
 *
 *   npm run heal              # Claude proposes fixes (falls back to heuristics if no credentials)
 *   npm run heal -- --no-ai   # heuristic healer only, fully offline
 *
 * Pipeline per locator: detect → capture page context → propose candidates →
 * validate each in a real browser → report. Nothing is written to the test code:
 * the output is a reviewed suggestion (report + patch snippet) for a human to apply.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import Anthropic from '@anthropic-ai/sdk';
import { chromium } from '@playwright/test';
import { env } from '../config/environment';
import { BRITTLE_LOCATORS, type BrittleLocator } from '../tests/pages/legacy/BrittleCalculatorPage';
import { detect, type Detection } from './lib/detect';
import { capturePageContext } from './lib/pageContext';
import { proposeWithAi, type Candidate } from './lib/aiHealer';
import { proposeWithHeuristics } from './lib/heuristicHealer';
import { validateCandidate, type Validation } from './lib/validate';
import { sameSpec, toCode } from './lib/locatorSpec';
import { writeReports, type HealResult } from './lib/report';

const useAi = !process.argv.includes('--no-ai');

async function ensureApp(): Promise<ChildProcess | null> {
  const healthy = () => fetch(new URL('/health', env.baseUrl)).then((r) => r.ok).catch(() => false);
  if (await healthy()) return null;
  if (!env.startApp) throw new Error(`App not reachable at ${env.baseUrl} and START_APP=false`);
  const server = spawn(process.execPath, ['app/server.js'], { env: { ...process.env, PORT: String(env.appPort) }, stdio: 'ignore' });
  for (let i = 0; i < 50; i++) {
    if (await healthy()) return server;
    await new Promise((r) => setTimeout(r, 200));
  }
  server.kill();
  throw new Error('App did not start');
}

/** AI first; on any failure (no credentials, network, refusal) fall back to the heuristic healer. */
async function propose(entry: BrittleLocator, detection: Detection, context: Awaited<ReturnType<typeof capturePageContext>>) {
  const notes: string[] = [];
  let candidates: Candidate[] = [];
  if (useAi) {
    try {
      candidates = await proposeWithAi(entry, detection, context);
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) notes.push('AI skipped: invalid Anthropic credentials');
      else if (error instanceof Anthropic.RateLimitError) notes.push('AI skipped: rate limited');
      else if (error instanceof Anthropic.APIError) notes.push(`AI skipped: API error ${error.status ?? ''} ${error.message}`);
      else notes.push(`AI skipped: ${(error as Error).message.split(/\.\s|\n/)[0]}`);
    }
  } else {
    notes.push('AI disabled (--no-ai)');
  }
  // Heuristic candidates are appended as a safety net, de-duplicated against the AI's.
  for (const h of proposeWithHeuristics(entry, context)) {
    if (!candidates.some((c) => sameSpec(c.locator, h.locator))) candidates.push(h);
  }
  return { candidates, notes };
}

async function main() {
  const server = await ensureApp();
  const browser = await chromium.launch({ headless: env.headless });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const results: HealResult[] = [];

  try {
    for (const entry of BRITTLE_LOCATORS) {
      await page.goto(new URL(entry.page, env.baseUrl).toString());
      const detection = await detect(page, entry);
      console.log(`\n▶ ${entry.key}: ${detection.status}${'detail' in detection ? ` — ${detection.detail}` : ''}`);
      if (detection.status === 'HEALTHY') {
        results.push({ entry, detection, candidates: [], chosen: null, notes: [] });
        continue;
      }

      const context = await capturePageContext(page);
      const { candidates, notes } = await propose(entry, detection, context);
      notes.forEach((n) => console.log(`  · ${n}`));

      const validated: (Candidate & { validation: Validation })[] = [];
      for (const candidate of candidates) {
        const validation = await validateCandidate(page, entry, candidate.locator, env.baseUrl);
        validated.push({ ...candidate, validation });
        const failed = validation.checks.find((c) => !c.ok);
        console.log(`  ${validation.passed ? '✔' : '✘'} [${candidate.source}] ${toCode(candidate.locator)}${failed ? `  (${failed.name}: ${failed.detail})` : ''}`);
      }
      // First candidate (in proposal order: AI best-first, then heuristic) that passes every gate.
      const chosen = validated.find((c) => c.validation.passed) ?? null;
      results.push({ entry, detection, candidates: validated, chosen, notes });
    }
  } finally {
    await browser.close();
    server?.kill();
  }

  const outDir = path.resolve(__dirname, 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  writeReports(results, outDir, { aiEnabled: useAi });

  const unhealed = results.filter((r) => r.detection.status !== 'HEALTHY' && !r.chosen);
  console.log(`\n${results.length - unhealed.length}/${results.length} locators healthy or healed. Report: self-healing/reports/healing-report.md`);
  process.exitCode = unhealed.length ? 1 : 0;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
