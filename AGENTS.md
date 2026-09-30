# 🚨 REGRAS MESTRAS OBRIGATÓRIAS PARA O DESENVOLVIMENTO DO LOCALIZA+

Estas regras são obrigatórias para TODAS as alterações realizadas no Localiza+, incluindo novas funcionalidades, correções de bugs, melhorias, alterações visuais, alterações de banco de dados, APIs, integrações, segurança, responsividade e configurações.

---

## 1. DADOS REAIS SÃO OBRIGATÓRIOS

NUNCA utilizar dados fictícios, mockados, simulados, inventados ou hardcoded para fazer uma funcionalidade parecer funcionando.

Todos os dados apresentados no sistema devem vir de sua fonte real.

Exemplos:
- **Usuários** → Firebase Authentication / Firestore;
- **Itens / Objetos** → Firestore;
- **Notificações** → Fonte real utilizada pelo sistema;
- **Estatísticas** → Dados reais armazenados;
- **Analytics** → Dados reais;
- **Uptime** → Monitoramento real;
- **Discord** → Integração real via webhook / bot configurado;
- **E-mail** → Serviço real configurado;
- **IA** → API real configurada (@google/genai);
- **Configurações** → Banco / configuração real.

**Se não houver dados:**
Não invente dados. Utilize o estado vazio (*empty state*) apropriado ou informe que os dados estão indisponíveis.
É PROIBIDO preencher uma tela com números ou registros falsos apenas para ela parecer completa.

---

## 2. PROIBIDO SIMULAR FUNCIONALIDADES

Uma funcionalidade somente pode ser considerada implementada se realmente executar sua operação.

Não criar:
- Botões falsos ou sem ação de persistência;
- Formulários que não salvam;
- Notificações que não são enviadas;
- Cadastros que não persistem;
- Exclusões apenas visuais;
- APIs falsas;
- Respostas simuladas;
- Dados estáticos apresentados como dados reais;
- Integrações falsas;
- Monitoramentos falsos.

Se a integração real não estiver configurada, informar isso claramente.

---

## 3. NÃO MASCARAR ERROS

Nunca corrigir um erro simplesmente escondendo o erro.

Nunca substituir:
- Erro de API por dado fictício;
- Erro do Firebase por dado estático;
- Erro do Discord por mensagem falsa de sucesso;
- Erro de IA por resultado inventado;
- Erro de banco por lista vazia falsa;
- Erro de autenticação por usuário fictício.

A correção deve atacar a causa real.

---

## 4. NÃO REMOVER FUNCIONALIDADES PARA "CORRIGIR" BUGS

É PROIBIDO remover uma funcionalidade existente apenas porque ela está causando erro.

Antes de remover qualquer código:
1. Identificar a causa raiz;
2. Corrigir a implementação;
3. Testar;
4. Verificar regressões.

Uma funcionalidade só pode ser removida se isso for explicitamente solicitado ou se houver decisão documentada para sua remoção.

---

## 5. CÓDIGO EXISTENTE DEVE SER ANALISADO ANTES DA ALTERAÇÃO

Antes de modificar uma funcionalidade:
- Localizar os arquivos envolvidos;
- Entender a implementação existente;
- Identificar dependências;
- Verificar APIs utilizadas;
- Verificar banco de dados;
- Verificar autenticação;
- Verificar permissões;
- Verificar integrações;
- Verificar componentes que dependem daquele código.

Não alterar código às cegas.

---

## 6. TODA ALTERAÇÃO DEVE SER REALMENTE PUBLICADA NO SITE

Esta é uma regra crítica.

Toda alteração, adição, melhoria ou correção solicitada e implementada deve ser refletida na versão publicada do Localiza+.

Não basta:
- Alterar apenas o código local;
- Criar o componente sem integrá-lo;
- Alterar um arquivo sem fazer a funcionalidade chegar ao sistema;
- Implementar a funcionalidade e esquecer o deploy / build;
- Corrigir o código mas deixar a versão publicada antiga.

Após a implementação:
1. Verificar o build (`npm run build`);
2. Verificar erros de tipagem / lint (`tsc --noEmit`);
3. Garantir que os arquivos necessários foram incluídos;
4. Garantir que a alteração está integrada ao projeto;
5. Garantir que a versão publicada recebeu a alteração;
6. Verificar a funcionalidade no ambiente publicado.

Código alterado que não chega ao site NÃO deve ser considerado uma tarefa concluída.

