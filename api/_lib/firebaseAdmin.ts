import path from "path";
import fs from "fs";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let cachedAppConfig: any = null;
function getLazyFirebaseAppConfig(): any {
  if (cachedAppConfig !== null) return cachedAppConfig;
  const potentialPaths = [
    path.join(process.cwd(), "firebase-applet-config.json"),
    path.resolve(process.cwd(), "./firebase-applet-config.json"),
    path.resolve(process.cwd(), "../firebase-applet-config.json"),
    path.resolve(process.cwd(), "../../firebase-applet-config.json"),
  ];
  for (const p of potentialPaths) {
    try {
      if (fs.existsSync(p)) {
        cachedAppConfig = JSON.parse(fs.readFileSync(p, "utf-8"));
        return cachedAppConfig;
      }
    } catch (_) {}
  }
  cachedAppConfig = {
    projectId: "gen-lang-client-0490390966",
    firestoreDatabaseId: "ai-studio-remixifprachados-018515d5-45e1-4bef-91e8-bdd980f85e66",
  };
  return cachedAppConfig;
}

export function formatPrivateKey(rawKey: string | undefined): string | undefined {
  if (!rawKey) return undefined;
  let formatted = rawKey.trim();
  // Strip surrounding quotes
  if (
    (formatted.startsWith('"') && formatted.endsWith('"')) ||
    (formatted.startsWith("'") && formatted.endsWith("'"))
  ) {
    formatted = formatted.slice(1, -1);
  }
  // Replace escaped newlines and carriage returns with actual characters
  formatted = formatted.replace(/\\n/g, "\n").replace(/\\r/g, "\r");
  return formatted.trim();
}

export const FIREBASE_PROJECT_ID =
  (getLazyFirebaseAppConfig() as any)?.projectId ||
  process.env.FIREBASE_PROJECT_ID ||
  process.env.VITE_FIREBASE_PROJECT_ID ||
  "gen-lang-client-0490390966";

export const FIRESTORE_DATABASE_ID =
  (getLazyFirebaseAppConfig() as any)?.firestoreDatabaseId ||
  (process.env.FIRESTORE_DATABASE_ID && process.env.FIRESTORE_DATABASE_ID !== "default"
    ? process.env.FIRESTORE_DATABASE_ID
    : undefined) ||
  "ai-studio-remixifprachados-018515d5-45e1-4bef-91e8-bdd980f85e66";

let adminAppInstance: App | null = null;
let adminAuthInstance: Auth | null = null;
let adminFirestoreInstance: Firestore | null = null;

export function getFirebaseAdminApp(): App | null {
  if (adminAppInstance) return adminAppInstance;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminAppInstance = existingApps[0];
    return adminAppInstance;
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = formatPrivateKey(rawPrivateKey);
  const cfg = getLazyFirebaseAppConfig();
  const projectId = FIREBASE_PROJECT_ID || cfg?.projectId || "gen-lang-client-0490390966";

  try {
    if (clientEmail && privateKey) {
      try {
        adminAppInstance = initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
          projectId,
        });
        console.log(`[Firebase Admin] Inicializado com Service Account (${clientEmail}) para projeto: ${projectId}`);
      } catch (certErr: any) {
        console.warn(`[Firebase Admin Warning] Falha na credencial da Service Account:`, certErr?.message || certErr);
        adminAppInstance = initializeApp({
          projectId,
        });
        console.log(`[Firebase Admin] Inicializado com Project ID (${projectId}) em modo padrão após falha de certificado.`);
      }
    } else {
      adminAppInstance = initializeApp({
        projectId,
      });
      console.log(`[Firebase Admin] Inicializado com Project ID (${projectId}) em modo padrão.`);
    }
  } catch (err: any) {
    console.warn(`[Firebase Admin Notice] Inicialização em modo resiliente:`, err?.message || err);
    if (getApps().length > 0) {
      adminAppInstance = getApps()[0];
    }
  }

  return adminAppInstance;
}

export function getAdminAuth(): Auth | null {
  if (!adminAuthInstance) {
    const adminApp = getFirebaseAdminApp();
    if (adminApp) {
      try {
        adminAuthInstance = getAuth(adminApp);
      } catch (err: any) {
        console.warn("[Firebase Admin Auth Warning] Não foi possível carregar Auth Admin:", err?.message || err);
      }
    }
  }
  return adminAuthInstance;
}

export function getAdminFirestore(): Firestore | null {
  if (!adminFirestoreInstance) {
    const adminApp = getFirebaseAdminApp();
    if (adminApp) {
      try {
        adminFirestoreInstance = getFirestore(adminApp, FIRESTORE_DATABASE_ID);
      } catch {
        try {
          adminFirestoreInstance = getFirestore(adminApp);
        } catch (e2: any) {
          console.warn("[Firebase Admin Firestore Warning] Não foi possível carregar Firestore Admin:", e2?.message || e2);
        }
      }
    }
  }
  return adminFirestoreInstance;
}

