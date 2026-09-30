import React, { useState } from "react";
import { X, Plus, PlusCircle, CheckCircle2, ShieldAlert } from "lucide-react";
import { TestCaseItem, TestCategory, TestPriority } from "../../types";
import { vibrateClick, vibrateSuccess, vibrateWarning } from "../../lib/utils";

interface AddTestCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTest: (test: TestCaseItem) => Promise<void>;
  existingTestCount: number;
  darkMode?: boolean;
}

const AVAILABLE_CATEGORIES: { id: TestCategory; name: string }[] = [
  { id: "AUTENTICACAO", name: "Autenticação & Controle de Sessão" },
  { id: "CADASTRO", name: "Cadastro & Persistência de Dados" },
  { id: "ACHADOS_PERDIDOS", name: "Achados & Perdidos" },
  { id: "REIVINDICACOES", name: "Reivindicações & Verificação" },
  { id: "QR_CODE", name: "QR Code & Etiquetas Físicas" },
  { id: "IA_GEMINI", name: "Inteligência Artificial (Gemini)" },
  { id: "PWA_MOBILE", name: "PWA & Recursos Mobile" },
  { id: "DOCUMENTOS", name: "Documentos Oficiais & Assinatura" },
  { id: "NOTIFICACOES", name: "Notificações & Alertas" },
  { id: "SEGURANCA", name: "Segurança & Trilha de Auditoria" },
  { id: "APIS_PRODUCAO", name: "APIs & Webhooks em Produção" },
  { id: "MONITORAMENTO", name: "Monitoramento & Uptime" },
];

export const AddTestCaseModal: React.FC<AddTestCaseModalProps> = ({
  isOpen,
  onClose,
  onAddTest,
  existingTestCount,
  darkMode,
}) => {
  const [category, setCategory] = useState<TestCategory>("CADASTRO");
  const [testId, setTestId] = useState<string>(`TEST-CUSTOM-${existingTestCount + 1}`);
  const [title, setTitle] = useState<string>("");
  const [priority, setPriority] = useState<TestPriority>("MEDIA");
  const [description, setDescription] = useState<string>("");
  const [expectedResult, setExpectedResult] = useState<string>("");
  const [preconditions, setPreconditions] = useState<string>("");
  const [stepsText, setStepsText] = useState<string>("1. Acessar tela\n2. Executar ação\n3. Validar persistência");
  const [observations, setObservations] = useState<string>("");
  const [isCritical, setIsCritical] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testId.trim() || !title.trim() || !expectedResult.trim()) {
      vibrateWarning();
      return;
    }

    setIsSubmitting(true);
    vibrateClick();

    const selectedCategoryObj = AVAILABLE_CATEGORIES.find((c) => c.id === category);
    const steps = stepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const newTestCase: TestCaseItem = {
      id: testId.trim(),
      category,
      categoryName: selectedCategoryObj?.name || category,
      title: title.trim(),
      priority,
      description: description.trim() || undefined,
      expectedResult: expectedResult.trim(),
      obtainedResult: "Pendente de validação no ciclo ativo.",
      status: "PENDENTE",
      preconditions: preconditions.trim() || undefined,
      procedureSteps: steps.length > 0 ? steps : undefined,
      procedure: steps.length > 0 ? steps : undefined,
      isCriticalPersistence: isCritical,
      observations: observations.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    await onAddTest(newTestCase);
    setIsSubmitting(false);
    vibrateSuccess();
    onClose();
  };

  return (
    <div
      id="modal-add-test-case"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div
        className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          darkMode ? "bg-neutral-900 border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
        }`}
      >
        <div className="p-5 border-b flex items-center justify-between dark:border-neutral-800 border-neutral-200 bg-emerald-600/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Cadastrar Novo Caso de Teste</h2>
              <p className="text-xs text-neutral-500">Defina o roteiro de homologação manual ou assistida</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-500 uppercase">Categoria *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TestCategory)}
                className={`w-full text-xs font-semibold px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
                }`}
              >
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-500 uppercase">Identificador / Código *</label>
              <input
                type="text"
                required
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
                placeholder="Ex: CT-01 ou TEST-12"
                className={`w-full text-xs font-mono font-bold px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-neutral-500 uppercase">Prioridade *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TestPriority)}
                className={`w-full text-xs font-bold px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${
                  darkMode ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
                }`}
              >
                <option value="BAIXA">Baixa</option>
                <option value="MEDIA">Média</option>
                <option value="ALTA">Alta</option>
                <option value="CRITICA">Crítica</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Título do Caso de Teste *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Validação do fluxo de devolução com assinatura digital"
              className={`w-full text-xs font-semibold px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Descrição & Objetivo do Teste</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o propósito deste teste e o que se pretende aferir..."
              className={`w-full text-xs font-medium px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Pré-requisitos / Cenário Inicial</label>
            <input
              type="text"
              value={preconditions}
              onChange={(e) => setPreconditions(e.target.value)}
              placeholder="Ex: Usuário Aluno autenticado com item aguardando reivindicação"
              className={`w-full text-xs font-medium px-3 py-2.5 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Resultado Esperado *</label>
            <textarea
              required
              rows={2}
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              placeholder="Descreva o critério de aceitação e persistência esperado..."
              className={`w-full text-xs font-medium px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Passos do Procedimento (1 por linha)</label>
            <textarea
              rows={3}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              placeholder="1. Passo um&#10;2. Passo dois&#10;3. Validar resultado"
              className={`w-full text-xs font-mono px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
              }`}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-500 uppercase">Observações Técnicas</label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Instruções particulares para o testador..."
              className={`w-full text-xs font-medium px-3 py-2 rounded-xl border outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode ? "bg-neutral-800 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-300 text-neutral-900"
              }`}
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="critical-toggle"
              checked={isCritical}
              onChange={(e) => setIsCritical(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="critical-toggle" className="text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Marcar como teste crítico de persistência de dados (RNF-04)
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t dark:border-neutral-800 border-neutral-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold rounded-xl border dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Salvar Caso de Teste
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
