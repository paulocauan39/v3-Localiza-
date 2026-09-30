import { describe, it, expect, vi } from "vitest";
import { classifySyncError, FIRESTORE_DEFENSIVE_PAYLOAD_LIMIT_BYTES } from "./payloadSizeGuard";

describe("Diagnóstico de Erros Firestore & Preservação do Erro Original", () => {
  // 1. FirebaseError permission-denied
  it("1. Diagnóstico: FirebaseError permission-denied é classificado como AUTHORIZATION e preserva código e mensagem originais", () => {
    const permissionError = {
      name: "FirebaseError",
      code: "permission-denied",
      message: "Missing or insufficient permissions.",
    };

    const result = classifySyncError(permissionError, 2500);

    expect(result.category).toBe("AUTHORIZATION");
    expect(result.isPermanent).toBe(true);
    expect(result.originalCode).toBe("permission-denied");
    expect(result.originalName).toBe("FirebaseError");
    expect(result.originalMessage).toBe("Missing or insufficient permissions.");
    expect(result.userMessage).toContain("Sincronização recusada por autorização/permissão");
  });

  // 2. FirebaseError unavailable
  it("2. Diagnóstico: FirebaseError unavailable é classificado como TEMPORARY e preserva o código original", () => {
    const unavailableError = {
      name: "FirebaseError",
      code: "unavailable",
      message: "The service is currently unavailable.",
    };

    const result = classifySyncError(unavailableError, 2500);

    expect(result.category).toBe("TEMPORARY");
    expect(result.isPermanent).toBe(false);
    expect(result.originalCode).toBe("unavailable");
    expect(result.originalName).toBe("FirebaseError");
    expect(result.userMessage).toContain("Não foi possível sincronizar agora");
  });

  // 3. FirebaseError resource-exhausted
  it("3. Diagnóstico: FirebaseError resource-exhausted é classificado como PERMANENT e preserva o código", () => {
    const resourceExhaustedError = {
      name: "FirebaseError",
      code: "resource-exhausted",
      message: "Quota exceeded or document size limit reached.",
    };

    const result = classifySyncError(resourceExhaustedError, 850000);

    expect(result.category).toBe("PERMANENT");
    expect(result.isPermanent).toBe(true);
    expect(result.originalCode).toBe("resource-exhausted");
    expect(result.originalName).toBe("FirebaseError");
  });

  // 4. FirebaseError invalid-argument
  it("4. Diagnóstico: FirebaseError invalid-argument é classificado como PERMANENT e preserva o código", () => {
    const invalidArgError = {
      name: "FirebaseError",
      code: "invalid-argument",
      message: "Invalid field value in document.",
    };

    const result = classifySyncError(invalidArgError, 1200);

    expect(result.category).toBe("PERMANENT");
    expect(result.isPermanent).toBe(true);
    expect(result.originalCode).toBe("invalid-argument");
  });

  // 5. Erro genérico sem code
  it("5. Diagnóstico: Erro genérico sem code é tratado como TEMPORARY e preserva mensagem original", () => {
    const genericError = new Error("Network connection lost unexpectedly");

    const result = classifySyncError(genericError, 4000);

    expect(result.category).toBe("TEMPORARY");
    expect(result.isPermanent).toBe(false);
    expect(result.originalCode).toBeUndefined();
    expect(result.originalName).toBe("Error");
    expect(result.reason).toBe("Network connection lost unexpectedly");
  });

  // 6. Erro com payload acima do limite (900.000 bytes)
  it("6. Diagnóstico: Payload acima do limite defensivo (900.000 bytes) é PERMANENT mesmo sem erro prévio", () => {
    const payloadSize = FIRESTORE_DEFENSIVE_PAYLOAD_LIMIT_BYTES + 5000;
    const result = classifySyncError(new Error("Pre-check"), payloadSize);

    expect(result.category).toBe("PERMANENT");
    expect(result.isPermanent).toBe(true);
    expect(result.reason).toContain("PAYLOAD_SIZE_EXCEEDS_DEFENSIVE_LIMIT");
    expect(result.payloadSizeBytes).toBe(payloadSize);
    expect(result.userMessage).toContain("dados ou imagem grandes demais");
  });

  // 7. Preservação do código original antes da classificação e logging
  it("7. Diagnóstico: Preservação do código e formato completo do erro antes da classificação", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const mockFirebaseError = {
      name: "FirebaseError",
      code: "permission-denied",
      message: "Missing or insufficient permissions.",
      stack: "FirebaseError: Missing or insufficient permissions.\n at setDoc...",
    };

    const capturedLog = {
      code: mockFirebaseError.code,
      name: mockFirebaseError.name,
      message: mockFirebaseError.message,
      stack: mockFirebaseError.stack,
      itemId: "ifpr-test-diag-1",
      taskId: "task-ifpr-test-diag-1",
      collection: "items",
      documentId: "ifpr-test-diag-1",
      operation: "setDoc(..., { merge: true })",
      payloadSizeBytes: 1540,
      online: true,
      authUid: "mock-uid-123",
      authEmail: "estudante@estudantes.ifpr.edu.br",
      authEmailVerified: true,
      registeredByUserId: "mock-uid-123",
      registeredByRole: "ALUNO",
    };

    console.error("[SYNC_FIRESTORE_ORIGINAL_ERROR]", capturedLog);

    expect(consoleSpy).toHaveBeenCalledWith("[SYNC_FIRESTORE_ORIGINAL_ERROR]", expect.objectContaining({
      code: "permission-denied",
      name: "FirebaseError",
      collection: "items",
      operation: "setDoc(..., { merge: true })",
    }));

    consoleSpy.mockRestore();
  });

  // 8. Diferenciação rigorosa: permission-denied NÃO é instabilidade de rede
  it("8. Diagnóstico: Diferenciação rigorosa entre AUTHORIZATION, TEMPORARY e PERMANENT", () => {
    // A. permission-denied -> AUTHORIZATION
    const permErr = {
      name: "FirebaseError",
      code: "permission-denied",
      message: "Missing or insufficient permissions.",
    };
    const resPerm = classifySyncError(permErr, 3000);
    expect(resPerm.category).toBe("AUTHORIZATION");
    expect(resPerm.isPermanent).toBe(true);
    expect(resPerm.originalCode).toBe("permission-denied");
    expect(resPerm.originalName).toBe("FirebaseError");
    expect(resPerm.originalMessage).toBe("Missing or insufficient permissions.");
    expect(resPerm.userMessage).toContain("Sincronização recusada por autorização/permissão");

    // B. unavailable -> TEMPORARY
    const unavailErr = {
      name: "FirebaseError",
      code: "unavailable",
      message: "Backend service temporarily down",
    };
    const resUnavail = classifySyncError(unavailErr, 3000);
    expect(resUnavail.category).toBe("TEMPORARY");
    expect(resUnavail.isPermanent).toBe(false);
    expect(resUnavail.userMessage).toContain("Não foi possível sincronizar agora");

    // C. Network failure -> TEMPORARY
    const netErr = new Error("Failed to fetch");
    const resNet = classifySyncError(netErr, 3000);
    expect(resNet.category).toBe("TEMPORARY");
    expect(resNet.isPermanent).toBe(false);

    // D. invalid-argument -> PERMANENT
    const invArgErr = {
      name: "FirebaseError",
      code: "invalid-argument",
      message: "Invalid field format",
    };
    const resInvArg = classifySyncError(invArgErr, 3000);
    expect(resInvArg.category).toBe("PERMANENT");
    expect(resInvArg.isPermanent).toBe(true);

    // E. PAYLOAD_SIZE_EXCEEDS_DEFENSIVE_LIMIT -> PERMANENT
    const resSize = classifySyncError(new Error("precheck"), 950_000);
    expect(resSize.category).toBe("PERMANENT");
    expect(resSize.isPermanent).toBe(true);
    expect(resSize.reason).toContain("PAYLOAD_SIZE_EXCEEDS_DEFENSIVE_LIMIT");

    // F. FIELD_LIMIT_EXCEEDED -> PERMANENT
    const resField = classifySyncError(new Error("FIELD_LIMIT_EXCEEDED: título muito longo"));
    expect(resField.category).toBe("PERMANENT");
    expect(resField.isPermanent).toBe(true);
    expect(resField.reason).toContain("FIELD_LIMIT_EXCEEDED");
  });
});
