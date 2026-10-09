/**
 * ひらがなをカタカナに変換する
 */
export function hiraganaToKatakana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, (match) => {
    const chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}

/**
 * 日本語検索用の文字列正規化処理
 * - NFKC 正規化（全角英数・記号の半角化、半角カナの全角化等）
 * - ひらがなをカタカナに統一
 * - 英字を小文字に統一
 */
export function normalizeForSearch(str: string): string {
  if (!str) return "";
  const nfkc = str.normalize("NFKC");
  const katakana = hiraganaToKatakana(nfkc);
  return katakana.toLowerCase().trim();
}

/**
 * 検索キーワード文字列を正規化された単語リストに分割
 */
export function parseSearchKeywords(query: string): string[] {
  return normalizeForSearch(query)
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/**
 * 対象テキスト（複数可）に対して、検索キーワードがすべて含まれるか（AND検索）を判定
 */
export function matchKeywords(
  targets: (string | undefined | null)[],
  queryKeywords: string[],
): boolean {
  if (queryKeywords.length === 0) return true;

  const normalizedTargets = targets
    .filter((t): t is string => typeof t === "string" && t.length > 0)
    .map((t) => normalizeForSearch(t));

  return queryKeywords.every((kw) => normalizedTargets.some((target) => target.includes(kw)));
}
