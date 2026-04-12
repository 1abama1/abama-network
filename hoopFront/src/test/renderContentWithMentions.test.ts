import { describe, it, expect } from 'vitest';
import { renderContentWithMentions } from '../utils/renderContentWithMentions';

describe('renderContentWithMentions', () => {
    it('splits text with mentions', () => {
        const result = renderContentWithMentions('Hello @john how are you?');
        expect(result).toEqual([
            { text: 'Hello ', isMention: false },
            { text: '@john', isMention: true },
            { text: ' how are you?', isMention: false },
        ]);
    });

    it('returns plain text without mentions', () => {
        const result = renderContentWithMentions('No mentions here');
        expect(result).toEqual([{ text: 'No mentions here', isMention: false }]);
    });

    it('handles multiple mentions', () => {
        const result = renderContentWithMentions('@alice @bob');
        expect(result).toEqual([
            { text: '@alice', isMention: true },
            { text: ' ', isMention: false },
            { text: '@bob', isMention: true },
        ]);
    });

    it('handles lone @ as non-mention', () => {
        const result = renderContentWithMentions('@');
        expect(result).toEqual([{ text: '@', isMention: false }]);
    });
});
