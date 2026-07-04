const stopWords = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "by",
  "for",
  "from",
  "has",
  "have",
  "in",
  "is",
  "near",
  "of",
  "on",
  "or",
  "road",
  "side",
  "street",
  "the",
  "there",
  "to",
  "with"
]);

const synonyms: Record<string, string> = {
  bin: "garbage",
  rubbish: "garbage",
  trash: "garbage",
  waste: "garbage",
  dump: "garbage",
  dumping: "garbage",
  dumped: "garbage",
  potholes: "pothole",
  broken: "damage",
  damaged: "damage",
  blockage: "blocked",
  clogged: "blocked",
  overflow: "flood",
  overflowing: "flood"
};

function tokenize(text: string | null | undefined) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .map((word) => synonyms[word] || word)
    .filter((word) => word.length >= 3 && !stopWords.has(word));
}

function uniqueTokens(text: string | null | undefined) {
  return new Set(tokenize(text));
}

export function textSimilarity(left: string | null | undefined, right: string | null | undefined) {
  const leftTokens = uniqueTokens(left);
  const rightTokens = uniqueTokens(right);
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0;

  let overlap = 0;
  for (const token of leftTokens) {
    if (rightTokens.has(token)) overlap += 1;
  }

  const union = new Set([...leftTokens, ...rightTokens]).size;
  const containment = overlap / Math.min(leftTokens.size, rightTokens.size);
  const jaccard = overlap / union;
  return Math.max(jaccard, containment * 0.85);
}

export function isTextClusterMatch(left: string | null | undefined, right: string | null | undefined) {
  const leftText = (left || "").trim().toLowerCase();
  const rightText = (right || "").trim().toLowerCase();
  if (!leftText || !rightText) return false;
  if (leftText.includes(rightText) || rightText.includes(leftText)) return true;
  return textSimilarity(leftText, rightText) >= 0.25;
}

export function clusterText(description: string | null | undefined, fallback: string | null | undefined) {
  return (description && description.trim()) || (fallback && fallback.trim()) || null;
}
