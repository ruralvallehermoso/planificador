/**
 * Simulator component - Interactive mortgage vs investment analysis
 */
import { Chart, LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Legend, Tooltip } from 'chart.js';
import { formatEUR } from '../utils/formatters.js';
import { BACKEND_URL } from '../config.js';

Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Legend, Tooltip);

let simulatorChartInstance = null;
let balanceChartInstance = null;
let scenarioChartInstance = null;

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;

/**
 * Create simulator view container HTML
 */
export function createSimulatorView() {
    return `
    <div class="simulator-container">
        <div class="simulator-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
            <div>
                <h2 class="simulator-title">Simulador: Inversión vs Deuda <span style="font-size: 0.6em; color: #94a3b8; font-weight: normal;">(v1.6)</span></h2>
                <p class="simulator-subtitle">Compara si es más rentable mantener tu inversión o amortizar la hipoteca.</p>
            </div>
            <button id="open-config-btn" class="btn-secondary">
                <span>⚙️</span> Configuración
            </button>
        </div>

        <div class="simulator-grid">
            <!-- Main Content: Metrics & Chart -->
            <div class="simulator-main">
                <div class="simulator-metrics">
                    <div class="metric-card">
                        <span class="metric-label">Valor Inicial Cartera</span>
                        <span class="metric-value" id="sim-portfolio-basis">--</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-label">Valor Actual Cartera</span>
                        <span class="metric-value" id="sim-portfolio-value">--</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-label">Coste Hipoteca (Intereses)</span>
                        <span class="metric-value" id="sim-mortgage-cost">--</span>
                    </div>
                    <div class="metric-card" id="sim-net-card">
                        <span class="metric-label">Ganancia Neta Operación</span>
                        <span class="metric-value" id="sim-net-balance">--</span>
                        <span class="metric-delta" id="sim-roi">--%</span>
                    </div>
                </div>

                <div class="simulator-card chart-card">
                    <h3 class="card-title">Evolución Comparativa</h3>
                    <div class="simulator-chart-container">
                        <canvas id="simulatorChart"></canvas>
                    </div>
                </div>

                <div class="simulator-card chart-card">
                    <div class="balance-card-header">
                        <h3 class="card-title">Balance Neto</h3>
                        <div class="balance-summary-row">
                            <div class="balance-summary-box" id="balance-current-box">
                                <span class="balance-summary-label">Balance actual</span>
                                <span class="balance-summary-value" id="balance-current-value">--</span>
                            </div>
                            <div class="balance-summary-box" id="balance-status-box">
                                <span class="balance-summary-label">Estado</span>
                                <span class="balance-summary-value" id="balance-status-value">--</span>
                            </div>
                        </div>
                    </div>
                    <div class="simulator-chart-container">
                        <canvas id="simulatorBalanceChart"></canvas>
                    </div>
                </div>

                <div class="simulator-card chart-card">
                    <h3 class="card-title">Escenarios Futuro</h3>
                    <div class="simulator-chart-container">
                        <canvas id="simulatorScenarioChart"></canvas>
                    </div>
                </div>
                
                <div class="simulator-card table-card">
                    <h3 class="card-title">Desglose de Activos</h3>
                    <div class="simulator-table-container">
                        <table class="simulator-table" id="asset-breakdown-table">
                            <thead>
                                <tr>
                                    <th>Activo</th>
                                    <th>Tipo</th>
                                    <th>V. Inicial</th>
                                    <th>V. Actual</th>
                                    <th>Variación</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Table rows will be inserted here -->
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="simulator-card table-card">
                    <h3 class="card-title">Cuadro de Amortización</h3>
                    
                    <!-- New Summary Header matching PDF style -->
                    <div class="amortization-summary" style="display: flex; justify-content: space-around; margin-bottom: 20px; text-align: center; flex-wrap: wrap; gap: 10px;">
                        <div>
                            <div style="font-size: 0.9em; color: #64748b;">💰 Total Intereses</div>
                            <div style="font-size: 1.5em; font-weight: bold;" id="amort-total-int">--</div>
                        </div>
                        <div>
                            <div style="font-size: 0.9em; color: #64748b;">🏠 Capital</div>
                            <div style="font-size: 1.5em; font-weight: bold;" id="amort-capital">--</div>
                        </div>
                        <div>
                            <div style="font-size: 0.9em; color: #64748b;">📅 Fin Hipoteca</div>
                            <div style="font-size: 1.5em; font-weight: bold;" id="amort-end-date">--</div>
                        </div>
                    </div>

                    <div class="simulator-table-container">
                        <table class="simulator-table" id="amortization-table">
                            <thead>
                                <tr>
                                    <th>📅 Fecha</th>
                                    <th>💳 Cuota</th>
                                    <th>📉 Int.</th>
                                    <th>📈 Amort.</th>
                                    <th>✅ Int. Pag.</th>
                                    <th>⏳ Int. Pend.</th>
                                    <th>✅ Cap. Pag.</th>
                                    <th>🏠 Deuda</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Table rows will be inserted here -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Configuration Modal -->
    <div id="simulator-config-modal" class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Configuración de Hipoteca</h3>
                <button id="close-modal-btn" class="close-btn">&times;</button>
            </div>
            <div class="modal-body">
                <div class="simulator-form">
                    <div class="form-group">
                        <label for="mortgage-principal">Capital Pendiente (€)</label>
                        <input type="number" id="mortgage-principal" value="127000" step="1000">
                    </div>
                    <div class="form-group">
                        <label for="mortgage-rate">Interés Anual (%)</label>
                        <input type="number" id="mortgage-rate" value="2.5" step="0.1">
                    </div>
                    <div class="form-group">
                        <label for="mortgage-years">Plazo Restante (Años)</label>
                        <input type="number" id="mortgage-years" value="15" step="1">
                    </div>
                    <hr class="separator">
                    <div class="form-group">
                        <label for="portfolio-basis">Base de Inversión (Coste) (€)</label>
                        <input type="number" id="portfolio-basis" placeholder="Auto (Histórico)" step="1000">
                        <small>Si se deja vacío, se estima del histórico.</small>
                    </div>
                    <div class="form-group">
                        <label for="tax-rate">Impuestos Plusvalía (%)</label>
                        <input type="number" id="tax-rate" value="19" step="1">
                    </div>
                    <hr class="separator">
                    <div class="scenario-settings">
                        <div class="scenario-settings-title">Escenarios futuros</div>
                        <div class="scenario-input-grid">
                            <div class="form-group">
                                <label for="scenario-conservative-rate">Conservador (%)</label>
                                <input type="number" id="scenario-conservative-rate" value="2" step="0.1">
                            </div>
                            <div class="form-group">
                                <label for="scenario-base-rate">Base (%)</label>
                                <input type="number" id="scenario-base-rate" value="5" step="0.1">
                            </div>
                            <div class="form-group">
                                <label for="scenario-optimistic-rate">Optimista (%)</label>
                                <input type="number" id="scenario-optimistic-rate" value="8" step="0.1">
                            </div>
                        </div>
                    </div>
                    <button id="calculate-simulator" class="btn-primary">Recalcular y Guardar</button>
                </div>
            </div>
        </div>
    </div>
    `;
}

