# Plataforma de Gestão de Estudos e Finanças - Concurso Câmara de Mossoró 2026

Aplicação web responsiva desenvolvida com **React 19 + Vite**, estilização moderna em **Vanilla CSS** com suporte nativo a **Light / Dark Mode**, e integração de banco de dados para persistência com **Firebase (Google Firestore)**, **Supabase (PostgreSQL)** e **LocalStorage (modo offline automático)**.

---

## 🎯 Funcionalidades Implementadas

### 1. Sistema de Autenticação (Mock Condicional)
- **Usuário 1 (Perfil TI):**
  - **Login:** `lucas` | **Senha:** `12345`
  - **Cargos disponíveis:** *Técnico em Informática (Cód. 102)* e *Analista de Tecnologia da Informação (Cód. 205)*.
- **Usuário 2 (Perfil Administrativo):**
  - **Login:** `ana` | **Senha:** `12345`
  - **Cargo disponível:** *Agente Administrativo (Cód. 101)*.
- Botões de acesso rápido em 1 clique na tela de login e seletor rápido no topo da tela para facilitar a alternância entre usuários.

### 2. Dashboard / Visão Geral
- **Contagem Regressiva em Tempo Real:** Cronômetro com dias, horas, minutos e segundos até a Prova Objetiva (**06/12/2026**).
- **Linha do Tempo Oficial:** Prazos de inscrições (**13/10/2026 a 12/11/2026**), período retificado de pagamento da taxa (**27/10 a 13/11/2026**) e locais de prova.
- **Calculadora Financeira de Viagem:**
  - Presets para veículos: **Volkswagen Fox** (~11.5 km/l) e **Yamaha MT-03** (~22 km/l) ou inserção manual.
  - Taxa de inscrição: R$ 100 (Médio/Técnico) ou R$ 150 (Superior) ou isenção (R$ 0).
  - Hospedagem (diárias x valor por noite), alimentação (dias x média/dia) e reserva de emergência.
  - Somatório total reativo e percentual em relação ao salário base (R$ 4.921,08).
  - Botão para **Salvar Orçamento** de forma persistente por usuário.
- **Acesso Rápido:** Botão direto para a página oficial do concurso no portal da **COMPERVE / UFRN**.

### 3. Central de Documentos (PDF Viewer)
- Leitura de PDFs integrada na tela via `<iframe>` sem sair do app.
- Acesso aos 8 documentos oficiais:
  1. *Edital Nº 01/2026 Completo (Retificado em 22/10/2026)*
  2. *1ª Retificação do Edital (22/10/2026)*
  3. *Programa Específico - Agente Administrativo*
  4. *Programa Específico - Analista de TI*
  5. *Programa Específico - Técnico em Informática*
  6. *Programa Geral - Língua Portuguesa*
  7. *Programa Geral - Legislação*
  8. *Programa Geral - Informática*
- Botões explícitos de **Download do PDF** local e **Abrir em Nova Aba**.

### 4. Tracker de Estudos (Dinâmico por Perfil)
- Checklists divididas por disciplinas: Língua Portuguesa, Legislação, Informática e Específicos.
- Filtro condicional estrito por perfil:
  - **Lucas:** Vê exclusivamente os editais de *Técnico em Informática* e *Analista de TI*.
  - **Ana:** Vê exclusivamente o edital de *Agente Administrativo*.
- Barras de progresso com porcentagem geral e por disciplina.
- Barra de busca instantânea e filtros: *Todos*, *Pendentes*, *Concluídos*.
- Bloco de **Anotações de Estudo** por tópico (permite registrar resumos e macetes).

### 5. Extração de Dados e Estrutura JSON
- O arquivo `conteudo_programatico.json` contém a árvore completa e exata de tópicos extraída diretamente dos PDFs oficiais da COMPERVE.

---

## 🚀 Como Executar o Projeto

```bash
# 1. Instalar dependências (caso necessário)
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev

# O app estará disponível em: http://localhost:3000
```

---

## ☁️ Configuração do Banco de Dados (Firebase ou Supabase)

O app conta com uma camada de persistência híbrida (`src/services/db.js`):
1. **LocalStorage:** Já ativo por padrão, funciona imediatamente sem configurações externas.
2. **Supabase:** Basta acessar a aba **"Nuvem (BD)"** no app, inserir a `URL do Projeto` e a `Anon Key`. O script SQL para criação da tabela com RLS já é fornecido no próprio painel com botão de copiar.
3. **Firebase Firestore:** Selecione Firebase na aba **"Nuvem (BD)"** e informe as chaves de configuração do seu projeto no Google Firebase Console.
