// Simple fuzzy search implementation
export function fuzzySearch<T>(
  items: T[],
  query: string,
  getSearchText: (item: T) => string
): T[] {
  if (!query) return items;

  const queryLower = query.toLowerCase();
  
  return items
    .map((item) => {
      const text = getSearchText(item).toLowerCase();
      let score = 0;
      let queryIndex = 0;

      for (let i = 0; i < text.length && queryIndex < queryLower.length; i++) {
        if (text[i] === queryLower[queryIndex]) {
          score += 1;
          queryIndex += 1;
        }
      }

      // Only include items where all query characters were found
      if (queryIndex === queryLower.length) {
        // Bonus for consecutive matches
        if (text.includes(queryLower)) {
          score += queryLower.length * 2;
        }
        // Bonus for starting with query
        if (text.startsWith(queryLower)) {
          score += queryLower.length * 3;
        }
        return { item, score };
      }

      return null;
    })
    .filter((result) => result !== null)
    .sort((a, b) => (b?.score ?? 0) - (a?.score ?? 0))
    .map((result) => result!.item);
}
