/**
 * Independent EMI oracle for the tests. Intentionally does not import the app's
 * emi.js: the expected values are derived here and compared against the UI.
 *
 * The headline EMI uses the closed-form annuity formula. The yearly schedule is
 * built by simulating every month, and `verifyAmortises` checks that paying the
 * EMI for n months really does bring the balance to zero — a second, formula-free
 * check that the closed-form EMI is right.
 */
export interface LoanInput {
  principal: number;
  annualRatePct: number;
  tenureYears: number;
}

export interface EmiBreakdown {
  emi: number;
  totalInterest: number;
  totalPayment: number;
}

export interface YearRow {
  year: number;
  principal: number;
  interest: number;
  balance: number;
}

const monthlyRate = (annualRatePct: number) => annualRatePct / 100 / 12;

export function exactEmi({ principal, annualRatePct, tenureYears }: LoanInput): number {
  const n = tenureYears * 12;
  const r = monthlyRate(annualRatePct);
  if (r === 0) return principal / n;
  const factor = (1 + r) ** n;
  return (principal * r * factor) / (factor - 1);
}

/** Rounding contract (documented in README): EMI and total payment rounded to the rupee. */
export function expectedBreakdown(loan: LoanInput): EmiBreakdown {
  const emi = exactEmi(loan);
  const totalPayment = Math.round(emi * loan.tenureYears * 12);
  return { emi: Math.round(emi), totalPayment, totalInterest: totalPayment - loan.principal };
}

/** Remaining balance after paying `emi` for the full tenure (≈0 if EMI is correct). */
export function residualBalance(loan: LoanInput, emi = exactEmi(loan)): number {
  const r = monthlyRate(loan.annualRatePct);
  let balance = loan.principal;
  for (let m = 0; m < loan.tenureYears * 12; m++) balance = balance * (1 + r) - emi;
  return balance;
}

export function expectedYearlySchedule(loan: LoanInput, startMonth: string): YearRow[] {
  const r = monthlyRate(loan.annualRatePct);
  const emi = exactEmi(loan);
  const [startYear, startMon] = startMonth.split('-').map(Number);
  const byYear = new Map<number, { principal: number; interest: number; balance: number }>();
  let balance = loan.principal;

  for (let m = 0; m < loan.tenureYears * 12; m++) {
    const year = startYear + Math.floor((startMon - 1 + m) / 12);
    const interest = balance * r;
    balance -= emi - interest;
    const row = byYear.get(year) ?? { principal: 0, interest: 0, balance: 0 };
    row.principal += emi - interest;
    row.interest += interest;
    row.balance = Math.max(balance, 0);
    byYear.set(year, row);
  }

  return [...byYear.entries()].map(([year, row]) => ({
    year,
    principal: Math.round(row.principal),
    interest: Math.round(row.interest),
    balance: Math.round(row.balance),
  }));
}

/** Number of calendar years an EMI schedule touches. */
export function expectedCalendarYears(tenureYears: number, startMonth: string): number {
  const startMon = Number(startMonth.split('-')[1]);
  return Math.floor((startMon - 1 + tenureYears * 12 - 1) / 12) + 1;
}
