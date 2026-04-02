/**
 * Simple textbook search — finds relevant chunks based on keyword matching
 */
export function searchTextbook(query, chunks, topN = 3) {
  if (!query || !chunks || chunks.length === 0) return [];

  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  if (queryWords.length === 0) return chunks.slice(0, topN);

  // Score each chunk by how many query words it contains
  const scored = chunks.map(chunk => {
    const text = `${chunk.title} ${chunk.content}`.toLowerCase();
    let score = 0;

    for (const word of queryWords) {
      // Count occurrences of each query word
      const regex = new RegExp(word, 'gi');
      const matches = text.match(regex);
      if (matches) score += matches.length;
    }

    // Boost exact phrase matches
    if (text.includes(query.toLowerCase())) {
      score += 10;
    }

    // Boost title matches
    if (chunk.title.toLowerCase().includes(query.toLowerCase())) {
      score += 5;
    }

    return { ...chunk, score };
  });

  // Sort by score descending, return top N
  return scored
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
