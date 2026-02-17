import {
  LayoutDashboard,
  PenTool,
  Radar,
} from 'lucide-react';
import { Feature, NavItem } from './types';

export const APP_NAME = "The Bridge";

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'CV Builder', icon: PenTool, path: '/cv-builder' },
  { label: 'Opportunity Radar', icon: Radar, path: '/radar' },
];

export const INITIAL_FEATURES: Feature[] = [
  // {
  //   id: 'cv-audit',
  //   title: 'CV Audit',
  //   description: 'Upload and refine your existing CV. Grade confidence, tone, and keyword matching with AI-powered analysis.',
  //   icon: ShieldCheck,
  //   status: 'active',
  //   actionLabel: 'Audit Now'
  // },
  {
    id: 'cv-builder',
    title: 'CV Builder',
    description: 'Build a high-impact, skills-based CV from scratch. Input your skills and experience, and let AI craft your narrative.',
    icon: PenTool,
    status: 'active',
    actionLabel: 'Build CV'
  },
  {
    id: 'opportunity-radar',
    title: 'Opportunity Radar',
    description: 'Work in Progress — Search the market for roles matching your CV. Coming soon.',
    icon: Radar,
    status: 'coming_soon' as const,
    actionLabel: 'Coming Soon'
  },
];

export const MOCK_USER = {
  name: 'Alex',
  role: 'Professional',
  avatarUrl: 'https://picsum.photos/200/200'
};

// CV Templates
export const CV_TEMPLATES = [
  {
    id: 'oxford',
    name: 'Oxford Strict',
    description: 'Times-Roman, black & white. Finance, Law, Corporate.',
    preview: 'oxford'
  },
  {
    id: 'modern',
    name: 'Modern Impact',
    description: 'Helvetica, navy accent. Tech, Startup, Creative.',
    preview: 'modern'
  }
];
