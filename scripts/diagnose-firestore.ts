/**
 * Comprehensive Firestore & Firebase Environment Diagnostic Tool
 * Strictly read-only operations to verify live connection, configuration alignment,
 * Admin SDK, and security rules response across collections.
 */

import fs from "fs";
import path from "path";
import { initializeApp, getApps, deleteApp } from "firebase/app";
import {
  initializeFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  limit,
  terminate,
} from "firebase/firestore";
import { getAdminDiagnostics, getAdminFirestore, getAdminAuth } from "../api/_lib/firebaseAdmin";

async function runDiagnostic() {
  console.log("================================================================================");
  console.log("🔍 DIAGNÓSTICO DO AMBIENTE FIREBASE / FIRESTORE - LOCALIZA+ (IFPR CAMPUS IVAIPORÃ)");
  console.log("================================================================================");

  // 1. Audit configuration sources
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (!fs.existsSync(configPath)) {
    console.error("❌ [CONFIGURAÇÃO INVÁLIDA] firebase-applet-config.json não encontrado no workspace!");
    process.exit(1);
  }

  const appletConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  const adminDiag = getAdminDiagnostics();

  console.log("\n[1] AUDITORIA DE CONFIGURAÇÃO (FRONTEND VS BACKEND):");
  console.log("--------------------------------------------------------------------------------");
  console.log(`| Campo                  | Frontend / Applet Config               | Backend Admin SDK                      | Status      |`);
  console.log("--------------------------------------------------------------------------------");
  
  const fields = [
    { name: "Project ID", front: appletConfig.projectId, back: adminDiag.projectId },
    { name: "App ID", front: appletConfig.appId, back: "N/A (Backend Service Account)" },
    { name: "Auth Domain", front: appletConfig.authDomain, back: `${adminDiag.projectId}.firebaseapp.com` },
    { name: "Firestore Database ID", front: appletConfig.firestoreDatabaseId, back: adminDiag.firestoreDatabaseId },
    { name: "Storage Bucket", front: appletConfig.storageBucket, back: `${adminDiag.projectId}.firebasestorage.app` },
  ];

  for (const f of fields) {
    const isMatch = f.name === "App ID" ? true : f.front === f.back;
    const matchStatus = isMatch ? "✅ ALINHADO" : "⚠️ DIVERGENTE";
    console.log(`| ${f.name.padEnd(22)} | ${String(f.front).padEnd(38)} | ${String(f.back).padEnd(38)} | ${matchStatus} |`);
  }
  console.log("--------------------------------------------------------------------------------");

  // 2. Admin SDK Initialisation Check
  console.log("\n[2] STATUS DE INICIALIZAÇÃO DO FIREBASE ADMIN SDK:");
  console.log(`- Admin App Inicializado      : ${adminDiag.adminAppInitialized ? "SIM ✅" : "NÃO ❌"}`);
  console.log(`- Admin Auth Inicializado     : ${adminDiag.adminAuthInitialized ? "SIM ✅" : "NÃO ❌"}`);
  console.log(`- Firestore Admin Inicializado: ${adminDiag.adminFirestoreInitialized ? "SIM ✅" : "NÃO ❌"}`);
  if (adminDiag.adminFirestoreError) {
    console.error(`- Erro no Firestore Admin      : ${adminDiag.adminFirestoreError} ❌`);
  } else {
    console.log(`- Fallback Silencioso         : DESATIVADO (Conexão estrita a '${adminDiag.firestoreDatabaseId}') ✅`);
  }

  // 3. Test Real Read Operation via Admin SDK (Privileged read)
  console.log("\n[3] OPERAÇÃO REAL DE LEITURA VIA BACKEND (ADMIN SDK):");
  const adminDb = getAdminFirestore();
  if (!adminDb) {
    console.error("❌ [CONFIGURAÇÃO INVÁLIDA] Admin Firestore não pôde ser instanciado.");
  } else {
    try {
      const sysDoc = await adminDb.collection("system").doc("config").get();
      if (sysDoc.exists) {
        console.log(`✅ [CONFIGURAÇÃO OK] Leitura Admin em /system/config bem-sucedida!`);
        console.log(`   Conteúdo: maintenanceMode = ${sysDoc.data()?.maintenanceMode}`);
      } else {
        console.log(`ℹ️ [CONFIGURAÇÃO OK] Conexão Admin ativa; documento /system/config não existia (retornou vazio).`);
      }
    } catch (adminErr: any) {
      if (adminErr?.code === 7 || adminErr?.message?.includes("PERMISSION_DENIED")) {
        console.error(`❌ [FIRESTORE PERMISSION DENIED] Admin SDK recebeu permission denied:`, adminErr.message);
      } else if (adminErr?.code === 14 || adminErr?.message?.includes("UNAVAILABLE")) {
        console.error(`⚠️ [FIRESTORE UNAVAILABLE] Serviço Firestore indisponível:`, adminErr.message);
      } else {
        console.error(`❌ [FALHA NO FIRESTORE ADMIN]:`, adminErr.message || adminErr);
      }
    }
  }

  // 4. Test Real Read Operations via Client SDK (Unauthenticated Visitor Perspective)
  console.log("\n[4] OPERAÇÕES REAIS DE LEITURA VIA CLIENT SDK (REGRAS DE SEGURANÇA):");
  const clientApp = initializeApp(appletConfig, "diagnostic-client-app");
  const clientDb = initializeFirestore(clientApp, {}, appletConfig.firestoreDatabaseId);

  // 4.1 Test /items (Public catalog - should succeed without auth)
  console.log("\n--- Testando Leitura em /items (Catálogo Público) ---");
  try {
    const qItems = query(collection(clientDb, "items"), limit(1));
    const itemsSnap = await getDocs(qItems);
    console.log(`✅ [CONFIGURAÇÃO OK] Leitura pública em /items autorizada pelas regras!`);
    console.log(`   Documentos encontrados: ${itemsSnap.size}`);
    if (!itemsSnap.empty) {
      const firstItem = itemsSnap.docs[0].data();
      console.log(`   Exemplo de item lido: ID = ${itemsSnap.docs[0].id}, Título = "${firstItem.title || 'Sem título'}"`);
    }
  } catch (itemErr: any) {
    if (itemErr?.code === "permission-denied" || itemErr?.message?.includes("insufficient permissions")) {
      console.error(`❌ [FIRESTORE PERMISSION DENIED] Leitura em /items bloqueada por regras de segurança:`);
      console.error(`   Código: ${itemErr.code}`);
      console.error(`   Mensagem: ${itemErr.message}`);
    } else if (itemErr?.code === "unavailable") {
      console.error(`⚠️ [FIRESTORE UNAVAILABLE] Conexão indisponível: ${itemErr.message}`);
    } else {
      console.error(`❌ Erro inesperado em /items:`, itemErr);
    }
  }

  // 4.2 Test /system/config (Public maintenance banner - should succeed)
  console.log("\n--- Testando Leitura em /system/config (Banner de Manutenção) ---");
  try {
    const sysSnap = await getDoc(doc(clientDb, "system", "config"));
    console.log(`✅ [CONFIGURAÇÃO OK] Leitura pública em /system/config autorizada pelas regras!`);
    console.log(`   Existe: ${sysSnap.exists()}`);
  } catch (sysErr: any) {
    if (sysErr?.code === "permission-denied") {
      console.error(`❌ [FIRESTORE PERMISSION DENIED] /system/config bloqueado: ${sysErr.message}`);
    } else {
      console.error(`❌ Erro em /system/config:`, sysErr);
    }
  }

  // 4.3 Test /claims (Requires auth - expected permission-denied for unauthenticated client)
  console.log("\n--- Testando Leitura em /claims sem autenticação (Esperado Bloqueio de Segurança) ---");
  try {
    const qClaims = query(collection(clientDb, "claims"), limit(1));
    await getDocs(qClaims);
    console.warn(`⚠️ [ALERTA DE SEGURANÇA] Leitura não autenticada em /claims foi permitida!`);
  } catch (claimErr: any) {
    if (claimErr?.code === "permission-denied") {
      console.log(`🛡️ [COMPORTAMENTO DE SEGURANÇA CORRETO] Leitura anônima em /claims rejeitada com 'permission-denied' como esperado.`);
    } else {
      console.log(`ℹ️ Resposta em /claims: ${claimErr.code || claimErr.message}`);
    }
  }

  // 4.4 Test /notifications (Requires auth - expected permission-denied for unauthenticated client)
  console.log("\n--- Testando Leitura em /notifications sem autenticação (Esperado Bloqueio de Segurança) ---");
  try {
    const qNotifs = query(collection(clientDb, "notifications"), limit(1));
    await getDocs(qNotifs);
    console.warn(`⚠️ [ALERTA DE SEGURANÇA] Leitura não autenticada em /notifications foi permitida!`);
  } catch (notifErr: any) {
    if (notifErr?.code === "permission-denied") {
      console.log(`🛡️ [COMPORTAMENTO DE SEGURANÇA CORRETO] Leitura anônima em /notifications rejeitada com 'permission-denied' como esperado.`);
    } else {
      console.log(`ℹ️ Resposta em /notifications: ${notifErr.code || notifErr.message}`);
    }
  }

  // 4.5 Test /users (Requires auth / admin - expected permission-denied for unauthenticated client)
  console.log("\n--- Testando Leitura em /users sem autenticação (Esperado Bloqueio Anti-Enumeração) ---");
  try {
    const qUsers = query(collection(clientDb, "users"), limit(1));
    await getDocs(qUsers);
    console.warn(`⚠️ [ALERTA DE SEGURANÇA] Enumeração não autenticada em /users foi permitida!`);
  } catch (userErr: any) {
    if (userErr?.code === "permission-denied") {
      console.log(`🛡️ [COMPORTAMENTO DE SEGURANÇA CORRETO] Enumeração anônima em /users rejeitada com 'permission-denied' como esperado.`);
    } else {
      console.log(`ℹ️ Resposta em /users: ${userErr.code || userErr.message}`);
    }
  }

  // Cleanup client app
  await terminate(clientDb);
  await deleteApp(clientApp);

  console.log("\n================================================================================");
  console.log("🏁 DIAGNÓSTICO CONCLUÍDO COM SUCESSO");
  console.log("================================================================================");
}

runDiagnostic().catch((e) => {
  console.error("Erro fatal no diagnóstico:", e);
  process.exit(1);
});
