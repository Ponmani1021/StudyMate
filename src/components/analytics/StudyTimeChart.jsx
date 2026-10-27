import React, { useState } from 'react';
import { BarChart3, Award } from 'lucide-react';
import { formatDuration } from '../../utils/dateUtils';
import styles from '../../styles/Progress.module.css';

const StudyTimeChart = ({
  chartData,
  rangeType,
  viewMode,
  onChangeViewMode,
}) => {
  const [hoveredItem, setHoveredItem] = useState(null);

  const { items = [], maxMinutes = 0, title, mostStudiedDay } = chartData;

  const chartHeight = 170;
  const chartWidth = 560;
  const paddingLeft = 35;
  const paddingBottom = 30;
  const usableWidth = chartWidth - paddingLeft - 15;
  const usableHeight = chartHeight - 20;

  const safeMax = Math.max(60, maxMinutes);

  // Determine if any study occurred
  const hasAnyStudy = items.some((item) => item.minutes > 0);

  return (
    <div className={styles.analyticsSectionCard}>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitleWrap}>
          <BarChart3 size={20} color="var(--btn-primary)" />
          <div>
            <h2 className={styles.sectionTitle}>{title}</h2>
            <span className={styles.sectionSubtext}>
              {hasAnyStudy
                ? 'Actual recorded focus duration'
                : 'No study sessions recorded for this period yet'}
            </span>
          </div>
        </div>

        {/* View Mode Toggle for Month / All */}
        {rangeType === 'month' && (
          <div className={styles.sectionControls}>
            <button
              type="button"
              className={`${styles.subRangeBtn} ${viewMode === 'day' ? styles.activeSubRange : ''}`}
              onClick={() => onChangeViewMode('day')}
            >
              By Day
            </button>
            <button
              type="button"
              className={`${styles.subRangeBtn} ${viewMode === 'week' ? styles.activeSubRange : ''}`}
              onClick={() => onChangeViewMode('week')}
            >
              By Week
            </button>
          </div>
        )}
      </div>

      {/* SVG Bar Chart */}
      <div className={styles.chartContainer}>
        {hoveredItem && (
          <div className={styles.chartTooltip}>
            <strong>{hoveredItem.fullDateLabel || hoveredItem.label}:</strong>
            <span>{hoveredItem.formattedDuration}</span>
            {hoveredItem.sessionsCount !== undefined && (
              <span style={{ color: 'var(--text-muted)' }}>
                ({hoveredItem.sessionsCount} session{hoveredItem.sessionsCount === 1 ? '' : 's'})
              </span>
            )}
          </div>
        )}

        <svg
          className={styles.chartSvg}
          viewBox={`0 0 ${chartWidth} ${chartHeight + paddingBottom}`}
          aria-label={title}
          role="img"
        >
          {/* Subtle horizontal grid lines */}
          {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
            const y = chartHeight - ratio * usableHeight;
            const gridVal = Math.round(ratio * safeMax);
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartWidth - 10}
                  y2={y}
                  className={styles.chartGridLine}
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fill="var(--text-muted)"
                  fontSize="9.5"
                  fontWeight="600"
                >
                  {formatDuration(gridVal)}
                </text>
              </g>
            );
          })}

          {/* Baseline */}
          <line
            x1={paddingLeft}
            y1={chartHeight}
            x2={chartWidth - 10}
            y2={chartHeight}
            stroke="var(--border-color)"
            strokeWidth="1.5"
          />

          {/* Bars */}
          {items.map((item, idx) => {
            const itemCount = items.length;
            const step = usableWidth / itemCount;
            const barWidth = Math.max(8, Math.min(38, step * 0.65));
            const x = paddingLeft + idx * step + (step - barWidth) / 2;

            const barHeight =
              item.minutes > 0 ? (item.minutes / safeMax) * usableHeight : 2;
            const y = chartHeight - barHeight;

            const isHovered = hoveredItem?.date === item.date;

            return (
              <g
                key={item.date || idx}
                onMouseEnter={() => setHoveredItem(item)}
                onMouseLeave={() => setHoveredItem(null)}
                tabIndex={0}
                role="graphics-symbol"
                aria-label={`${item.label}: ${item.formattedDuration}`}
                style={{ outline: 'none', cursor: 'pointer' }}
              >
                {/* Visual bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx={Math.min(4, barWidth / 2)}
                  ry={Math.min(4, barWidth / 2)}
                  className={`${styles.chartBar} ${
                    item.isHighest ? styles.highestBar : ''
                  } ${item.isToday ? styles.todayBar : ''}`}
                  style={{
                    opacity: hoveredItem && !isHovered ? 0.45 : 1,
                    fill: item.isHighest
                      ? 'var(--success)'
                      : item.minutes > 0
                      ? 'var(--btn-primary)'
                      : 'var(--border-color)',
                  }}
                />

                {/* X Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 18}
                  className={styles.chartAxisText}
                  style={{
                    fontWeight: item.isToday || isHovered ? 800 : 600,
                    fill:
                      item.isToday
                        ? 'var(--btn-primary)'
                        : isHovered
                        ? 'var(--text-primary)'
                        : 'var(--text-secondary)',
                  }}
                >
                  {item.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Most Studied Day Banner */}
        {mostStudiedDay && mostStudiedDay.minutes > 0 && (
          <div className={styles.highestDayBanner}>
            <Award size={16} color="var(--success)" />
            <span>
              Most focused period:{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {mostStudiedDay.fullDateLabel || mostStudiedDay.label}
              </strong>{' '}
              with{' '}
              <strong style={{ color: 'var(--text-primary)' }}>
                {mostStudiedDay.formattedDuration}
              </strong>{' '}
              recorded.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudyTimeChart;
