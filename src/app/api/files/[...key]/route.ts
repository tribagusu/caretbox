import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFromR2 } from "@/lib/r2";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: segments } = await params;
  const key = segments.join("/");

  // Ensure the key belongs to the requesting user
  if (!key.startsWith(`uploads/${session.user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const response = await getFromR2(key);
    const stream = response.Body as ReadableStream;

    const contentType = response.ContentType ?? "application/octet-stream";
    const fileName = key.split("/").pop() ?? "download";
    // Strip timestamp prefix from filename for display
    const displayName = fileName.replace(/^\d+-/, "");

    const isImage = contentType.startsWith("image/");
    const disposition = isImage
      ? `inline; filename="${displayName}"`
      : `attachment; filename="${displayName}"`;

    return new Response(stream as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": disposition,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
