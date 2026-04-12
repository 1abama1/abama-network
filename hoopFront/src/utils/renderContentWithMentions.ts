export function renderContentWithMentions(content: string): { text: string; isMention: boolean }[] {
    const parts = content.split(/(@\w+)/g);
    return parts.filter(Boolean).map((part) => ({
        text: part,
        isMention: part.startsWith('@') && part.length > 1,
    }));
}
