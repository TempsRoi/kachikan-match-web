import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
export const firebaseEnabled = Boolean(config.apiKey && config.projectId);
export const app = firebaseEnabled
  ? getApps().length
    ? getApp()
    : initializeApp(config)
  : null;

export async function ensureAnonymousUser() {
  if (!app) return null;
  const auth = getAuth(app);
  return auth.currentUser ?? (await signInAnonymously(auth)).user;
}

export async function apiFetch(path: string, init?: RequestInit) {
  const user = await ensureAnonymousUser();
  if (!user) throw new Error("Firebaseが設定されていません");
  const token = await user.getIdToken();
  return fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
}

export async function apiJson<T = Record<string, unknown>>(
  path: string,
  init?: RequestInit,
) {
  const response = await apiFetch(path, init);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      response.status === 404
        ? "サーバーAPIがまだ公開されていません。Vercelを再デプロイしてください。"
        : "サーバーでエラーが発生しました。Vercelの環境変数とログを確認してください。",
    );
  }
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error || "通信に失敗しました");
  return data;
}
