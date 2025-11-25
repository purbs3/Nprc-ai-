export const stripHtml = (html: string): string => {
    if (!html || typeof html !== 'string') return '';
    // Use the browser's built-in parser to safely strip HTML tags
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
};
