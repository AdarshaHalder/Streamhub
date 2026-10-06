// EMI maths used by the app. The test suite deliberately does NOT import this
// file — it computes expected values independently (tests/utils/emi.ts).
(function (global) {
  /**
   * Monthly EMI (unrounded) for principal P, annual rate in %, tenure in months.
   * EMI = P·r·(1+r)^n / ((1+r)^n − 1), r = monthly rate. A 0% loan is P / n.
   */
  function monthlyEmi(principal, annualRate, months) {
    const r = annualRate / 12 / 100;
    if (r === 0) return principal / months;
    const growth = Math.pow(1 + r, months);
    return (principal * r * growth) / (growth - 1);
  }

  /** Headline figures, rounded to whole rupees. */
  function summarize(principal, annualRate, years) {
    const months = years * 12;
    const emi = monthlyEmi(principal, annualRate, months);
    const totalPayment = Math.round(emi * months);
    return {
      emi: Math.round(emi),
      totalPayment,
      totalInterest: totalPayment - principal,
      principal,
      months,
    };
  }

  /**
   * Amortisation grouped by calendar year, starting from startMonth ("YYYY-MM").
   * A loan that starts mid-year spans one more calendar year than its tenure.
   */
  function yearlySchedule(principal, annualRate, years, startMonth) {
    const months = years * 12;
    const r = annualRate / 12 / 100;
    const emi = monthlyEmi(principal, annualRate, months);
    let [year, month] = startMonth.split('-').map(Number);
    let balance = principal;
    const rows = [];
    let current = null;

    for (let i = 0; i < months; i++) {
      if (!current || current.year !== year) {
        current = { year, principal: 0, interest: 0, balance: 0 };
        rows.push(current);
      }
      const interest = balance * r;
      const principalPart = emi - interest;
      balance -= principalPart;
      current.interest += interest;
      current.principal += principalPart;
      current.balance = Math.max(balance, 0);
      month += 1;
      if (month > 12) { month = 1; year += 1; }
    }

    return rows.map((row) => ({
      year: row.year,
      principal: Math.round(row.principal),
      interest: Math.round(row.interest),
      balance: Math.round(row.balance),
    }));
  }

  const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  function formatINR(value) {
    return inr.format(value);
  }

  global.Emi = { monthlyEmi, summarize, yearlySchedule, formatINR };
})(window);
