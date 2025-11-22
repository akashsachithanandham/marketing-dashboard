import React, { useCallback, useMemo, useState } from 'react';
import './styles.css';
import RegionRow from './RegionRow';
import ChannelRow from './ChannelRow';
import { formatMoney, formatNumber, formatPercent, calculateCtr } from './tableUtils';

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

  const renderChannels = useCallback(
    (region) =>
      region.channels.map((channel) => (
        <ChannelRow
          key={`${region.region}-${channel.channel}`}
          channel={channel}
          regionKey={region.region}
          totalConversions={totalConversions}
        />
      )),
    [totalConversions]
  );

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
            {regions.map((region) => (
              <RegionRow
                key={region.region}
                region={region}
                isOpen={openRegions[region.region] ?? false}
                onToggle={toggleRegion}
                totalConversions={totalConversions}
                renderChannels={renderChannels}
              />
            ))}
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
