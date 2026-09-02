import React from 'react';
import { cn } from '../lib/utils';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon, 
  ShieldCheckIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline';

/**
 * DataSourceBadge component
 * Displays data transparency badge showing source, timestamp, and verification status.
 *
 * @param {Object} props
 * @param {string} [props.source="Government of India (Data.gov.in)"] - Name/Label of the data source
 * @param {Date|string} [props.timestamp] - Timestamp of data update
 * @param {'verified'|'cached'|'unavailable'|'live'|'warning'} [props.status='verified'] - Verification status
 * @param {string} [props.className] - Optional extra Tailwind classes
 */
export default function DataSourceBadge({
  source,
  timestamp,
  status = 'verified',
  className = ''
}) {
  const formattedTime = timestamp
    ? (typeof timestamp === 'string' 
        ? timestamp 
        : timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' }))
    : 'Just now';

  // Determine status configuration based on status or source string
  let config = {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    tagBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: <ShieldCheckIcon className="w-4 h-4 text-emerald-600 shrink-0" />,
    tagText: 'VERIFIED SOURCE',
    defaultSource: '✓ Government of India (Data.gov.in)'
  };

  if (status === 'unavailable' || (source && source.includes('Unavailable'))) {
    config = {
      bg: 'bg-amber-50 text-amber-900 border-amber-200',
      tagBg: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: <ExclamationTriangleIcon className="w-4 h-4 text-amber-600 shrink-0" />,
      tagText: 'DATA UNAVAILABLE',
      defaultSource: '⚠ Market Data Unavailable'
    };
  } else if (status === 'cached' || (source && source.includes('Cached'))) {
    config = {
      bg: 'bg-blue-50 text-blue-800 border-blue-200',
      tagBg: 'bg-blue-100 text-blue-800 border-blue-300',
      icon: <CircleStackIcon className="w-4 h-4 text-blue-600 shrink-0" />,
      tagText: 'CACHED VERIFIED DATA',
      defaultSource: 'Cached Verified Data'
    };
  } else if (status === 'live') {
    config = {
      bg: 'bg-teal-50 text-teal-800 border-teal-200',
      tagBg: 'bg-teal-100 text-teal-800 border-teal-300',
      icon: <CheckCircleIcon className="w-4 h-4 text-teal-600 shrink-0" />,
      tagText: 'LIVE MANDI FEED',
      defaultSource: '✓ Government of India (Data.gov.in)'
    };
  }

  const displaySource = source || config.defaultSource;

  return (
    <div className={cn(
      "inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium shadow-xs transition-all",
      config.bg,
      className
    )}>
      <div className="flex items-center gap-1.5">
        {config.icon}
        <span className="font-semibold">{displaySource}</span>
      </div>

      <span className="text-slate-300 dark:text-slate-600">|</span>

      <span className={cn(
        "px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider border",
        config.tagBg
      )}>
        {config.tagText}
      </span>

      <span className="text-slate-300 dark:text-slate-600">|</span>

      <div className="flex items-center gap-1 opacity-80 text-[11px]">
        <ClockIcon className="w-3 h-3 shrink-0" />
        <span>{formattedTime}</span>
      </div>
    </div>
  );
}
