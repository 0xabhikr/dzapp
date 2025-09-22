import { NextRequest, NextResponse } from "next/server";
import { adminFirestore } from "@/lib/firebase-admin";

const ALLOWED_ROLES = ["USER", "ADMIN", "SUPERUSER", "MODDEV"] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { requesterUid, targetUid, newRole } = body;

    if (!requesterUid || !targetUid || !newRole) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (!ALLOWED_ROLES.includes(newRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Get requester doc from Firestore
    const requesterDoc = await adminFirestore.doc(`users/${requesterUid}`).get();
    if (!requesterDoc.exists) {
      return NextResponse.json({ error: "Requester not found" }, { status: 403 });
    }

    const requesterRole = requesterDoc.data()?.role;
    if (requesterRole !== "SUPERUSER") {
      return NextResponse.json({ error: "Forbidden: Only SUPERUSER can change roles" }, { status: 403 });
    }

    if (requesterUid === targetUid) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 403 });
    }

    // Update target user role
    await adminFirestore.doc(`users/${targetUid}`).update({ role: newRole });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
