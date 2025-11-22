import React, { useMemo, useState } from 'react';
import './App.css';
import marketingData from './data/marketing-data.json';
import ContributionTable from './components/Table';

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

  return (
    <main className="page">
      <section className="intro">
        <div>
          <h1>Marketing Contribution Dashboard</h1>
        </div>
      </section>

      <ContributionTable data={data} totals={totals} />
    </main>
  );
}

export default App;
