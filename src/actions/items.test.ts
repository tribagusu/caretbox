import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateItem, deleteItem } from "./items";

const mockAuth = vi.fn();
const mockUpdateItemQuery = vi.fn();
const mockDeleteItemQuery = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => mockAuth(),
}));

vi.mock("@/lib/db/items", () => ({
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
