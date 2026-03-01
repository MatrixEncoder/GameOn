const PROFANITY_LIST = [
    'fuck', 'shit', 'ass', 'damn', 'bitch', 'bastard', 'dick', 'cunt',
    'piss', 'cock', 'twat', 'wanker', 'slut', 'whore',
];

const PROFANITY_REGEX = new RegExp(
    `\\b(${PROFANITY_LIST.join('|')})\\b`,
    'gi'
);

export function containsProfanity(text: string): boolean {
    return PROFANITY_REGEX.test(text);
}

export function filterProfanity(text: string): string {
    return text.replace(PROFANITY_REGEX, (match) => '*'.repeat(match.length));
}