---

## 7. HISTÓRICO DE VERSÕES É PARTE DO SISTEMA

O Localiza+ possui um Histórico de Versões / Changelog e também um relatório oficial de versões.

Essa funcionalidade deve ser tratada como parte integrante do sistema.

NUNCA esquecer de atualizar o Histórico de Versões (`src/data/versionsData.ts`).

Toda alteração realizada deve gerar uma entrada correspondente.

Isso inclui:
- Nova funcionalidade;
- Correção de bug;
- Melhoria;
- Alteração visual;
- Correção de responsividade;
- Alteração de segurança;
- Alteração de banco;
- Alteração de API;
- Alteração de integração;
- Alteração de configuração;
- Correção de erro de produção;
- Alteração de IA;
- Alteração do sistema de notificações;
- Alteração do sistema de documentos;
- Alteração do PWA;
- Alteração do sistema de QR Code.

---

## 8. O HISTÓRICO DE VERSÕES DEVE SER ATUALIZADO NA MESMA TAREFA

Não deixar para atualizar depois.

Fluxo obrigatório:
**ALTERAÇÃO → TESTE → ATUALIZAÇÃO DO HISTÓRICO → BUILD → DEPLOY → VALIDAÇÃO**

Não:
**ALTERAÇÃO → DEPLOY → "depois eu atualizo o histórico"**

A atualização do Histórico de Versões deve fazer parte da própria implementação.

---

## 9. O HISTÓRICO DEVE CORRESPONDER AO QUE REALMENTE FOI FEITO

Nunca registrar uma funcionalidade como concluída se ela não estiver funcionando.

Nunca registrar:
- *"Correção definitiva"* se o problema ainda existir.
- *"Implementado"* se apenas o frontend foi criado.
- *"Testado"* se não houve teste real.
- Dados, métricas ou resultados inventados.

O changelog deve representar fielmente o estado real do sistema.

---

## 10. VERSÃO DO SISTEMA DEVE SER CONSISTENTE

A versão exibida no:
- Site;
- Painel administrativo;
- Histórico de versões;
- Changelog;
- Relatório PDF;
- Informações de build;

deve ser consistente sempre que esses componentes utilizarem o mesmo número de versão.

Não permitir situações com versões divergentes entre ambiente ativo e changelog. A versão ativa deve representar a versão realmente implantada em produção.

---

## 11. NÃO DUPLICAR VERSÕES

Antes de criar uma nova versão:
- Verificar a última versão existente;
- Verificar se a alteração já foi registrada;
- Verificar o número da versão;
- Evitar entradas duplicadas.

Cada alteração deve ser registrada uma única vez.

---

## 12. DADOS DO HISTÓRICO DEVEM SER REAIS

O Histórico de Versões também está sujeito à regra de dados reais.

Não inventar:
- Quantidade de funcionalidades;
- Quantidade de correções;
- Datas;
- Horários;
- Versões;
- Descrições;
- Status;
- Funcionalidades implementadas.

Os números apresentados no resumo do histórico devem ser calculados a partir das entradas reais existentes.

---

## 13. TESTE O SISTEMA REAL

Antes de marcar uma tarefa como concluída:

**Frontend:**
- Verificar console;
- Verificar erros JavaScript / TypeScript;
- Verificar interface.

**Backend:**
- Verificar APIs;
- Verificar respostas HTTP;
- Verificar logs;
- Verificar tratamento de erros.

**Firebase:**
- Verificar Authentication;
- Verificar Firestore;
- Verificar regras de segurança;
- Verificar persistência.

**Integrações:**
- Discord;
- E-mail;
- IA;
- APIs externas;
- Vercel / Cloud Run;
- Outros serviços utilizados.

**Interface:**
- Celular / Smartphone;
- Tablet;
- Desktop.

---

## 14. TESTE DE PONTA A PONTA

Quando uma funcionalidade envolver várias partes, testar o fluxo completo:

`Usuário → Interface → API → Backend → Firebase → Banco → Resposta → Interface`

Não considerar a tarefa concluída apenas porque o botão ou elemento visual aparece.

---

## 15. NÃO ALTERAR DADOS DE PRODUÇÃO DURANTE TESTES

Nunca apagar ou modificar dados reais apenas para testar uma funcionalidade.

Não executar:
- Wipe / Limpeza de coleções;
- Exclusões em massa;
- Reset de banco;
- Alterações destrutivas;

em produção sem autorização explícita.

---

