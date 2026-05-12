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
      styles: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    EXPRESS: {
      label: 'Express',
      icon: Zap,
      styles: 'bg-primary-container/10 text-primary-container border-primary-container/20',
    },
    GLOBAL: {
      label: 'Jumia Global',
      icon: Globe,
      styles: 'bg-tertiary-container/10 text-tertiary border-tertiary-container/20',
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[8px]' : 'px-3 py-1 text-[10px]';
  const iconSize = size === 'sm' ? 10 : 12;

  return (
    <div className={`inline-flex items-center gap-1.5 font-black uppercase tracking-widest border rounded-lg ${config.styles} ${sizeStyles} ${className} shadow-sm`}>
      <Icon size={iconSize} />
      <span>{config.label}</span>
    </div>
  );
};

