import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dashboard } from '../../components/Dashboard';

// Mock the features to avoid complex rendering
vi.mock('./features/CVStudio', () => ({ default: () => <div>CV Studio Component</div> }));
vi.mock('./features/InterviewLab', () => ({ default: () => <div>Interview Lab Component</div> }));

// Mock data
const MockIcon = () => <div data-testid="mock-icon" />;

const mockUser = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
    name: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
    avatarUrl: 'https://example.com/photo.jpg',
    emailVerified: true
};

const mockFeatures = [
    {
        id: 'cv-studio',
        title: 'CV Studio',
        description: 'Build your CV',
        icon: MockIcon,
        path: '/cv',
        status: 'active'
    },
    {
        id: 'interview-lab',
        title: 'Interview Simulation',
        description: 'Practice interviews',
        icon: MockIcon,
        path: '/interview',
        status: 'active'
    }
];

const mockCvData = {
    personal_info: {
        name: 'Test User',
        email: 'test@example.com',
    },
    targetRole: 'Developer',
    summary: 'Summary',
    experience: [],
    education: [],
    skills: [],
};

const mockOnNavigate = vi.fn();

describe('Dashboard Component', () => {
    it('renders the welcome message', () => {
        render(
            <Dashboard
                user={mockUser as any}
                features={mockFeatures}
                onNavigate={mockOnNavigate}
                cvData={mockCvData}
            />
        );
        expect(screen.getByText(/Ready to build your bridge/i)).toBeInTheDocument();
    });

    it('renders feature cards', () => {
        render(
            <Dashboard
                user={mockUser as any}
                features={mockFeatures}
                onNavigate={mockOnNavigate}
                cvData={mockCvData}
            />
        );
        expect(screen.getByText(/Your Toolkit/i)).toBeInTheDocument();

        // Use getAllByText in case there are multiple occurrences (e.g. in alt text or tooltips)
        const cvStudioElements = screen.getAllByText(/CV Studio/i);
        expect(cvStudioElements.length).toBeGreaterThan(0);

        const interviewSimulationElements = screen.getAllByText(/Interview Simulation/i);
        expect(interviewSimulationElements.length).toBeGreaterThan(0);
    });
});
