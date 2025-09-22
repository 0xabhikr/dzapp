// app/api/admin/set-role/route.ts
import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminFirestore } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = authHeader.split("Bearer ")[1];
  const body = await req.json();
  const { targetUid, newRole } = body;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const requesterUid = decoded.uid;

    const requesterDoc = await adminFirestore.doc(`users/${requesterUid}`).get();
    if (requesterDoc.data()?.role !== "SUPERUSER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminFirestore.doc(`users/${targetUid}`).update({ role: newRole });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
