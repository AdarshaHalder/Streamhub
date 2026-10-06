import fs from 'node:fs';
import path from 'node:path';
import type { BrittleLocator } from '../../tests/pages/legacy/BrittleCalculatorPage';
import type { Detection } from './detect';
import type { Candidate } from './aiHealer';
import type { Validation } from './validate';
import { toCode } from './locatorSpec';

export interface HealResult {
  entry: BrittleLocator;
  detection: Detection;
  candidates: (Candidate & { validation: Validation })[];
  chosen: (Candidate & { validation: Validation }) | null;
  notes: string[];
}

export function writeReports(results: HealResult[], outDir: string, meta: { aiEnabled: boolean }): void {
  const generatedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(outDir, 'healing-report.json'),
    JSON.stringify(
      {
        generatedAt,
        aiEnabled: meta.aiEnabled,
        results: results.map((r) => ({
          key: r.entry.key,
          brokenSelector: r.entry.selector,
          intent: r.entry.intent,
          detection: r.detection,
          notes: r.notes,
          candidates: r.candidates.map((c) => ({ code: toCode(c.locator), ...c })),
          suggestion: r.chosen ? toCode(r.chosen.locator) : null,
        })),
      },
      (_k, v) => (v instanceof RegExp ? v.toString() : v),
      2,
    ),
  );

  const lines: string[] = [
    '# Self-healing report',
    '',
    `Generated ${generatedAt} · AI ${meta.aiEnabled ? 'enabled' : 'disabled'} · suggestions are **not** auto-applied.`,
    '',
    '| Locator | Detection | Suggested fix | Source | Gates passed |',
    '|---|---|---|---|---|',
    ...results.map((r) => {
      const fix = r.chosen ? `\`${toCode(r.chosen.locator)}\`` : r.detection.status === 'HEALTHY' ? '—' : '**no safe fix found**';
      const gates = r.chosen ? r.chosen.validation.checks.map((c) => c.name).join(', ') : '—';
      return `| \`${r.entry.key}\` | ${r.detection.status} | ${fix} | ${r.chosen?.source ?? '—'} | ${gates} |`;
    }),
    '',
  ];

  for (const r of results.filter((x) => x.detection.status !== 'HEALTHY')) {
    lines.push(`## \`${r.entry.key}\``, '');
    lines.push(`- **Intent:** ${r.entry.intent}`);
    lines.push(`- **Broken selector:** \`${r.entry.selector}\``);
    lines.push(`- **Why it was brittle:** ${r.entry.flaw}`);
    lines.push(`- **Detected:** ${r.detection.status}${'detail' in r.detection ? ` — ${r.detection.detail}` : ''}`);
    r.notes.forEach((n) => lines.push(`- _${n}_`));
    lines.push('', '| Candidate | Source | Confidence | Result |', '|---|---|---|---|');
    for (const c of r.candidates) {
      const failed = c.validation.checks.find((x) => !x.ok);
      lines.push(
        `| \`${toCode(c.locator)}\` | ${c.source} | ${c.confidence} | ${c.validation.passed ? '✅ all gates passed' : `❌ ${failed?.name}: ${failed?.detail}`} |`,
      );
    }
    if (r.chosen) {
      lines.push('', 'Suggested patch (`tests/pages/legacy/BrittleCalculatorPage.ts`):', '', '```diff');
      lines.push(`- this.${r.entry.key} = page.locator('${r.entry.selector}');`);
      lines.push(`+ this.${r.entry.key} = ${toCode(r.chosen.locator)};`);
      lines.push('```');
    }
    lines.push('');
  }

  fs.writeFileSync(path.join(outDir, 'healing-report.md'), lines.join('\n'));
}