/**
 * Setup listeners for simulator
 */
export function setupSimulatorListeners() {
    const btn = document.getElementById('calculate-simulator');
    if (btn) {
        btn.addEventListener('click', () => {
            updateSimulator();
            // Close modal
            const modal = document.getElementById('simulator-config-modal');
            if (modal) modal.classList.remove('open');
        });
    }

    // Modal Interactions
    const openBtn = document.getElementById('open-config-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const modal = document.getElementById('simulator-config-modal');

    if (openBtn) {
        openBtn.addEventListener('click', () => {
            if (modal) modal.classList.add('open');
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) modal.classList.remove('open');
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('open');
            }
        });
    }
}

/**
 * Fetch data and render simulator content
 */
export async function updateSimulator() {
    const principal = parseFloat(document.getElementById('mortgage-principal').value);
    const rate = parseFloat(document.getElementById('mortgage-rate').value);
    const years = parseInt(document.getElementById('mortgage-years').value);
    const basisInput = document.getElementById('portfolio-basis').value;
    const taxRate = parseFloat(document.getElementById('tax-rate').value);

    const payload = {
        mortgage: {
            principal,
            annual_rate: rate,
            years
        },
        tax_rate: taxRate,
        start_date: "2025-11-24" // Matching user preference from Streamlit
    };

    if (basisInput) {
        payload.portfolio_basis = parseFloat(basisInput);
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/simulator/compare`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        renderSimulatorResults(data);
    } catch (error) {
        console.error("Error updating simulator:", error);
    }
}

/**
 * Render results in the UI
 */
function renderSimulatorResults(data) {
    // 1. Update Metrics
    document.getElementById('sim-portfolio-basis').textContent = formatEUR(data.portfolio_basis);
    document.getElementById('sim-portfolio-value').textContent = formatEUR(data.portfolio_value);
    document.getElementById('sim-mortgage-cost').textContent = formatEUR(data.total_interest_paid);

    const balanceEl = document.getElementById('sim-net-balance');
    const roiEl = document.getElementById('sim-roi');
    const cardEl = document.getElementById('sim-net-card');

    balanceEl.textContent = formatEUR(data.balance);
    roiEl.textContent = `${data.roi_pct > 0 ? '+' : ''}${data.roi_pct.toFixed(2)}%`;

    // UI color styling
    if (data.is_profitable) {
        cardEl.classList.add('profitable');
        cardEl.classList.remove('not-profitable');
    } else {
        cardEl.classList.add('not-profitable');
        cardEl.classList.remove('profitable');
    }

    // 2. Render Chart (Historical)
    renderSimulatorChart(data.daily_history);
    renderBalanceChart(data.daily_history);
    renderScenarioChart(data);

    // 3. Render Tables
    renderAssetBreakdown(data.asset_breakdown);
    renderAmortizationTable(data.amortization_schedule);
}

/**
 * Render asset breakdown table
 */
function renderAssetBreakdown(breakdown) {
    const tbody = document.querySelector('#asset-breakdown-table tbody');
    if (!tbody) return;

    // Sort by value descending
    const sorted = [...breakdown].sort((a, b) => b.current_value - a.current_value);

    tbody.innerHTML = sorted.map(a => `
        <tr>
            <td>${a.name}</td>
            <td><small>${a.category}</small></td>
            <td>${formatEUR(a.initial_value)}</td>
            <td>${formatEUR(a.current_value)}</td>
            <td class="${a.change_pct >= 0 ? 'text-success' : 'text-danger'}">
                ${a.change_pct > 0 ? '+' : ''}${a.change_pct.toFixed(2)}%
            </td>
        </tr>
    `).join('');
}

/**
 * Render comparison chart
 */
function renderSimulatorChart(history) {
    const canvas = document.getElementById('simulatorChart');
    if (!canvas) return;

    if (simulatorChartInstance) {
        simulatorChartInstance.destroy();
    }

    const isDark = document.documentElement.classList.contains('dark');

    // Format dates for labels
    const labels = history.map(h => {
        const d = new Date(h.date);
        return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
    });

    const benefitData = history.map(h => h.net_benefit);
    const interestData = history.map(h => h.interest_paid);

    const ctx = canvas.getContext('2d');

    simulatorChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Beneficio Neto Cartera',
                    data: benefitData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1
                },
                {
                    label: 'Coste Acumulado Hipoteca',
                    data: interestData,
                    borderColor: '#8b5cf6',
                    borderDash: [4, 4],
                    borderWidth: 3,
                    fill: false,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: isDark ? '#e2e8f0' : '#1e293b' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: isDark ? '#334155' : '#e2e8f0' },
                    ticks: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        callback: (v) => formatEUR(v)
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { color: isDark ? '#94a3b8' : '#64748b' }
                }
            }
        }
    });
}

function renderBalanceChart(history) {
    const canvas = document.getElementById('simulatorBalanceChart');
    if (!canvas) return;

    if (balanceChartInstance) {
        balanceChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const balanceSeries = buildBalanceChartSeries(history);
    const currentBalanceData = history.map(h => h.balance);
    const yRange = getPaddedRange([
        ...currentBalanceData,
        ...balanceSeries.benefit,
        ...balanceSeries.interest
    ]);
    updateBalanceSummary(currentBalanceData);

    balanceChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: balanceSeries.labels,
            datasets: [
                {
                    label: 'Balance Neto',
                    data: balanceSeries.positiveBalance,
                    borderColor: '#0f766e',
                    backgroundColor: 'rgba(16, 185, 129, 0.18)',
                    borderWidth: 3,
                    fill: {
                        target: 2,
                        above: 'rgba(16, 185, 129, 0.18)',
                        below: 'rgba(16, 185, 129, 0)'
                    },
                    tension: 0,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBorderWidth: 2,
                    pointHoverBackgroundColor: '#ffffff',
                    spanGaps: false
                },
                {
                    label: 'Balance Neto (negativo)',
                    data: balanceSeries.negativeBalance,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.16)',
                    borderWidth: 3,
                    fill: {
                        target: 2,
                        above: 'rgba(239, 68, 68, 0)',
                        below: 'rgba(239, 68, 68, 0.16)'
                    },
                    tension: 0,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBorderWidth: 2,
                    pointHoverBackgroundColor: '#ffffff',
                    spanGaps: false
                },
                {
                    label: 'Coste Acumulado Hipoteca',
                    data: balanceSeries.interest,
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 3,
                    borderDash: [4, 4],
                    fill: false,
                    stepped: true,
                    tension: 0,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: isDark ? '#e2e8f0' : '#1e293b',
                        filter: (item) => item.text !== 'Balance Neto (negativo)'
                    }
                },
                tooltip: {
                    ...getEuroTooltipOptions(isDark),
                    callbacks: {
                        label: (ctx) => {
                            const label = ctx.dataset.label === 'Balance Neto (negativo)' ? 'Balance Neto' : ctx.dataset.label;
                            let val = ctx.parsed.y;
                            if (label === 'Balance Neto' && balanceSeries.rawPoints[ctx.dataIndex]) {
                                val = balanceSeries.rawPoints[ctx.dataIndex].balance;
                            }
                            return `${label}: ${formatEUR(val)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    suggestedMin: yRange.min,
                    suggestedMax: yRange.max,
                    grid: {
                        color: (ctx) => ctx.tick.value === 0 ? (isDark ? '#94a3b8' : '#475569') : (isDark ? '#334155' : '#e2e8f0'),
                        lineWidth: (ctx) => ctx.tick.value === 0 ? 1.4 : 1
                    },
                    ticks: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        callback: (v) => formatEUR(v)
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        maxTicksLimit: 8
                    }
                }
            }
        }
    });
}

