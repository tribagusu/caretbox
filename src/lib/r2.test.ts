import { describe, it, expect, vi, afterEach } from "vitest";
import { validateFile, buildFileKey } from "./r2";

describe("validateFile", () => {
  describe("images", () => {
    it("accepts valid image", () => {
      const result = validateFile("photo.png", 1024, "image/png", true);
      expect(result).toEqual({ valid: true });
    });

    it("accepts all image extensions", () => {
      const cases = [
        { name: "a.jpg", mime: "image/jpeg" },
        { name: "a.jpeg", mime: "image/jpeg" },
        { name: "a.gif", mime: "image/gif" },
        { name: "a.webp", mime: "image/webp" },
        { name: "a.svg", mime: "image/svg+xml" },
      ];
      for (const { name, mime } of cases) {
        expect(validateFile(name, 100, mime, true).valid).toBe(true);
      }
    });

    it("rejects invalid image extension", () => {
      const result = validateFile("doc.pdf", 1024, "application/pdf", true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain(".pdf");
    });

    it("rejects invalid image MIME type", () => {
      const result = validateFile("photo.png", 1024, "text/plain", true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("MIME type");
    });

    it("rejects image over 5 MB", () => {
      const size = 6 * 1024 * 1024;
      const result = validateFile("photo.png", size, "image/png", true);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("5 MB");
    });

    it("accepts image at exactly 5 MB", () => {
      const size = 5 * 1024 * 1024;
      const result = validateFile("photo.png", size, "image/png", true);
      expect(result).toEqual({ valid: true });
    });
  });

  describe("files", () => {
    it("accepts valid file", () => {
      const result = validateFile("doc.pdf", 1024, "application/pdf", false);
      expect(result).toEqual({ valid: true });
    });

    it("accepts all file extensions", () => {
      const cases = [
        { name: "a.txt", mime: "text/plain" },
        { name: "a.md", mime: "text/markdown" },
        { name: "a.json", mime: "application/json" },
        { name: "a.yaml", mime: "application/x-yaml" },
        { name: "a.yml", mime: "text/yaml" },
        { name: "a.xml", mime: "application/xml" },
        { name: "a.csv", mime: "text/csv" },
        { name: "a.toml", mime: "application/toml" },
        { name: "a.ini", mime: "text/plain" },
      ];
      for (const { name, mime } of cases) {
        expect(validateFile(name, 100, mime, false).valid).toBe(true);
      }
    });

    it("rejects invalid file extension", () => {
      const result = validateFile("app.exe", 1024, "application/octet-stream", false);
      expect(result.valid).toBe(false);
      expect(result.error).toContain(".exe");
    });

    it("rejects file over 10 MB", () => {
      const size = 11 * 1024 * 1024;
      const result = validateFile("doc.pdf", size, "application/pdf", false);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("10 MB");
    });

    it("handles case-insensitive extensions", () => {
      const result = validateFile("PHOTO.PNG", 1024, "image/png", true);
      expect(result).toEqual({ valid: true });
    });
  });
});

describe("buildFileKey", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns key with user ID and timestamp", () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);
    const key = buildFileKey("user-123", "photo.png");
    expect(key).toBe("uploads/user-123/1700000000000-photo.png");
  });

  it("sanitizes special characters in filename", () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);
    const key = buildFileKey("user-1", "my file (1).pdf");
    expect(key).toBe("uploads/user-1/1700000000000-my_file__1_.pdf");
  });

  it("preserves dots, hyphens, and underscores", () => {
    vi.spyOn(Date, "now").mockReturnValue(1700000000000);
    const key = buildFileKey("user-1", "my-file_v2.0.txt");
    expect(key).toBe("uploads/user-1/1700000000000-my-file_v2.0.txt");
  });
});
