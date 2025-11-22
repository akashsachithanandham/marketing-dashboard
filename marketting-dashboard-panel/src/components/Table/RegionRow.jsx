import React from 'react';
import { calculateCtr, formatMoney, formatNumber, formatPercent } from './tableUtils';

function RegionRow({ region, isOpen, onToggle, totalConversions, renderChannels }) {
  const ctr = calculateCtr(region.totals.clicks, region.totals.impressions);
  const contribution =
    totalConversions > 0 ? (region.totals.conversions / totalConversions) * 100 : 0;

  const handleToggle = () => onToggle(region.region);

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
      {isOpen && renderChannels(region)}
    </React.Fragment>
  );
}

export default RegionRow;