function buildBalanceChartSeries(history) {
    const points = [];

    history.forEach((entry, index) => {
        points.push(toBalanceChartPoint(entry));

        const nextEntry = history[index + 1];
        if (!nextEntry || !crossesZero(entry.balance, nextEntry.balance)) {
            return;
        }

        const ratio = Math.abs(entry.balance) / (Math.abs(entry.balance) + Math.abs(nextEntry.balance));
        const crossingDate = interpolateDate(entry.date, nextEntry.date, ratio);
        points.push({
            label: formatShortDate(crossingDate),
            balance: 0,
            net_benefit: interpolateNumber(entry.net_benefit, nextEntry.net_benefit, ratio),
            interest_paid: interpolateNumber(entry.interest_paid, nextEntry.interest_paid, ratio)
        });
    });

    return {
        labels: points.map(point => point.label),
        positiveBalance: points.map(point => point.balance >= 0 ? point.net_benefit : null),
        negativeBalance: points.map(point => point.balance <= 0 ? point.net_benefit : null),
        benefit: points.map(point => point.net_benefit),
        interest: points.map(point => point.interest_paid),
        rawPoints: points
    };
}

function toBalanceChartPoint(entry) {
    return {
        label: formatShortDate(entry.date),
        balance: entry.balance,
        net_benefit: entry.net_benefit,
        interest_paid: entry.interest_paid
    };
}

