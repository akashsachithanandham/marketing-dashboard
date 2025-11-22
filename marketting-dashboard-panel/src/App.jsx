import React, { useMemo, useState } from 'react';
import './App.css';
import marketingData from './data/marketing-data.json';
import ContributionTable from './components/Table';
import RegionChart from './components/RegionChart';
import RegionChannelCharts from './components/RegionChannelCharts';

function App() {
  const [data] = useState(marketingData);

  // Keep derived totals at the page level to avoid recalculating in children.
  const totals = useMemo(() => {
    return data.reduce(
      (acc, entry) => {
        acc.spend += entry.spend || 0;
        acc.impressions += entry.impressions || 0;
        acc.conversions += entry.conversions || 0;
        acc.clicks += entry.clicks || 0;
        return acc;
      },
      { spend: 0, impressions: 0, conversions: 0, clicks: 0 }
    );
  }, [data]);

  const regionTotals = useMemo(() => {
    const map = new Map();
    data.forEach((item) => {
      const region = item.region || 'Unknown';
      if (!map.has(region)) {
        map.set(region, { region, spend: 0, impressions: 0, conversions: 0, clicks: 0 });
      }
      const entry = map.get(region);
      entry.spend += item.spend || 0;
      entry.impressions += item.impressions || 0;
      entry.conversions += item.conversions || 0;
      entry.clicks += item.clicks || 0;
    });
    return Array.from(map.values()).sort((a, b) => b.spend - a.spend);
  }, [data]);

  return (
    <main className="page">
      <section className="intro">
        <div>
          <h1>Marketing Contribution Dashboard</h1>
        </div>
      </section>

      <ContributionTable data={data} totals={totals} />
      <RegionChart data={regionTotals} />
      <RegionChannelCharts data={data} />
    </main>
  );
}

export default App;
