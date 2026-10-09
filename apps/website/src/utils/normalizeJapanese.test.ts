import { describe, it, expect } from "vite-plus/test";
import {
  normalizeForSearch,
  hiraganaToKatakana,
  parseSearchKeywords,
  matchKeywords,
} from "./normalizeJapanese";

describe("normalizeJapanese", () => {
  it("converts hiragana to katakana", () => {
    expect(hiraganaToKatakana("ぷろぐらみんぐ")).toBe("プログラミング");
    expect(hiraganaToKatakana("あいまい")).toBe("アイマイ");
  });

  it("normalizes full-width and half-width characters", () => {
    // 全角英数 -> 半角小文字
    expect(normalizeForSearch("Ｒｅａｃｔ")).toBe("react");
    // ひらがな -> カタカナ
    expect(normalizeForSearch("りあくと")).toBe("リアクト");
  });

  it("splits multiple keywords by whitespace", () => {
    expect(parseSearchKeywords("TypeScript  開発 チュートリアル")).toEqual([
      "typescript",
      "開発",
      "チュートリアル",
    ]);
  });

  it("matches hiragana queries against katakana article content", () => {
    const targets = ["プログラミング初心者向けチュートリアル", "TypeScriptとReact"];
    const keywords = parseSearchKeywords("ぷろぐらみんぐ");
    expect(matchKeywords(targets, keywords)).toBe(true);
  });

  it("matches katakana queries against hiragana content", () => {
    const targets = ["はじめてのぷろぐらみんぐ", "解説記事"];
    const keywords = parseSearchKeywords("プログラミング");
    expect(matchKeywords(targets, keywords)).toBe(true);
  });

  it("supports multiple AND keywords with mixed case and alphabet width", () => {
    const targets = ["実践！TypeScript入門", "フロントエンド Web開発"];
    const keywords = parseSearchKeywords("ｔｙｐｅｓｃｒｉｐｔ 入門");
    expect(matchKeywords(targets, keywords)).toBe(true);
  });
});