function crossesZero(currentBalance, nextBalance) {
    return currentBalance !== 0 && nextBalance !== 0 && Math.sign(currentBalance) !== Math.sign(nextBalance);
}

function interpolateNumber(start, end, ratio) {
    return start + (end - start) * ratio;
}

function interpolateDate(startValue, endValue, ratio) {
    const startDate = parseScheduleDate(startValue);
    const endDate = parseScheduleDate(endValue);
    if (!startDate || !endDate) return startValue;
    return new Date(startDate.getTime() + (endDate.getTime() - startDate.getTime()) * ratio);
}

function updateBalanceSummary(balanceData) {
    const currentBalance = balanceData[balanceData.length - 1] ?? 0;
    const status = currentBalance > 0 ? 'Favorable' : currentBalance < 0 ? 'Desfavorable' : 'Equilibrado';
    const statusClass = currentBalance > 0 ? 'positive' : currentBalance < 0 ? 'negative' : 'neutral';

    const currentBox = document.getElementById('balance-current-box');
    const currentValue = document.getElementById('balance-current-value');
    const statusBox = document.getElementById('balance-status-box');
    const statusValue = document.getElementById('balance-status-value');

    if (currentValue) {
        currentValue.textContent = `${currentBalance > 0 ? '+' : ''}${formatEUR(currentBalance)}`;
    }

    if (statusValue) {
        statusValue.textContent = status;
    }

    [currentBox, statusBox].forEach(box => {
        if (!box) return;
        box.classList.remove('positive', 'negative', 'neutral');
        box.classList.add(statusClass);
    });
}

