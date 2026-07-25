import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function adminApp() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );
  if (!projectId || !clientEmail || !privateKey) return null;
  return (
    getApps()[0] ??
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  );
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
