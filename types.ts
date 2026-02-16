import { LucideIcon } from 'lucide-react';

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  status: 'active' | 'coming_soon' | 'locked';
  actionLabel?: string;
}

export interface User {
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
  active?: boolean;
}