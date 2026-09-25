// 讀取卡片的 icon，交給 renderHistorySvg 內嵌。
// SVG 直接回傳原始碼；PNG 則包成一個內含 base64 圖片的小 SVG，內嵌流程不必分兩套。
// 為什麼要支援 PNG：卡片以 <img> 呈現時，Safari 會用低解析度計算 SVG 濾鏡，
// 帶陰影、光暈的 icon 在 iPhone 上會糊掉；點陣圖沒有這個問題。
// 卡片不能外連圖檔，所以只能用 data URI 放進 SVG 裡。
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export async function loadIconMarkup(root, path) {
  if (!path) return '';
  const file = join(root, path);
  if (!/\.png$/i.test(path)) return readFile(file, 'utf8');

  const png = await readFile(file);
  // IHDR 固定在第 16 個位元組起：寬、高各 4 個位元組（big-endian）
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  const href = `data:image/png;base64,${png.toString('base64')}`;
  return `<svg viewBox="0 0 ${width} ${height}"><image width="${width}" height="${height}" href="${href}"/></svg>`;
}
