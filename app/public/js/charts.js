// Dependency-free SVG charts. Every drawn mark carries data-* attributes and an
// accessible label so both humans (screen readers) and tests can read the data.
(function (global) {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const PALETTE = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#0891b2'];

  function el(name, attrs = {}) {
    const node = document.createElementNS(SVG_NS, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  }

  function polar(cx, cy, radius, angle) {
    return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
  }

  /**
   * Donut/pie chart. slices: [{ label, value }]
   */
  function renderPie(container, slices, { title, format = String } = {}) {
    container.innerHTML = '';
    const total = slices.reduce((s, x) => s + x.value, 0);
    const size = 240, cx = 120, cy = 120, outer = 110, inner = 60;
    const svg = el('svg', { viewBox: `0 0 ${size} ${size}`, role: 'img', 'aria-label': title, 'data-testid': 'pie-chart', 'data-total': total });
    let angle = -Math.PI / 2;

    slices.forEach((slice, i) => {
      const share = total > 0 ? slice.value / total : 0;
      const sweep = share * Math.PI * 2;
      const end = angle + sweep;
      const large = sweep > Math.PI ? 1 : 0;
      const [x1, y1] = polar(cx, cy, outer, angle);
      const [x2, y2] = polar(cx, cy, outer, end - 1e-6);
      const [x3, y3] = polar(cx, cy, inner, end - 1e-6);
      const [x4, y4] = polar(cx, cy, inner, angle);
      const path = el('path', {
        d: `M${x1},${y1} A${outer},${outer} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${inner},${inner} 0 ${large} 0 ${x4},${y4} Z`,
        fill: PALETTE[i % PALETTE.length],
        'data-testid': 'pie-slice',
        'data-label': slice.label,
        'data-value': slice.value,
        'data-percent': (share * 100).toFixed(2),
        'aria-label': `${slice.label}: ${format(slice.value)} (${(share * 100).toFixed(1)}%)`,
      });
      const tip = el('title');
      tip.textContent = `${slice.label}: ${format(slice.value)}`;
      path.appendChild(tip);
      svg.appendChild(path);
      angle = end;
    });

    const legend = document.createElement('ul');
    legend.className = 'legend';
    legend.setAttribute('aria-label', `${title} legend`);
    slices.forEach((slice, i) => {
      const li = document.createElement('li');
      li.dataset.testid = 'legend-item';
      li.dataset.label = slice.label;
      li.innerHTML = `<span class="swatch" style="background:${PALETTE[i % PALETTE.length]}"></span>
        <span class="legend-label">${slice.label}</span>
        <span class="legend-value" data-testid="legend-value">${format(slice.value)}</span>
        <span class="legend-pct">${total > 0 ? ((slice.value / total) * 100).toFixed(1) : '0.0'}%</span>`;
      legend.appendChild(li);
    });

    container.append(svg, legend);
  }

  /**
   * Stacked bar chart: one bar per row, two stacked segments (principal, interest).
   * Hovering/focusing a bar shows a tooltip with the year's numbers.
   */
  function renderStackedBars(container, rows, { title, format = String } = {}) {
    container.innerHTML = '';
    const width = 640, height = 280, padL = 10, padB = 28, padT = 10;
    const max = Math.max(...rows.map((r) => r.principal + r.interest), 1);
    const slot = (width - padL) / rows.length;
    const barW = Math.max(slot * 0.6, 4);
    const plotH = height - padB - padT;

    const svg = el('svg', { viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': title, 'data-testid': 'bar-chart' });
    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.dataset.testid = 'bar-tooltip';
    tooltip.hidden = true;

    rows.forEach((row, i) => {
      const x = padL + i * slot + (slot - barW) / 2;
      const pH = (row.principal / max) * plotH;
      const iH = (row.interest / max) * plotH;
      const g = el('g', {
        'data-testid': 'bar',
        'data-year': row.year,
        'data-principal': row.principal,
        'data-interest': row.interest,
        'data-balance': row.balance,
        tabindex: '0',
        role: 'listitem',
        'aria-label': `${row.year}: principal ${format(row.principal)}, interest ${format(row.interest)}`,
      });
      g.append(
        el('rect', { x, y: padT + plotH - pH, width: barW, height: pH, fill: PALETTE[0], class: 'bar-principal' }),
        el('rect', { x, y: padT + plotH - pH - iH, width: barW, height: iH, fill: PALETTE[1], class: 'bar-interest' }),
      );
      if (rows.length <= 16 || i % 2 === 0) {
        const label = el('text', { x: x + barW / 2, y: height - 8, 'text-anchor': 'middle', class: 'axis-label' });
        label.textContent = row.year;
        g.appendChild(label);
      }

      const show = () => {
        tooltip.innerHTML = `<strong data-testid="tooltip-year">${row.year}</strong>
          <div>Principal: <span data-testid="tooltip-principal">${format(row.principal)}</span></div>
          <div>Interest: <span data-testid="tooltip-interest">${format(row.interest)}</span></div>
          <div>Balance: <span data-testid="tooltip-balance">${format(row.balance)}</span></div>`;
        tooltip.hidden = false;
        const box = container.getBoundingClientRect();
        const bar = g.getBoundingClientRect();
        tooltip.style.left = `${bar.left - box.left + bar.width / 2}px`;
        tooltip.style.top = `${bar.top - box.top}px`;
      };
      const hide = () => { tooltip.hidden = true; };
      g.addEventListener('mouseenter', show);
      g.addEventListener('focus', show);
      g.addEventListener('mouseleave', hide);
      g.addEventListener('blur', hide);
      svg.appendChild(g);
    });

    container.append(svg, tooltip);
  }

  global.Charts = { renderPie, renderStackedBars };
})(window);
