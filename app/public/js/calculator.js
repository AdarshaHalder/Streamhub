(function () {
  const { summarize, yearlySchedule, formatINR } = window.Emi;

  // Per-product slider ranges, modelled on typical Indian lender limits.
  const PRODUCTS = {
    home: { label: 'Home Loan Amount (₹)', amount: [100000, 20000000, 5000000], rate: [5, 20, 9], tenure: [1, 30, 20] },
    personal: { label: 'Personal Loan Amount (₹)', amount: [10000, 4000000, 750000], rate: [5, 30, 12], tenure: [1, 7, 5] },
    car: { label: 'Car Loan Amount (₹)', amount: [100000, 5000000, 1000000], rate: [5, 20, 9.5], tenure: [1, 10, 7] },
  };

  const form = document.getElementById('emi-form');
  const fields = ['amount', 'rate', 'tenure'];
  const startMonth = document.getElementById('start-month');
  let product = 'home';

  function currentMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  function applyProduct(name) {
    product = name;
    const cfg = PRODUCTS[name];
    document.querySelectorAll('[role="tab"]').forEach((tab) => {
      tab.setAttribute('aria-selected', String(tab.dataset.loanType === name));
    });
    document.getElementById('amount-label').textContent = cfg.label;
    fields.forEach((f) => {
      const [min, max, def] = cfg[f];
      for (const input of [document.getElementById(f), document.getElementById(`${f}-slider`)]) {
        input.min = min;
        input.max = max;
        input.value = def;
      }
    });
    calculate();
  }

  function validate() {
    const cfg = PRODUCTS[product];
    let ok = true;
    fields.forEach((f) => {
      const input = document.getElementById(f);
      const error = document.getElementById(`${f}-error`);
      const [min, max] = cfg[f];
      const value = input.valueAsNumber;
      let message = '';
      if (Number.isNaN(value)) message = 'Please enter a number.';
      else if (value < min || value > max) message = `Must be between ${min.toLocaleString('en-IN')} and ${max.toLocaleString('en-IN')}.`;
      else if (f === 'tenure' && !Number.isInteger(value)) message = 'Tenure must be a whole number of years.';
      error.textContent = message;
      error.hidden = !message;
      input.setAttribute('aria-invalid', String(Boolean(message)));
      if (message) ok = false;
    });
    return ok;
  }

  function calculate() {
    if (!validate()) {
      document.body.dataset.state = 'invalid';
      return;
    }
    const amount = document.getElementById('amount').valueAsNumber;
    const rate = document.getElementById('rate').valueAsNumber;
    const tenure = document.getElementById('tenure').valueAsNumber;
    const start = startMonth.value || currentMonth();

    const result = summarize(amount, rate, tenure);
    document.querySelector('[data-testid="result-emi"]').textContent = formatINR(result.emi);
    document.querySelector('[data-testid="result-interest"]').textContent = formatINR(result.totalInterest);
    document.querySelector('[data-testid="result-total"]').textContent = formatINR(result.totalPayment);

    window.Charts.renderPie(
      document.getElementById('breakup-pie'),
      [
        { label: 'Principal Loan Amount', value: amount },
        { label: 'Total Interest', value: result.totalInterest },
      ],
      { title: 'Break-up of total payment', format: formatINR },
    );

    const rows = yearlySchedule(amount, rate, tenure, start);
    window.Charts.renderStackedBars(document.getElementById('schedule-chart'), rows, {
      title: 'Yearly principal and interest',
      format: formatINR,
    });
    document.getElementById('schedule-rows').innerHTML = rows
      .map((r) => `<tr data-testid="schedule-row" data-year="${r.year}"><th scope="row">${r.year}</th>
        <td>${formatINR(r.principal)}</td><td>${formatINR(r.interest)}</td>
        <td>${formatINR(r.principal + r.interest)}</td><td>${formatINR(r.balance)}</td></tr>`)
      .join('');
    document.body.dataset.state = 'calculated';
  }

  // Keep number inputs and sliders in sync; recalculate live like emicalculator.net.
  fields.forEach((f) => {
    const input = document.getElementById(f);
    const slider = document.getElementById(`${f}-slider`);
    slider.addEventListener('input', () => { input.value = slider.value; calculate(); });
    input.addEventListener('change', () => { slider.value = input.value; calculate(); });
  });
  startMonth.addEventListener('change', calculate);
  form.addEventListener('submit', (e) => { e.preventDefault(); calculate(); });
  document.querySelectorAll('[role="tab"]').forEach((tab) => {
    tab.addEventListener('click', () => applyProduct(tab.dataset.loanType));
  });

  startMonth.value = currentMonth();
  applyProduct(new URLSearchParams(location.search).get('type') || 'home');
})();
