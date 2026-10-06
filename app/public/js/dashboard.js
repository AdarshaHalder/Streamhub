(async function () {
  const { summarize, formatINR } = window.Emi;
  const filter = document.getElementById('type-filter');
  const params = new URLSearchParams(location.search);
  filter.value = params.get('type') || '';

  const res = await fetch('/api/loans');
  const loans = (await res.json()).map((loan) => ({
    ...loan,
    ...summarize(loan.principal, loan.annualRate, loan.tenureYears),
  }));

  function render() {
    const type = filter.value;
    const visible = type ? loans.filter((l) => l.type === type) : loans;

    const totals = visible.reduce(
      (acc, l) => ({ principal: acc.principal + l.principal, emi: acc.emi + l.emi, interest: acc.interest + l.totalInterest }),
      { principal: 0, emi: 0, interest: 0 },
    );
    document.querySelector('[data-testid="stat-count"]').textContent = visible.length;
    document.querySelector('[data-testid="stat-principal"]').textContent = formatINR(totals.principal);
    document.querySelector('[data-testid="stat-emi"]').textContent = formatINR(totals.emi);
    document.querySelector('[data-testid="stat-interest"]').textContent = formatINR(totals.interest);

    document.getElementById('loan-rows').innerHTML = visible
      .map((l) => `<tr data-testid="loan-row" data-loan-id="${l.id}">
          <td>${l.id}</td><td>${l.borrower}</td><td>${l.type}</td><td>${formatINR(l.principal)}</td>
          <td>${l.annualRate}%</td><td>${l.tenureYears} yrs</td><td>${formatINR(l.emi)}</td></tr>`)
      .join('');

    const byType = {};
    visible.forEach((l) => { byType[l.type] = (byType[l.type] || 0) + l.principal; });
    window.Charts.renderPie(
      document.getElementById('type-pie'),
      Object.entries(byType).map(([label, value]) => ({ label, value })),
      { title: 'Principal by loan type', format: formatINR },
    );
    document.body.dataset.ready = 'true';
  }

  filter.addEventListener('change', () => {
    const url = new URL(location.href);
    filter.value ? url.searchParams.set('type', filter.value) : url.searchParams.delete('type');
    history.replaceState(null, '', url);
    render();
  });
  render();
})();
