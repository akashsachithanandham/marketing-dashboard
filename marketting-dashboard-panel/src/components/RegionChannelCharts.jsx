import React, { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './chart.css';

const formatNumber = (value) => {
  if (!value || Number.isNaN(value)) return '0';
  return `${(value / 1_000_000).toFixed(2)}M`;
};

const formatPercent = (value) => `${Number(value ?? 0).toFixed(2)}%`;

const COLORS = ['#0f766e', '#f97316', '#2563eb', '#7c3aed', '#eab308', '#14b8a6', '#ef4444'];

const RegionChannelCard = ({ region }) => {
  const [metric, setMetric] = useState('spend');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 220);
    return () => clearTimeout(timer);
  }, [loading]);

  const metricConfig = {
    spend: { label: 'Spend', dataKey: 'spend', color: '#0f766e', formatter: formatNumber, prefix: '₹' },
    conversions: {
      label: 'Conversions',
      dataKey: 'conversions',
      color: '#f97316',
      formatter: (v) => Math.round(v ?? 0).toLocaleString('en-IN'),
      prefix: '',
    },
    ctr: { label: 'CTR', dataKey: 'ctr', color: '#2563eb', formatter: formatPercent, prefix: '' },
  };

  const activeMetric = metricConfig[metric] || metricConfig.spend;

  return (
    <div className="chart-card" key={region.region}>
      <div className="chart-header">
        <div>
          <p className="table-kicker">Channel mix</p>
          <h2>{region.region}</h2>
        </div>
        <select
          className="chart-select"
          value={metric}
          onChange={(e) => {
            setLoading(true);
            setMetric(e.target.value);
          }}
          aria-label={`Select metric for ${region.region}`}
        >
          <option value="spend">Spend</option>
          <option value="conversions">Conversions</option>
          <option value="ctr">CTR</option>
        </select>
      </div>
      <div className="chart-body small">
        {/* {loading && <div className="chart-loader">Loading…</div>} */}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart key={`${region.region}-${metric}`}>
            <Pie
              data={region.channels}
              dataKey={activeMetric.dataKey}
              nameKey="channel"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={2}
              isAnimationActive
              animationDuration={500}
            >
              {region.channels.map((entry, index) => (
                <Cell key={`${region.region}-${entry.channel}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, payload) => {
                const { conversions, spend, ctr } = payload?.payload || {};
                let baseValue = value;
                if (name === 'ctr') baseValue = ctr;
                if (name === 'spend') baseValue = spend;
                if (name === 'conversions') baseValue = conversions;

                const formatted = activeMetric.formatter(baseValue);
                const label = activeMetric.label;
                return [activeMetric.prefix ? `${activeMetric.prefix}${formatted}` : formatted, label];
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

const RegionChannelCharts = ({ data = [] }) => {
  const regionChannelData = useMemo(() => {
    const regionMap = new Map();

    data.forEach((item) => {
      const region = item.region || 'Unknown';
      const channel = item.channel || 'Other';

      if (!regionMap.has(region)) {
        regionMap.set(region, {
          region,
          totalConversions: 0,
          channels: new Map(),
        });
      }

      const regionEntry = regionMap.get(region);
      regionEntry.totalConversions += item.conversions || 0;

      if (!regionEntry.channels.has(channel)) {
        regionEntry.channels.set(channel, {
          channel,
          conversions: 0,
          spend: 0,
          impressions: 0,
          clicks: 0,
        });
      }

      const channelEntry = regionEntry.channels.get(channel);
      channelEntry.conversions += item.conversions || 0;
      channelEntry.spend += item.spend || 0;
      channelEntry.impressions += item.impressions || 0;
      channelEntry.clicks += item.clicks || 0;
    });

    return Array.from(regionMap.values()).map((region) => {
      const channels = Array.from(region.channels.values())
        .map((ch) => ({
          ...ch,
          contribution: region.totalConversions
            ? (ch.conversions / region.totalConversions) * 100
            : 0,
          ctr: ch.impressions ? (ch.clicks / ch.impressions) * 100 : 0,
        }))
        .sort((a, b) => b.conversions - a.conversions)
        .slice(0, 6); // top 6 per region for readability

      return { region: region.region, channels };
    });
  }, [data]);

  if (!regionChannelData.length) {
    return null;
  }

  return (
    <section className="chart-grid">
      {regionChannelData.map((region) => (
        <RegionChannelCard region={region} key={region.region} />
      ))}
    </section>
  );
};

export default RegionChannelCharts;
