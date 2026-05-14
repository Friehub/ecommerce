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
 styles: 'bg-tertiary-container/10 text-tertiary border-tertiary-container/20',
 },
 EXPRESS: {
 label: 'Express',
 icon: Zap,
 styles: 'bg-jumia-orange/10 text-jumia-orange border-jumia-orange/20',
 },
 GLOBAL: {
 label: 'Jumia Global',
 icon: Globe,
 styles: 'bg-secondary-container/10 text-secondary border-secondary-container/20',
 },
 };

 const config = configs[type];
 const Icon = config.icon;

 const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[8px]' : 'px-3 py-1 text-[10px]';
 const iconSize = size === 'sm' ? 10 : 12;

 return (
 <div className={`inline-flex items-center gap-2 font-semibold uppercase  border-2 rounded-[10px] ${config.styles} ${sizeStyles} ${className} shadow-soft backdrop-blur-sm transition-all hover:scale-105 active:scale-95 cursor-default group`}>
 <Icon size={iconSize} className="group-hover:rotate-12 transition-transform" />
 <span className="italic">{config.label}</span>
 </div>
 );
};

