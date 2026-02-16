import { describe, it, expect, vi } from 'vitest';
import { streamCVConversation } from '../../services/geminiService';
import { INITIAL_CV_PROFILE, INITIAL_CV_DATA } from '../../components/cv/CVTypes';

// Define the mock using vi.hoisted to ensure it's available for the factory
const { mockStreamCVConversation } = vi.hoisted(() => {
    return { mockStreamCVConversation: vi.fn() };
});

vi.mock('../../services/geminiService', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../services/geminiService')>();
    return {
        ...actual,
        streamCVConversation: mockStreamCVConversation
    };
});

describe('CV Architect Integration', () => {

    it('should update CV state based on conversational input', async () => {
        const history: any[] = [];
        const currentData = INITIAL_CV_DATA;
        const input = "My name is Test User";

        // Setup mock implementation for this test
        mockStreamCVConversation.mockResolvedValueOnce({
            message: "Nice to meet you, Test User.",
            cvUpdate: {
                content: {
                    personal: { name: "Test User", contact: [], links: [] }
                }
            }
        });

        const result = await streamCVConversation(history, currentData, input);

        expect(result.cvUpdate?.content?.personal?.name).toBe("Test User");
        expect(result.message).toBe("Nice to meet you, Test User.");
    });

    it('should initialize with empty profile (backward compat)', () => {
        expect(INITIAL_CV_PROFILE.experience).toHaveLength(0);
        expect(INITIAL_CV_PROFILE.personal_info.name).toBe("");
    });

    it('should initialize with empty CVData', () => {
        expect(INITIAL_CV_DATA.content.experience).toHaveLength(0);
        expect(INITIAL_CV_DATA.content.personal.name).toBe("");
        expect(INITIAL_CV_DATA.meta.template).toBe("oxford");
    });
});
