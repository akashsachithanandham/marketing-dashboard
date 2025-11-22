import React from 'react';
import { calculateCtr, formatMoney, formatNumber, formatPercent } from './tableUtils';

function ChannelRow({ channel, regionKey, totalConversions }) {
  const ctr = calculateCtr(channel.clicks, channel.impressions);
  const contribution =
    totalConversions > 0 ? (channel.conversions / totalConversions) * 100 : 0;

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
}

export default ChannelRow;
