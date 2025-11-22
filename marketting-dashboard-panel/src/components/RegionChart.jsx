import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './chart.css';

const formatMoney = (value) => {
  if (!value || Number.isNaN(value)) return '0';
  return `${(value / 1_000_000).toFixed(2)}M`;
};

const formatNumber = (value) => {
  if (!value || Number.isNaN(value)) return '0';
  return Math.round(value).toLocaleString('en-IN');
};

const formatPercent = (value) => {
  if (!value || Number.isNaN(value)) return '0%';
  return `${Number(value).toFixed(2)}%`;
};

function RegionChart({ data = [] }) {
  const [metric, setMetric] = useState('spend');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 220);
    return () => clearTimeout(timer);
  }, [loading]);

  const chartData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        ctr: item.impressions ? (item.clicks / item.impressions) * 100 : 0,
      })),
    [data]
  );

  const metricConfig = {
    spend: { label: 'Spend', dataKey: 'spend', color: '#0f766e', formatter: formatMoney, prefix: '₹' },
    conversions: {
      label: 'Conversions',
      dataKey: 'conversions',
      color: '#f97316',
      formatter: formatNumber,
      prefix: '',
    },
    ctr: { label: 'CTR', dataKey: 'ctr', color: '#2563eb', formatter: formatPercent, prefix: '' },
  };

  const activeMetric = metricConfig[metric] || metricConfig.spend;

  return (
    <section className="chart-card">
      <div className="chart-header">
        <div>
          <p className="table-kicker">Performance Insights</p>
          <h2>Region overview</h2>
        </div>
        <select
          className="chart-select"
          value={metric}
          onChange={(e) => {
            setLoading(true);
            setMetric(e.target.value);
          }}
          aria-label="Select metric"
        >
          <option value="spend">Spend</option>
          <option value="conversions">Conversions</option>
          <option value="ctr">CTR</option>
        </select>
      </div>
      <div className="chart-body">
        {loading && <div className="chart-loader">Loading…</div>}
        <ResponsiveContainer width="100%" height={340}>
          <BarChart
            key={metric}
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="region" tick={{ fontSize: 12 }} />
            <YAxis
              tickFormatter={activeMetric.formatter}
              tick={{ fontSize: 12 }}
              stroke={activeMetric.color}
            />
            <Tooltip
              formatter={(value, name) => {
                const formatted = activeMetric.formatter(value);
                const label = activeMetric.label;
                return [activeMetric.prefix ? `${activeMetric.prefix}${formatted}` : formatted, label];
              }}
              labelClassName="chart-tooltip-label"
            />
            <Bar
              dataKey={activeMetric.dataKey}
              fill={activeMetric.color}
              name={activeMetric.label}
              isAnimationActive
              animationDuration={500}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export default RegionChart;
