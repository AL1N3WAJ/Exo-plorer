import React from 'react';
import type { PaginationInfo } from '../types';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (p: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ pagination, onPageChange }) => {
  const { page, totalPages, total, limit } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between mt-6 py-3 border-t border-slate-700/40">
      <span className="text-xs font-mono text-slate-500">
        {start}–{end} of {total.toLocaleString()} planets
      </span>
      <div className="flex gap-2">
        <PageBtn onClick={() => onPageChange(page - 1)} disabled={page <= 1} label="← Prev" />
        <span className="text-xs font-mono text-slate-400 px-2 py-1.5">
          {page} / {totalPages}
        </span>
        <PageBtn onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} label="Next →" />
      </div>
    </div>
  );
};

const PageBtn: React.FC<{ onClick: () => void; disabled: boolean; label: string }> = ({ onClick, disabled, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-emerald-600/60 hover:text-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
  >
    {label}
  </button>
);
