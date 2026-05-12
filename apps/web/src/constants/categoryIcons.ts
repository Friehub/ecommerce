import { 
  Smartphone, 
  Home, 
  ChefHat, 
  Laptop, 
  Baby, 
  Dumbbell, 
  Gamepad2, 
  HeartPulse, 
  Shirt,
  MoreHorizontal
} from 'lucide-react';
import React from 'react';

export const categoryIcons: Record<string, React.ComponentType<any>> = {
  'Phones & Tablets': Smartphone,
  'Home & Office': Home,
  'Appliances': ChefHat,
  'Computing': Laptop,
  'Baby Products': Baby,
  'Sporting Goods': Dumbbell,
  'Gaming': Gamepad2,
  'Health & Beauty': HeartPulse,
  'Fashion': Shirt,
};

export const DefaultCategoryIcon = MoreHorizontal;
