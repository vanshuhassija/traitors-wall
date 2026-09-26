// Deterministic pseudo-random ordering so the tile shuffle stays stable across
// reloads/re-renders instead of jittering every time React re-renders the grid.
function hashToUnitFloats(id, count) {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  }
  const seed = Math.abs(h) || 1;
  const values = [];
  let x = seed;
  for (let i = 0; i < count; i++) {
    x = (Math.imul(x, 48271) + 1) % 2147483647;
    values.push(x / 2147483647);
  }
  return values;
}

export function getShuffleKey(id) {
  return hashToUnitFloats(id, 1)[0];
}

// Picks a cols x rows grid that tiles `count` images across the full
// viewport with as little wasted space and cell distortion as possible.
export function computeGrid(count, width, height) {
  if (count <= 0) return { cols: 1, rows: 1 };
  let best = null;
  for (let cols = 1; cols <= count; cols++) {
    const rows = Math.ceil(count / cols);
    const filled = cols * rows;
    const cellW = width / cols;
    const cellH = height / rows;
    const squareness = Math.abs(cellW - cellH) / Math.max(cellW, cellH);
    const emptyRatio = (filled - count) / filled;
    const score = squareness + emptyRatio * 2;
    if (!best || score < best.score) best = { cols, rows, score };
  }
  return { cols: best.cols, rows: best.rows };
}