## 16. SEGURANÇA

Nunca colocar no código:
- Senhas;
- Tokens;
- Chaves privadas;
- Service Account Keys;
- Webhooks privados;
- Credenciais;
- Secrets.

Utilizar sempre variáveis de ambiente (`.env.example`) e mecanismos seguros.
Nunca remover uma regra de segurança apenas para fazer uma funcionalidade funcionar.

---

## 17. AUTENTICAÇÃO E PERMISSÕES

As permissões devem ser verificadas no backend/banco quando necessário.

Não confiar somente em:
- Botões escondidos;
- Rotas protegidas exclusivamente no frontend;
- Variáveis locais;
- localStorage;
- Estado visual da aplicação.

Usuários só podem executar operações compatíveis com suas permissões reais (Aluno, Servidor/TAE, Administrador).

---

## 18. NÃO CRIAR UMA SEGUNDA FONTE DE VERDADE

- Se uma informação já existe no Firestore, não criar uma cópia hardcoded no frontend.
- Se existe uma configuração real, não criar outra configuração paralela.
- Se existe um Histórico de Versões real, não criar outro changelog independente sem necessidade.

O sistema deve possuir uma fonte de verdade clara e única.

---

## 19. VARIÁVEIS DE AMBIENTE

Quando uma funcionalidade depender de uma variável de ambiente:
- Verificar se ela existe;
- Verificar se possui o nome correto;
- Verificar se está disponível no ambiente de produção;
- Verificar se o código a utiliza corretamente.

Se estiver ausente: **não invente um valor**. Informe que a configuração necessária está ausente.

---

## 20. NÃO CONSIDERAR BUILD COMO SINÔNIMO DE SISTEMA FUNCIONANDO

Um `npm run build` bem-sucedido não significa que o sistema está funcionando de ponta a ponta.

Também verificar:
- APIs;
- Firebase;
- Autenticação;
- Permissões;
- Integrações;
- Persistência;
- Interface;
- Funcionalidades críticas.

---

## 21. NÃO CONSIDERAR "SEM ERRO VISUAL" COMO FUNCIONALIDADE CONCLUÍDA

Uma tela bonita não significa que o sistema funciona.
A funcionalidade precisa funcionar de verdade com persistência e integridade.

---

## 22. RESUMO TÉCNICO OBRIGATÓRIO

Ao concluir uma alteração, fornecer obrigatoriamente:

1. **Alteração realizada / O que mudou:** Descrição técnica e funcional objetiva;
2. **Arquivos afetados:** Caminhos completos dos arquivos criados ou modificados;
3. **Funcionalidade:** Comportamento adicionado ou corrigido de ponta a ponta;
4. **Testes e validações:** Linting (`tsc --noEmit`), Build (`npm run build`) e testes realizados;
5. **Histórico de Versões:** Confirmação da versão registrada em `src/data/versionsData.ts`;
6. **Ambiente / Deploy:** Confirmação de integração e prontidão para o ambiente publicado.

Nunca afirmar que uma dessas etapas foi concluída sem realmente ter sido.

---

## 23. CHECKLIST FINAL OBRIGATÓRIO

Antes de finalizar QUALQUER tarefa:

- [ ] Usei somente dados reais?
- [ ] Evitei qualquer dado fictício?
- [ ] Evitei funcionalidades simuladas?
- [ ] Corrigi a causa real do problema?
- [ ] Evitei remover funcionalidades para esconder bugs?
- [ ] Analisei o código existente antes de modificar?
- [ ] Verifiquei frontend?
- [ ] Verifiquei backend?
- [ ] Verifiquei banco/Firebase quando aplicável?
- [ ] Verifiquei autenticação e permissões?
- [ ] Verifiquei integrações?
- [ ] Verifiquei console e logs?
- [ ] Fiz o build?
- [ ] Testei a funcionalidade?
- [ ] Testei funcionalidades relacionadas?
- [ ] Verifiquei mobile?
- [ ] Verifiquei desktop?
- [ ] A alteração chegou ao site publicado?
- [ ] O Histórico de Versões foi atualizado?
- [ ] A versão do sistema está correta?
- [ ] O Histórico corresponde exatamente ao que foi implementado?
- [ ] Não existem informações fictícias no Histórico?
- [ ] O resumo técnico foi fornecido?

**SE QUALQUER ITEM ACIMA FOR "NÃO", A TAREFA NÃO ESTÁ CONCLUÍDA.**
