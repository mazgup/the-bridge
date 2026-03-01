import { describe, it, expect, vi, beforeEach } from 'vitest';
import { streamCVConversation, ChatMessage } from './geminiService';
import { INITIAL_CV_DATA } from '../components/cv/CVTypes';

// Mock the environment variables needed by the service
vi.mock('import.meta.env', () => ({
    VITE_FIREBASE_PROJECT_ID: 'test-project',
    DEV: false,
}));

// Provide a global TextDecoder mock if not in environment
if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = class {
        decode(arr: Uint8Array) {
            return Buffer.from(arr).toString('utf-8');
        }
    } as any;
}

describe('geminiService - streamCVConversation', () => {
    const mockHistory: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
    ];
    const mockCV = INITIAL_CV_DATA;
    const mockLatestUserMessage = 'I want to be an Admin';

    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('should make an HTTP POST fetch request to the Cloud Function URL', async () => {
        // Mock global fetch
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            body: {
                getReader: () => ({
                    read: vi.fn().mockResolvedValue({ value: undefined, done: true }),
                }),
            },
        });
        global.fetch = fetchMock;

        await streamCVConversation(mockHistory, mockCV, mockLatestUserMessage);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [url, options] = fetchMock.mock.calls[0];

        expect(url).toBe('https://us-central1-test-project.cloudfunctions.net/streamCVConversation');
        expect(options.method).toBe('POST');
        expect(options.headers['Content-Type']).toBe('application/json');

        // Check Payload
        const parsedBody = JSON.parse(options.body);
        expect(parsedBody.history).toEqual(mockHistory);
        expect(parsedBody.currentCV).toEqual(mockCV);
        expect(parsedBody.latestUserMessage).toBe(mockLatestUserMessage);
    });

    it('should handle HTTP backend errors gracefully', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500,
            json: vi.fn().mockResolvedValue({ error: 'Internal Server Error Mock' }),
        });

        const result = await streamCVConversation(mockHistory, mockCV, mockLatestUserMessage);
        expect(result.message).toContain('Internal Server Error Mock');
    });

    it('should correctly parse Server-Sent Events (SSE) data chunks', async () => {
        // We mock a readable stream that yields multiple SSE chunks

        // Mock returning UTF-8 arrays representing the streamed text
        const encoder = new TextEncoder();

        // Chunk 1: regular text
        const chunk1 = encoder.encode('data: {"text": "I can help with that. "}\n\n');

        // Chunk 2: JSON CV Update block
        const cvUpdatePayload = "```json_cv_update\n{\n  \"meta\": {\"template\":\"modern\",\"target_pages\":1,\"archetype\":\"Bridge Builder\"},\n  \"content\": {\"experience\":[\"Admin job\"]}\n}\n```";
        const chunk2 = encoder.encode(`data: ${JSON.stringify({ text: cvUpdatePayload })}\n\n`);

        // Chunk 3: DONE signal
        const chunk3 = encoder.encode('data: [DONE]\n\n');

        let readCount = 0;
        const mockReader = {
            read: vi.fn().mockImplementation(() => {
                readCount++;
                if (readCount === 1) return Promise.resolve({ value: chunk1, done: false });
                if (readCount === 2) return Promise.resolve({ value: chunk2, done: false });
                if (readCount === 3) return Promise.resolve({ value: chunk3, done: false });
                return Promise.resolve({ value: undefined, done: true });
            })
        };

        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            body: { getReader: () => mockReader },
        });

        const onChunkMock = vi.fn();

        const result = await streamCVConversation(mockHistory, mockCV, mockLatestUserMessage, onChunkMock);

        // Assert that the callback was fired iteratively
        expect(onChunkMock).toHaveBeenCalled();

        // The final result should have the cleaned message
        expect(result.message).toBe('I can help with that.');

        // Ensure the CV Update was correctly parsed out of the stream into the CVData structure
        expect(result.cvUpdate).toBeDefined();
        expect(result.cvUpdate?.meta?.archetype).toBe('Bridge Builder');
        expect(result.cvUpdate?.experience).toEqual(['Admin job']);
    });
});
