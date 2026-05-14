export default function trimText(text: string, maxLength: number): string {
    if (text.length <= maxLength - 3) return text
    return text.slice(0, maxLength) + '...'
}