import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { validateFile, buildFileKey, uploadToR2 } from "@/lib/r2";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const isImage = formData.get("isImage") === "true";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const validation = validateFile(file.name, file.size, file.type, isImage);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const key = buildFileKey(session.user.id, file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await uploadToR2(key, buffer, file.type);
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({
    fileUrl: key,
    fileName: file.name,
    fileSize: file.size,
  });
}
