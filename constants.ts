import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  Users,
  Settings,
  Zap,
  Target,
  TrendingUp,
  FileText,
  Headphones,
  Mic,
  PenTool,
  BrainCircuit,
  Radar,
  Info,
  List,
  Shield,
  Map,
  Languages,
  Vault,
  ShieldCheck,
  RefreshCcw,
  FileCheck,
  ScrollText
} from 'lucide-react';
import { Feature, NavItem } from './types';

export const APP_NAME = "The Bridge";

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  // { label: 'CV Audit', icon: ShieldCheck, path: '/cv-audit' }, // Removed per refactor
  { label: 'CV Builder', icon: PenTool, path: '/cv-builder' },
  { label: 'Opportunity Radar', icon: Radar, path: '/radar' },
  { label: 'Interview Simulation', icon: Mic, path: '/simulation' },
  { label: 'Re:Turn Hub', icon: RefreshCcw, path: '/return-hub' },
  { label: 'Terms & Conditions', icon: ScrollText, path: '/terms' },
  { label: 'About Platform', icon: Info, path: '/about' },
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
    description: 'Search the market for roles matching your CV. Tailored for professionals earning £25k-£70k seeking their next step up.',
    icon: Radar,
    status: 'active',
    actionLabel: 'Scan Market'
  },
  {
    id: 'return-hub',
    title: 'Re:Turn Hub',
    description: 'A sanctuary for returning to work. CV Audit, Flex Negotiation simulation, and 90-day tactical roadmap.',
    icon: RefreshCcw,
    status: 'active',
    actionLabel: 'Enter Sanctuary'
  }
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