function renderScenarioChart(data) {
    const canvas = document.getElementById('simulatorScenarioChart');
    if (!canvas) return;

    if (scenarioChartInstance) {
        scenarioChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    const isDark = document.documentElement.classList.contains('dark');
    const settings = getScenarioSettings();
    const projection = buildScenarioProjection(data, settings);
    const allValues = [
        ...projection.conservative,
        ...projection.base,
        ...projection.optimistic
    ];
    const yRange = getPaddedRange(allValues);

    scenarioChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: projection.labels,
            datasets: [
                {
                    label: `Conservador (${formatScenarioRate(settings.conservative)}%)`,
                    data: projection.conservative,
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.08)',
                    borderWidth: 2,
                    borderDash: [6, 6],
                    fill: false,
                    tension: 0.25,
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: `Base (${formatScenarioRate(settings.base)}%)`,
                    data: projection.base,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.25,
                    pointRadius: 0,
                    pointHoverRadius: 5
                },
                {
                    label: `Optimista (${formatScenarioRate(settings.optimistic)}%)`,
                    data: projection.optimistic,
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.08)',
                    borderWidth: 2,
                    borderDash: [6, 6],
                    fill: false,
                    tension: 0.25,
                    pointRadius: 0,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: { color: isDark ? '#e2e8f0' : '#1e293b' }
                },
                tooltip: getEuroTooltipOptions(isDark)
            },
            scales: {
                y: {
                    suggestedMin: yRange.min,
                    suggestedMax: yRange.max,
                    grid: {
                        color: (ctx) => ctx.tick.value === 0 ? (isDark ? '#94a3b8' : '#475569') : (isDark ? '#334155' : '#e2e8f0'),
                        lineWidth: (ctx) => ctx.tick.value === 0 ? 1.4 : 1
                    },
                    ticks: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        callback: (v) => formatEUR(v)
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: isDark ? '#94a3b8' : '#64748b',
                        maxTicksLimit: 9
                    }
                }
            }
        }
    });
}

function getScenarioSettings() {
    return {
        conservative: readNumberInput('scenario-conservative-rate', 2),
        base: readNumberInput('scenario-base-rate', 5),
        optimistic: readNumberInput('scenario-optimistic-rate', 8),
        taxRate: readNumberInput('tax-rate', 19)
    };
}

