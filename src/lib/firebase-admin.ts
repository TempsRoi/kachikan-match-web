import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function adminApp() {
  try {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID?.trim();
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim();
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim()
      .replace(/^["']|["']$/g, "")
      .replace(/\\n/g, "\n");
    if (!projectId || !clientEmail || !privateKey) return null;
    return (
      getApps()[0] ??
      initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
    );
  } catch (error) {
    console.error("Firebase Admin initialization failed", error);
    return null;
  }
}

export function adminDb() {
  const app = adminApp();
  return app ? getFirestore(app) : null;
}

export async function authenticatedUid(request: Request) {
  const app = adminApp();
  const header = request.headers.get("authorization");
  if (!app || !header?.startsWith("Bearer ")) return null;
  try {
    return (await getAuth(app).verifyIdToken(header.slice(7))).uid;
  } catch {
    return null;
  }
}
