import { describe, it, expect } from "vite-plus/test";
import { validateContactForm } from "./validation";

describe("validateContactForm", () => {
  const validInput = {
    name: "山田 太郎",
    email: "taro@example.com",
    subject: "サービスについてのお問い合わせ",
    body: "記事の投稿手順について質問があります。",
  };

  it("returns isValid: true for valid input", () => {
    const result = validateContactForm(validInput);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("rejects empty or whitespace-only fields", () => {
    expect(validateContactForm({ ...validInput, name: "" }).isValid).toBe(false);
    expect(validateContactForm({ ...validInput, name: "   " }).isValid).toBe(false);
    expect(validateContactForm({ ...validInput, email: "" }).isValid).toBe(false);
    expect(validateContactForm({ ...validInput, subject: "" }).isValid).toBe(false);
    expect(validateContactForm({ ...validInput, body: "" }).isValid).toBe(false);
  });

  it("rejects invalid email formats", () => {
    expect(validateContactForm({ ...validInput, email: "invalid-email" }).isValid).toBe(false);
    expect(validateContactForm({ ...validInput, email: "@no-user.com" }).isValid).toBe(false);
    expect(validateContactForm({ ...validInput, email: "no-domain@" }).isValid).toBe(false);
    expect(validateContactForm({ ...validInput, email: "spaces in@email.com" }).isValid).toBe(
      false,
    );
  });

  it("rejects fields exceeding character length limits", () => {
    // name > 100
    expect(validateContactForm({ ...validInput, name: "a".repeat(101) }).isValid).toBe(false);
    // subject > 200
    expect(validateContactForm({ ...validInput, subject: "a".repeat(201) }).isValid).toBe(false);
    // body > 5000
    expect(validateContactForm({ ...validInput, body: "a".repeat(5001) }).isValid).toBe(false);
  });

  it("rejects CRLF header injection vectors in name, email, and subject", () => {
    expect(
      validateContactForm({ ...validInput, email: "victim@example.com\r\nBcc: evil@attacker.com" })
        .isValid,
    ).toBe(false);
    expect(validateContactForm({ ...validInput, name: "Taro\nYamada" }).isValid).toBe(false);
    expect(validateContactForm({ ...validInput, subject: "Test\r\nSubject" }).isValid).toBe(false);
  });
});