function buildScenarioProjection(data, settings) {
    const today = getStartOfDay(new Date());
    const futureSchedule = (data.amortization_schedule || [])
        .map(point => ({ ...point, parsedDate: parseScheduleDate(point.date) }))
        .filter(point => point.parsedDate && point.parsedDate > today)
        .sort((a, b) => a.parsedDate - b.parsedDate);

    const labels = ['Hoy'];
    const conservative = [data.balance];
    const base = [data.balance];
    const optimistic = [data.balance];

    futureSchedule.forEach(point => {
        labels.push(formatMonthYear(point.parsedDate));
        conservative.push(calculateProjectedBalance(data, settings.conservative, settings.taxRate, point, today));
        base.push(calculateProjectedBalance(data, settings.base, settings.taxRate, point, today));
        optimistic.push(calculateProjectedBalance(data, settings.optimistic, settings.taxRate, point, today));
    });

    return { labels, conservative, base, optimistic };
}

function calculateProjectedBalance(data, annualRate, taxRate, schedulePoint, today) {
    const elapsedYears = Math.max(0, (schedulePoint.parsedDate - today) / MS_PER_YEAR);
    const projectedPortfolioValue = data.portfolio_value * Math.pow(1 + annualRate / 100, elapsedYears);
    const grossBenefit = projectedPortfolioValue - data.portfolio_basis;
    const taxes = Math.max(0, grossBenefit * (taxRate / 100));
    const netBenefit = grossBenefit - taxes;
    return Math.round((netBenefit - schedulePoint.cumulative_interest) * 100) / 100;
}

function getEuroTooltipOptions(isDark) {
    return {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#e2e8f0' : '#1e293b',
        bodyColor: isDark ? '#cbd5e1' : '#64748b',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 12,
        callbacks: {
            label: (ctx) => {
                const label = ctx.dataset.label === 'Balance Neto (negativo)' ? 'Balance Neto' : ctx.dataset.label;
                return `${label}: ${formatEUR(ctx.parsed.y)}`;
            }
        }
    };
}

function getPaddedRange(values) {
    const finiteValues = values.filter(Number.isFinite);
    if (finiteValues.length === 0) {
        return { min: -1000, max: 1000 };
    }

    const min = Math.min(0, ...finiteValues);
    const max = Math.max(0, ...finiteValues);
    const span = Math.max(max - min, 1000);
    return {
        min: min - span * 0.12,
        max: max + span * 0.12
    };
}

function readNumberInput(id, fallback) {
    const input = document.getElementById(id);
    const value = parseFloat(input?.value);
    return Number.isFinite(value) ? value : fallback;
}

function parseScheduleDate(value) {
    if (!value) return null;
    if (typeof value === 'string') {
        const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (isoMatch) {
            return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3]));
        }
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : getStartOfDay(date);
}

