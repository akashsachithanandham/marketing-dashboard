import React, { useCallback, useMemo, useState } from 'react';
import './styles.css';

const formatMoney = (value) => {
  if (!value || Number.isNaN(value)) return '-';
  if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(2)} M`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(2)} K`;
  return `₹${value.toFixed(2)}`;
};

const formatNumber = (value) => {
  if (!value || Number.isNaN(value)) return '-';
  return value.toLocaleString('en-IN');
};

const formatPercent = (value) => {
  if (!value || Number.isNaN(value)) return '-';
  return `${value.toFixed(2)}%`;
};

const calculateCtr = (clicks, impressions) =>
  impressions ? (clicks / impressions) * 100 : 0;

function ContributionTable({ data = [], totals }) {
  const [openRegions, setOpenRegions] = useState({});

  const totalConversions = totals?.conversions || 0;

  const regions = useMemo(() => {
    const regionMap = new Map();

    data.forEach((item) => {
      const region = item.region || 'Unknown';
      const channel = item.channel || 'Other';

      if (!regionMap.has(region)) {
        regionMap.set(region, {
          region,
          totals: { spend: 0, impressions: 0, conversions: 0, clicks: 0 },
          channels: new Map(),
        });
      }

      const regionEntry = regionMap.get(region);
      regionEntry.totals.spend += item.spend || 0;
      regionEntry.totals.impressions += item.impressions || 0;
      regionEntry.totals.conversions += item.conversions || 0;
      regionEntry.totals.clicks += item.clicks || 0;

      if (!regionEntry.channels.has(channel)) {
        regionEntry.channels.set(channel, {
          channel,
          spend: 0,
          impressions: 0,
          conversions: 0,
          clicks: 0,
        });
      }

      const channelEntry = regionEntry.channels.get(channel);
      channelEntry.spend += item.spend || 0;
      channelEntry.impressions += item.impressions || 0;
      channelEntry.conversions += item.conversions || 0;
      channelEntry.clicks += item.clicks || 0;
    });

    return Array.from(regionMap.values())
      .map((region) => ({
        ...region,
        channels: Array.from(region.channels.values()).sort(
          (a, b) => b.conversions - a.conversions
        ),
      }))
      .sort((a, b) => b.totals.conversions - a.totals.conversions);
  }, [data]);

  const toggleRegion = useCallback((region) => {
    setOpenRegions((prev) => ({
      ...prev,
      [region]: !prev[region],
    }));
  }, []);

  const renderChannelRow = (channel, regionKey) => {
    const ctr = calculateCtr(channel.clicks, channel.impressions);
    const contribution =
      totalConversions > 0
        ? (channel.conversions / totalConversions) * 100
        : 0;

    return (
      <tr key={`${regionKey}-${channel.channel}`} className="channel-row">
        <td className="channel-name">
          <span className="channel-line" />
          {channel.channel}
        </td>
        <td>{formatMoney(channel.spend)}</td>
        <td>{formatNumber(channel.impressions)}</td>
        <td>{formatNumber(channel.clicks)}</td>
        <td>{formatNumber(channel.conversions)}</td>
        <td>{formatPercent(ctr)}</td>
        <td>{formatPercent(contribution)}</td>
      </tr>
    );
  };

  const renderRegionRow = (region) => {
    const isOpen = openRegions[region.region] ?? false;
    const ctr = calculateCtr(region.totals.clicks, region.totals.impressions);
    const contribution =
      totalConversions > 0
        ? (region.totals.conversions / totalConversions) * 100
        : 0;

    const handleToggle = () => toggleRegion(region.region);

    const onKeyToggle = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    };

    return (
      <React.Fragment key={region.region}>
        <tr
          className={`region-row ${isOpen ? 'is-open' : ''}`}
          onClick={handleToggle}
          onKeyDown={onKeyToggle}
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
        >
          <td className="region-name">
            <button
              type="button"
              className="toggle"
              aria-label={`Toggle ${region.region}`}
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
            >
              <svg
                className={`chevron-icon ${isOpen ? 'chevron-open' : ''}`}
                viewBox="0 0 20 20"
                aria-hidden="true"
              >
                <path
                  d="M6 8l4 4 4-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            {region.region}
          </td>
          <td>{formatMoney(region.totals.spend)}</td>
          <td>{formatNumber(region.totals.impressions)}</td>
          <td>{formatNumber(region.totals.clicks)}</td>
          <td>{formatNumber(region.totals.conversions)}</td>
          <td>{formatPercent(ctr)}</td>
          <td>{formatPercent(contribution)}</td>
        </tr>
        {isOpen && region.channels.map((channel) => renderChannelRow(channel, region.region))}
      </React.Fragment>
    );
  };

  const totalCtr = calculateCtr(totals?.clicks, totals?.impressions);

  return (
    <section className="table-card">
      <header className="table-header">
        <div>
          <p className="table-kicker">Contribution</p>
          <h2>Region &amp; Channel Performance</h2>
        </div>
      </header>

      <div className="table-wrapper">
        <table className="contribution-table">
          <thead>
            <tr>
              <th className="col-category">Category</th>
              <th>Spend</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>Conversions</th>
              <th>CTR</th>
              <th>Contribution (%)</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => renderRegionRow(region))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td>Total</td>
              <td>{formatMoney(totals?.spend)}</td>
              <td>{formatNumber(totals?.impressions)}</td>
              <td>{formatNumber(totals?.clicks)}</td>
              <td>{formatNumber(totals?.conversions)}</td>
              <td>{formatPercent(totalCtr)}</td>
          <td>{totals?.conversions ? formatPercent(100) : '-'}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export default ContributionTable;
