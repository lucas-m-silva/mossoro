# Plataforma de Gestão de Estudos e Finanças - Concurso Câmara de Petrolina 2026

Aplicação web responsiva desenvolvida com **React 19 + Vite**, estilização moderna em **Vanilla CSS** com suporte nativo a **Light / Dark Mode**, e integração de banco de dados para persistência com **Supabase (PostgreSQL)** e **LocalStorage (modo offline automático)**.

---

## 🎯 Funcionalidades Implementadas

### 1. Sistema de Autenticação (Mock Condicional)
- **Usuário 1 (Perfil TI):**
  - **Login:** `lucas` | **Senha:** `12345`
  - **Cargo disponível:** *Analista Legislativo – Tecnologia da Informação (Cód. 04 — Nível Superior)*: **R$ 4.553,94** (1 vaga imediata + 3 de cadastro de reserva, 30h semanais).
- **Usuário 2 (Perfil Administrativo):**
  - **Login:** `ana` | **Senha:** `12345`
  - **Cargos disponíveis:** *Técnico Legislativo – Administrativa (Cód. 07)* e *Técnico Legislativo – Legislativa (Cód. 08)*: **R$ 3.512,00** (5 vagas imediatas + 15 de cadastro de reserva cada, 30h semanais).
- Botões de acesso rápido em 1 clique na tela de login e seletor rápido no topo da tela para facilitar a alternância entre usuários.

### 2. Dashboard / Visão Geral
- **Contagem Regressiva em Tempo Real:** Cronômetro com dias, horas, minutos e segundos até a Prova Objetiva (**17/01/2027**).
- **Linha do Tempo Oficial:** Prazos de inscrições (**06/11/2026 a 05/12/2026**), último dia para pagamento da taxa (**07/12/2026**), divulgação dos locais de prova (**08/01/2027**) e aplicação das provas (**17/01/2027**).
- **Horários Oficiais (Horário de Brasília/DF):**
  - **Manhã (Técnico Legislativo):** Portões abrem às 07h00, fecham às 08h00; prova das 08h00 às 12h00.
  - **Tarde (Analista Legislativo):** Portões abrem às 13h00, fecham às 14h00; prova das 14h00 às 18h00.
- **Calculadora Financeira de Viagem:**
  - Distância configurada para Petrolina/PE: **637 km cada trecho (1.274 km ida e volta)**.
  - Presets para veículos: **Volkswagen Fox** (~11.5 km/l) e **Yamaha MT-03** (~22 km/l) ou inserção manual.
  - Taxa de inscrição: **R$ 120** (Nível Médio) ou **R$ 140** (Nível Superior) ou isenção (R$ 0).
  - Hospedagem (diárias x valor por noite), alimentação (dias x média/dia) e reserva de emergência.
  - Somatório total reativo e percentual em relação ao salário do cargo escolhido (R$ 3.512,00 para Técnico Legislativo ou R$ 4.553,94 para Analista Legislativo).
  - Botão para **Salvar Orçamento** de forma persistente por usuário.
- **Acesso Rápido:** Botão direto para o portal oficial do **IDECAN**.

### 3. Central de Documentos (PDF Viewer)
- Leitura de PDFs integrada na tela via `<iframe>` sem sair do app.
- Acesso ao **Edital Nº 01/2026 - Câmara de Petrolina/PE** (`public/docs/edital_01_2026_petrolina.pdf`, 54 páginas).
- Botões explícitos de **Download PDF** local, **Nova Aba** e **Portal IDECAN**.

### 4. Tracker de Estudos (Dinâmico por Perfil)
- Checklists divididas por disciplinas conforme o Anexo II do Edital Nº 01/2026:
  - **Analista Legislativo - TI (Lucas):** Língua Portuguesa (Nível Superior), Noções de Informática, Legislação e Ética no Serviço Público e Conhecimentos Específicos de TI.
  - **Técnico Legislativo (Ana):** Língua Portuguesa (Nível Médio), Raciocínio Lógico-Matemático, Legislação e Ética no Serviço Público e Conhecimentos Específicos (Administrativa ou Legislativa).
- Barras de progresso com porcentagem geral e por disciplina.
- Barra de busca instantânea e filtros: *Todos*, *Pendentes*, *Concluídos*.
- Bloco de **Anotações de Estudo** por tópico.

---

## 🚀 Como Executar o Projeto

```bash
# 1. Instalar dependências (caso necessário)
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# O app estará disponível em: http://localhost:3000
```
