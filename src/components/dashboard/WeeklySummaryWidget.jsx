import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowRight } from 'lucide-react';
import { getWeekDays, formatDuration, getTodayDateString } from '../../utils/dateUtils';
import styles from '../../styles/Dashboard.module.css';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const WeeklySummaryWidget = ({ sessions = [] }) => {
  const todayStr = getTodayDateString();
  const weekDays = getWeekDays(todayStr);

  // Group study sessions by day
  const dayMinutesMap = new Map();
  weekDays.forEach((d) => dayMinutesMap.set(d, 0));

  sessions.forEach((s) => {
    if (dayMinutesMap.has(s.date)) {
      dayMinutesMap.set(s.date, dayMinutesMap.get(s.date) + (Number(s.durationMinutes) || 0));
    }
  });

  const dayItems = weekDays.map((dateStr, idx) => {
    const mins = dayMinutesMap.get(dateStr) || 0;
    return {
      date: dateStr,
      label: DAY_LABELS[idx],
      minutes: mins,
      isToday: dateStr === todayStr,
    };
  });

  const totalWeekMinutes = dayItems.reduce((acc, item) => acc + item.minutes, 0);
  const maxDayMinutes = dayItems.reduce((max, item) => Math.max(max, item.minutes), 0);

  const safeMax = Math.max(60, maxDayMinutes);
  const chartHeight = 90;
  const chartWidth = 260;
  const usableHeight = 70;
  const barWidth = 20;
  const step = chartWidth / 7;

  return (
    <div className={styles.sectionCard} aria-labelledby="weekly-summary-title">
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleWrap}>
          <BarChart3 size={20} color="var(--btn-primary)" />
          <h2 id="weekly-summary-title" className={styles.sectionTitle}>
            Weekly Study Summary
          </h2>
        </div>

        <Link to="/dashboard/progress" className={styles.sectionLink}>
          <span>Analytics</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className={styles.miniChartContainer}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            This Week's Total:
          </span>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {formatDuration(totalWeekMinutes)}
          </span>
        </div>

        {totalWeekMinutes === 0 ? (
          <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
            No focus sessions logged this week. Use the Study Timer to track your daily progress.
          </div>
        ) : (
          <svg
            className={styles.miniChartSvg}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            aria-label="Weekly study bar chart"
            role="img"
          >
            {/* Baseline */}
            <line
              x1="0"
              y1={usableHeight}
              x2={chartWidth}
              y2={usableHeight}
              stroke="var(--border-color)"
              strokeWidth="1"
            />

            {/* Daily Bars */}
            {dayItems.map((item, idx) => {
              const x = idx * step + (step - barWidth) / 2;
              const barH = item.minutes > 0 ? (item.minutes / safeMax) * (usableHeight - 10) : 2;
              const y = usableHeight - barH;

              return (
                <g key={item.date}>
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barH}
                    rx="3"
                    ry="3"
                    className={styles.miniChartBar}
                    style={{
                      fill:
                        item.minutes > 0
                          ? item.isToday
                            ? 'var(--btn-primary)'
                            : 'var(--success)'
                          : 'var(--border-color)',
                      opacity: item.minutes > 0 ? 1 : 0.6,
                    }}
                  >
                    <title>{`${item.label}: ${formatDuration(item.minutes)}`}</title>
                  </rect>

                  <text
                    x={x + barWidth / 2}
                    y={usableHeight + 14}
                    className={styles.miniChartText}
                    style={{
                      fontWeight: item.isToday ? 800 : 600,
                      fill: item.isToday ? 'var(--btn-primary)' : 'var(--text-secondary)',
                    }}
                  >
                    {item.label}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
};

export default WeeklySummaryWidget;
