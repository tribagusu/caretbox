import { describe, it, expect, vi, beforeEach } from "vitest";
import { createItem, updateItem, deleteItem } from "./items";

const mockAuth = vi.fn();
const mockCreateItemQuery = vi.fn();
const mockUpdateItemQuery = vi.fn();
const mockDeleteItemQuery = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/db/items", () => ({
  createItem: (...args: unknown[]) => mockCreateItemQuery(...args),
  updateItem: (...args: unknown[]) => mockUpdateItemQuery(...args),
  deleteItem: (...args: unknown[]) => mockDeleteItemQuery(...args),
}));

const fakeItem = {
  id: "item-1",
  title: "Updated Title",
  description: null,
  content: "console.log('hello')",
  contentType: "text",
  url: null,
  language: "javascript",
  isFavorite: false,
  isPinned: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  type: { name: "Snippet", icon: "code", color: "#6366f1" },
  tags: [{ id: "tag-1", name: "react" }],
  collection: null,
};

describe("createItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await createItem({
      title: "Test",
      typeId: "type-1",
      tags: [],
    });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockCreateItemQuery).not.toHaveBeenCalled();
  });

  it("returns validation errors for empty title", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await createItem({
      title: "   ",
      typeId: "type-1",
      tags: [],
    });

    expect(result.success).toBe(false);
    if (!result.success && typeof result.error !== "string") {
      expect(result.error.title).toBeDefined();
    }
    expect(mockCreateItemQuery).not.toHaveBeenCalled();
  });

  it("returns validation errors for missing typeId", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await createItem({
      title: "Test",
      typeId: "",
      tags: [],
    });

    expect(result.success).toBe(false);
    if (!result.success && typeof result.error !== "string") {
      expect(result.error.typeId).toBeDefined();
    }
    expect(mockCreateItemQuery).not.toHaveBeenCalled();
  });

  it("returns validation errors for invalid URL", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await createItem({
      title: "Test",
      typeId: "type-1",
      url: "not-a-url",
      tags: [],
    });

    expect(result.success).toBe(false);
    if (!result.success && typeof result.error !== "string") {
      expect(result.error.url).toBeDefined();
    }
  });

  it("creates item on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockCreateItemQuery.mockResolvedValue(fakeItem);

    const result = await createItem({
      title: "New Snippet",
      description: "A snippet",
      content: "console.log('hello')",
      language: "javascript",
      typeId: "type-1",
      tags: ["react", "hooks"],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(fakeItem);
    }
    expect(mockCreateItemQuery).toHaveBeenCalledWith("user-1", {
      title: "New Snippet",
      description: "A snippet",
      content: "console.log('hello')",
      contentType: "text",
      fileUrl: null,
      fileName: null,
      fileSize: null,
      url: null,
      language: "javascript",
      typeId: "type-1",
      tags: ["react", "hooks"],
    });
  });

  it("creates file item with file fields", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockCreateItemQuery.mockResolvedValue(fakeItem);

    const result = await createItem({
      title: "My PDF",
      typeId: "type-file",
      contentType: "file",
      fileUrl: "uploads/user-1/123-doc.pdf",
      fileName: "doc.pdf",
      fileSize: 2048,
      tags: [],
    });

    expect(result.success).toBe(true);
    expect(mockCreateItemQuery).toHaveBeenCalledWith("user-1", {
      title: "My PDF",
      description: null,
      content: null,
      contentType: "file",
      fileUrl: "uploads/user-1/123-doc.pdf",
      fileName: "doc.pdf",
      fileSize: 2048,
      url: null,
      language: null,
      typeId: "type-file",
      tags: [],
    });
  });

  it("transforms empty URL to null", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockCreateItemQuery.mockResolvedValue(fakeItem);

    await createItem({
      title: "Link",
      typeId: "type-1",
      url: "",
      tags: [],
    });

    expect(mockCreateItemQuery).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ url: null })
    );
  });
});

describe("updateItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await updateItem("item-1", {
      title: "Test",
      tags: [],
    });

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockUpdateItemQuery).not.toHaveBeenCalled();
  });

  it("returns validation errors for empty title", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await updateItem("item-1", {
      title: "   ",
      tags: [],
    });

    expect(result.success).toBe(false);
    if (!result.success && typeof result.error !== "string") {
      expect(result.error.title).toBeDefined();
    }
    expect(mockUpdateItemQuery).not.toHaveBeenCalled();
  });

  it("returns validation errors for invalid URL", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });

    const result = await updateItem("item-1", {
      title: "Test",
      url: "not-a-url",
      tags: [],
    });

    expect(result.success).toBe(false);
    if (!result.success && typeof result.error !== "string") {
      expect(result.error.url).toBeDefined();
    }
  });

  it("allows empty string URL (transforms to null)", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUpdateItemQuery.mockResolvedValue(fakeItem);

    const result = await updateItem("item-1", {
      title: "Test",
      url: "",
      tags: [],
    });

    expect(result.success).toBe(true);
    expect(mockUpdateItemQuery).toHaveBeenCalledWith(
      "user-1",
      "item-1",
      expect.objectContaining({ url: null })
    );
  });

  it("returns not found when query returns null", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUpdateItemQuery.mockResolvedValue(null);

    const result = await updateItem("item-1", {
      title: "Test",
      tags: [],
    });

    expect(result).toEqual({ success: false, error: "Item not found" });
  });

  it("returns updated item on success", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUpdateItemQuery.mockResolvedValue(fakeItem);

    const result = await updateItem("item-1", {
      title: "Updated Title",
      description: "A description",
      content: "console.log('hello')",
      language: "javascript",
      tags: ["react", "hooks"],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(fakeItem);
    }
    expect(mockUpdateItemQuery).toHaveBeenCalledWith("user-1", "item-1", {
      title: "Updated Title",
      description: "A description",
      content: "console.log('hello')",
      url: null,
      language: "javascript",
      tags: ["react", "hooks"],
    });
  });

  it("trims title and description", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUpdateItemQuery.mockResolvedValue(fakeItem);

    await updateItem("item-1", {
      title: "  Trimmed Title  ",
      description: "  Trimmed Desc  ",
      tags: [],
    });

    expect(mockUpdateItemQuery).toHaveBeenCalledWith(
      "user-1",
      "item-1",
      expect.objectContaining({
        title: "Trimmed Title",
        description: "Trimmed Desc",
      })
    );
  });

  it("passes valid URL through", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockUpdateItemQuery.mockResolvedValue(fakeItem);

    await updateItem("item-1", {
      title: "Link",
      url: "https://example.com",
      tags: [],
    });

    expect(mockUpdateItemQuery).toHaveBeenCalledWith(
      "user-1",
      "item-1",
      expect.objectContaining({ url: "https://example.com" })
    );
  });
});

describe("deleteItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns unauthorized when no session", async () => {
    mockAuth.mockResolvedValue(null);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
    expect(mockDeleteItemQuery).not.toHaveBeenCalled();
  });

  it("returns not found when query returns false", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockDeleteItemQuery.mockResolvedValue(false);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: false, error: "Item not found" });
    expect(mockDeleteItemQuery).toHaveBeenCalledWith("user-1", "item-1");
  });

  it("returns success when item is deleted", async () => {
    mockAuth.mockResolvedValue({ user: { id: "user-1" } });
    mockDeleteItemQuery.mockResolvedValue(true);

    const result = await deleteItem("item-1");

    expect(result).toEqual({ success: true });
    expect(mockDeleteItemQuery).toHaveBeenCalledWith("user-1", "item-1");
  });
});
