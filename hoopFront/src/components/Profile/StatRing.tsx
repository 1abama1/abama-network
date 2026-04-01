import { motion } from 'framer-motion';
import './Profile.css';

interface StatRingProps {
  label: string;
  value: number | string;
  unit?: string;
  percent: number;
  color?: string;
}

const StatRing = ({ label, value, unit, percent, color = 'var(--primary)' }: StatRingProps) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="stat-ring-container">
      <div className="ring-wrapper">
        <svg width="80" height="80" viewBox="0 0 100 100">
          <circle
            className="ring-bg"
            cx="50" cy="50" r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="8"
          />
          <motion.circle
            className="ring-progress"
            cx="50" cy="50" r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 5px ${color})` }}
          />
        </svg>
        <div className="ring-value">
          <span className="number">{value}</span>
          {unit && <span className="unit">{unit}</span>}
        </div>
      </div>
      <span className="stat-label">{label}</span>
    </div>
  );
};

export default StatRing;