function getStartOfDay(date) {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

function formatShortDate(value) {
    const date = parseScheduleDate(value);
    if (!date) return '';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function formatMonthYear(date) {
    return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
}

function formatScenarioRate(rate) {
    return Number.isInteger(rate) ? String(rate) : rate.toFixed(1);
}


let globalSchedule = [];
let currentYear = new Date().getFullYear();

function renderAmortizationTable(schedule) {
    // Update global reference
    if (schedule && schedule.length > 0) {
        globalSchedule = schedule;
    } else if (globalSchedule.length > 0) {
        schedule = globalSchedule;
    } else {
        return; // No data
    }

    // Find container
    const tableContainer = document.querySelector('.simulator-table-container');
    const tbody = document.querySelector('#amortization-table tbody');
    if (!tbody || !tableContainer) return;

    // --- Update Summary Header (Only once or always? Always is fine) ---
    const totalInterest = schedule.reduce((sum, s) => sum + s.interest, 0);
    const capital = schedule[0]?.remaining_balance + schedule[0]?.principal || 127000;
    const lastRow = schedule[schedule.length - 1];
    let endDateStr = "--";

    if (lastRow && lastRow.date) {
        const dStr = String(lastRow.date);
        if (dStr.includes('/')) {
            const parts = dStr.split('/');
            if (parts.length === 3) endDateStr = `${parts[1]}/${parts[2]}`;
        } else if (dStr.includes('-')) {
            const d = new Date(dStr);
            endDateStr = `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
        }
    }

    const elTotal = document.getElementById('amort-total-int');
    if (elTotal) elTotal.textContent = formatEUR(totalInterest);
    const elCap = document.getElementById('amort-capital');
    if (elCap) elCap.textContent = formatEUR(capital);
    const elEnd = document.getElementById('amort-end-date');
    if (elEnd) elEnd.textContent = endDateStr;


    // --- Year Selector ---
    // Extract Years
    const years = [...new Set(schedule.map(s => new Date(s.date).getFullYear()))].sort();

    // Default currentYear if not in list (e.g. mortgage starts later)
    if (!years.includes(currentYear)) {
        if (years.length > 0) currentYear = years[0];
    }

    // Check if Selector Exists
    let selector = document.getElementById('amort-year-selector');
    if (!selector) {
        selector = document.createElement('div');
        selector.id = 'amort-year-selector';
        selector.style.cssText = "display: flex; gap: 8px; overflow-x: auto; padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0;";
        // Insert before table
        const table = document.getElementById('amortization-table');
        table.parentNode.insertBefore(selector, table);
    }

    // Render Years
    selector.innerHTML = years.map(y => {
        const isActive = (y === currentYear);
        const bg = isActive ? '#3b82f6' : '#f1f5f9';
        const color = isActive ? 'white' : '#64748b';
        return `<button onclick="window.setAmortYear(${y})" class="year-btn" style="padding: 6px 12px; border-radius: 20px; border: none; background: ${bg}; color: ${color}; cursor: pointer; font-size: 0.9em; white-space: nowrap;">${y}</button>`;
    }).join('');

    // Expose global setter
    window.setAmortYear = (y) => {
        currentYear = y;
        renderAmortizationTable(globalSchedule);
    };


    // --- Render Table for Current Year ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let foundNext = false;
    let nextIndex = -1;

    // Calculate global 'next' index for highlighting
    schedule.forEach((s, i) => {
        const d = new Date(s.date);
        d.setHours(0, 0, 0, 0);
        if (!foundNext && d >= today) {
            foundNext = true;
            nextIndex = i;
        }
    });

    // Filter by Year
    const filteredrows = schedule.map((s, i) => ({ ...s, globalIndex: i })).filter(s => {
        return new Date(s.date).getFullYear() === currentYear;
    });

    tbody.innerHTML = filteredrows.map(s => {
        const i = s.globalIndex;
        let rowClass = "";
        let statusIcon = "";
        const rowDate = new Date(s.date);
        rowDate.setHours(0, 0, 0, 0);

        const isPaid = (rowDate < today);
        const isNext = (i === nextIndex);

        if (isPaid) {
            rowClass = "paid-row";
            statusIcon = "✅";
        } else if (isNext) {
            rowClass = "next-row";
            statusIcon = "👉";
        }

        let pendingInt = s.pending_interest !== undefined ? s.pending_interest : 0;

        // Inline Styles
        let style = "";
        if (rowClass === "paid-row") {
            style = "background-color: #f1f5f9; color: #94a3b8; text-decoration: line-through;";
        } else if (rowClass === "next-row") {
            style = "background-color: #ecfdf5; border-left: 4px solid #10b981; font-weight: bold; color: #0f172a;";
        }

        return `
        <tr style="${style}">
            <td>${statusIcon} ${s.date}</td>
            <td>${formatEUR(s.payment)}</td>
            <td>${formatEUR(s.interest)}</td>
            <td>${formatEUR(s.principal)}</td>
            <td class="${rowClass === 'paid-row' ? '' : 'text-success'}">${formatEUR(s.cumulative_interest)}</td>
            <td style="${rowClass === 'paid-row' ? 'text-decoration: none;' : 'color: #64748b;'}">${formatEUR(pendingInt)}</td>
            <td class="${rowClass === 'paid-row' ? '' : 'text-success'}">${formatEUR(s.cumulative_principal)}</td>
            <td style="font-weight: bold;">${formatEUR(s.remaining_balance)}</td>
        </tr>
    `}).join('');
}
