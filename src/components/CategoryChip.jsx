import { getCategoryColor } from '../utils/parseInput';

export default function CategoryChip({ category, onClick, size = 'sm' }) {
  if (!category) return null;
  const p = getCategoryColor(category);
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center font-medium rounded-full ${onClick ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}`}
      style={{
        background: p.bg,
        color: p.text,
        fontSize: size === 'xs' ? 11 : 12,
        padding: size === 'xs' ? '1px 8px' : '2px 10px',
      }}
    >
      #{category}
    </span>
  );
}
