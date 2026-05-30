import { afterEach, describe, expect, it, vi } from "vitest";
import { loadBundledQuestionBankFromJson } from "./questionBankService";

describe("loadBundledQuestionBankFromJson", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("loads and validates bundled json successfully", async () => {
    const payload = JSON.stringify({
      version: "2026.05.30",
      updatedAt: "2026-05-30T00:00:00.000Z",
      questions: [
        {
          id: "Q9001",
          domain: "D1",
          type: "multiple-choice",
          difficulty: "easy",
          subtopic: "Test",
          stem: "What should you do?",
          options: [
            { id: "A", text: "A", rationale: "A" },
            { id: "B", text: "B", rationale: "B" },
          ],
          correctOptionId: "A",
          explanation: "A",
        },
      ],
      caseStudies: [],
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(payload),
      }),
    );

    const result = await loadBundledQuestionBankFromJson();
    expect(result.errorMessage).toBeNull();
    expect(result.bank).not.toBeNull();
    expect(result.bank?.questions).toHaveLength(1);
    expect(result.report.isValid).toBe(true);
  });

  it("returns error when bundled json is invalid text", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue("{invalid json"),
      }),
    );

    const result = await loadBundledQuestionBankFromJson();
    expect(result.bank).toBeNull();
    expect(result.errorMessage).toContain("failed validation");
    expect(result.report.isValid).toBe(false);
    expect(result.report.errors[0]).toContain("Invalid JSON input");
  });

  it("returns validation errors for structurally invalid bank", async () => {
    const payload = JSON.stringify({
      version: "2026.05.30",
      updatedAt: "2026-05-30T00:00:00.000Z",
      questions: [
        {
          id: "Q9002",
          domain: "D1",
          type: "multiple-choice",
          difficulty: "easy",
          subtopic: "Broken",
          stem: "Broken question",
          options: [{ id: "A", text: "A", rationale: "A" }],
          correctOptionId: "A",
          explanation: "A",
        },
      ],
      caseStudies: [],
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: vi.fn().mockResolvedValue(payload),
      }),
    );

    const result = await loadBundledQuestionBankFromJson();
    expect(result.bank).toBeNull();
    expect(result.errorMessage).toContain("failed validation");
    expect(result.report.isValid).toBe(false);
    expect(result.report.errors.some((e) => e.includes("requires at least 2 options"))).toBe(true);
  });

  it("handles non-200 responses gracefully", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }),
    );

    const result = await loadBundledQuestionBankFromJson();
    expect(result.bank).toBeNull();
    expect(result.errorMessage).toContain("HTTP 404");
  });

  it("handles fetch exceptions gracefully", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const result = await loadBundledQuestionBankFromJson();
    expect(result.bank).toBeNull();
    expect(result.errorMessage).toContain("Bundled bank load failed");
  });
});
