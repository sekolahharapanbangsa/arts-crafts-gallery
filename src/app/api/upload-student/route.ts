import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "");
    const filename = `${Date.now()}-${safeName}`;

    // Upload ke Vercel Blob
    const blob = await put(`students/${filename}`, file, {
      access: "public",
      token: process.env.VERCEL_BLOB_READ_WRITE_TOKEN,
    });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("Error uploading student photo:", error);
    return NextResponse.json(
      { error: "Failed to upload student photo" },
      { status: 500 }
    );
  }
}
