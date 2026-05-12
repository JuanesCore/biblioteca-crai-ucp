/**
 * Removes API highlight markup (e.g. <mark>...</mark>) and other HTML tags
 * without using dangerouslySetInnerHTML.
 */
export function cleanDisplayText(text) {
  if (typeof text !== "string") return "";
  return text
    .replace(/<\/?mark>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
