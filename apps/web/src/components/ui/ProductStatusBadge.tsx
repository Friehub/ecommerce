'use client';

import React from 'react';
import { CheckCircle2, Zap, Globe } from 'lucide-react';

interface ProductStatusBadgeProps {
  type: 'OFFICIAL' | 'EXPRESS' | 'GLOBAL';
  size?: 'sm' | 'md';
  className?: string;
}

export const ProductStatusBadge = ({ type, size = 'sm', className = '' }: ProductStatusBadgeProps) => {
  const configs = {
    OFFICIAL: {
      label: 'Official Store',
      icon: CheckCircle2,
      styles: 'bg-blue-50 text-blue-600 border-blue-100',
    },
    EXPRESS: {
      label: 'Express',
      icon: Zap,
      styles: 'bg-orange-50 text-[#f68b1e] border-orange-100',
    },
    GLOBAL: {
      label: 'Jumia Global',
      icon: Globe,
      styles: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  const sizeStyles = size === 'sm' ? 'px-1.5 py-0.5 text-[8px]' : 'px-2 py-1 text-[10px]';
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <div className={`inline-flex items-center gap-1 font-black uppercase tracking-widest border rounded ${config.styles} ${sizeStyles} ${className}`}>
      <Icon size={iconSize} />
      <span>{config.label}</span>
    </div>
  );
};
