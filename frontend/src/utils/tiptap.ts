import { type JSONContent } from "@tiptap/react";

export const getTextFromJSON = (node: JSONContent): string => {
  if (node.type === "text") {
    return node.text || "";
  }

  if (node.content && Array.isArray(node.content)) {
    return node.content.map(getTextFromJSON).join(" ");
  }

  return "";
};

export const countWordsFromTiptap = (
  content: JSONContent | undefined | null,
): number => {
  if (!content) return 0;

  const text = getTextFromJSON(content);

  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  return words.length;
};

export const getReadingTime = (
  content: JSONContent | undefined | null,
): number => {
  const words = countWordsFromTiptap(content);
  return Math.ceil(words / 200);
};
