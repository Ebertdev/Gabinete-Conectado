# Gabinete Conectado

Gabinete Conectado e uma aplicacao web para gabinetes parlamentares gerenciarem demandas da populacao, cidadaos, agenda, documentos, estatisticas, mapa geoespacial e permissoes de equipe.

O projeto usa Next.js com App Router, React, Tailwind CSS, Supabase Auth/Database/Storage, Leaflet para mapas, Recharts para graficos e jsPDF para exportacoes.

## Principais Recursos

- Landing page institucional com apresentacao do produto.
- Formulario publico de solicitacao em `/solicitar`.
- Registro de demandas com dados do cidadao, endereco, bairro, descricao, geolocalizacao e fotos.
- Painel administrativo protegido por login em `/admin`.
- Dashboard com indicadores, filtros e exportacao de relatorios.
- Esteira Kanban e tabela para acompanhamento de demandas.
- CRM de cidadaos com historico e anotacoes.
- Agenda de compromissos, visitas e reunioes.
- Cofre de documentos com upload, download, exclusao e geracao de documentos com IA simulada/local.
- Estatisticas com graficos por periodo, categoria e bairro.
- Mapa de demandas com Leaflet.
- Gestao de usuarios, papeis e permissoes unitarias por plano.
- Responsividade ajustada para desktop e dispositivos moveis.

## Stack

- Next.js `16.2.6`
- React `19.2.4`
- TypeScript
- Tailwind CSS `4`
- Supabase JS `2`
- Lucide React
- Recharts
- Leaflet / React Leaflet
- jsPDF / jsPDF AutoTable

## Estrutura Do Projeto

```text
src/
  app/
    page.tsx                 # Landing page
    login/page.tsx           # Login, cadastro e recuperacao de senha
    solicitar/page.tsx       # Formulario publico de demanda
    admin/
      page.tsx               # Dashboard administrativo
      demandas/page.tsx      # Kanban/tabela de demandas
      cidadaos/page.tsx      # CRM de cidadaos
      agenda/page.tsx        # Agenda
      documentos/page.tsx    # Cofre de documentos
      estatisticas/page.tsx  # Graficos e exportacoes
      mapa/page.tsx          # Mapa geoespacial
      usuarios/page.tsx      # Usuarios e permissoes
      configuracoes/page.tsx # Configuracoes do gabinete
  application/
    use-cases/               # Casos de uso
  components/
    admin/                   # Componentes do painel
    demand-form.tsx          # Formulario publico
  contexts/
    AuthContext.tsx          # Sessao, perfil e permissoes
  core/
    domain/                  # Entidades de dominio
    repositories/            # Contratos de repositorio
  infrastructure/
    repositories/            # Implementacoes Supabase
    supabase/client.ts       # Cliente Supabase
  utils/
    permissions.ts           # Permissoes, planos e papeis

supabase/
  auth-profiles.sql
  user-permissions-migration.sql
  demand-photos-migration.sql
  schema.sql
```

## Requisitos

- Node.js compativel com Next.js 16.
- npm.
- Projeto Supabase configurado.
- Tabelas e policies aplicadas no Supabase.
- Buckets de Storage criados pelas migrations ou manualmente.

## Instalacao

Instale as dependencias:

```bash
npm install
```

Rode o ambiente local:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Comandos

```bash
npm run dev
```

Inicia o servidor de desenvolvimento.

```bash
npm run build
```

Gera o build de producao.

```bash
npm run start
```

Roda a aplicacao depois do build.

```bash
npm run lint
```

Executa o ESLint.

## Configuracao Do Supabase

O cliente Supabase esta em:

```text
src/infrastructure/supabase/client.ts
```

Atualmente o projeto usa URL e chave anon diretamente nesse arquivo. Para producao, o ideal e mover esses valores para variaveis de ambiente:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_DEFAULT_GABINETE_ID=...
```

`NEXT_PUBLIC_DEFAULT_GABINETE_ID` e opcional. Quando ausente, o repositorio de demandas tenta usar a RPC `get_public_gabinete_id`.

## Migrations SQL

Execute os arquivos abaixo no SQL Editor do Supabase, conforme a necessidade do ambiente.

```text
supabase/auth-profiles.sql
```

Cria `gabinetes`, `usuarios`, policies basicas e trigger para criar perfil ao cadastrar usuario via Supabase Auth.

```text
supabase/user-permissions-migration.sql
```

Adiciona a coluna `permissions` para suportar permissoes unitarias por usuario.

```text
supabase/demand-photos-migration.sql
```

Adiciona `demandas.anexos`, cria o bucket publico `demand-photos` e configura policies para leitura e envio das fotos.

```text
supabase/schema.sql
```

Schema historico/base com tabelas legadas e recursos geoespaciais. Use com cuidado se o seu banco atual ja usa as tabelas em portugues (`demandas`, `cidadaos`, `usuarios`, `gabinetes`).

## Fotos Em Demandas

O fluxo de fotos funciona assim:

1. O cidadao envia fotos pelo formulario publico em `/solicitar`.
2. O arquivo e enviado para o bucket `demand-photos`.
3. A URL publica e salva em `demandas.anexos`.
4. A tela `/admin/demandas` mostra indicador de foto no Kanban/tabela.
5. O modal de detalhes da demanda exibe a galeria de fotos anexadas.

Antes de testar esse fluxo, execute:

```text
supabase/demand-photos-migration.sql
```

## Permissoes E Planos

As permissoes ficam centralizadas em:

```text
src/utils/permissions.ts
```

O `AuthContext` carrega o perfil do usuario, normaliza permissoes e expõe `can(...)` para validar acesso por recurso. As permissoes combinam:

- papel do usuario
- permissoes unitarias salvas em `usuarios.permissions`
- limites do plano do gabinete

## Modulos Administrativos

### Dashboard

Mostra indicadores de demandas, cidadaos e andamento. Tambem permite exportar dados em CSV/PDF.

### Demandas

Permite visualizar demandas em Kanban ou tabela, filtrar por status, abrir detalhes, alterar status, notificar por WhatsApp, arquivar resolvidas, importar CSV e excluir demandas.

### Cidadaos

Funciona como CRM do gabinete, com cadastro, edicao, perfil do cidadao, historico de demandas e anotacoes.

### Agenda

Gerencia compromissos por lista ou calendario mensal, com filtros por tipo/status.

### Documentos

Permite upload de documentos para Supabase Storage, visualizacao de metadados, download, exclusao e geracao/salvamento de documentos textuais.

### Estatisticas

Mostra graficos e dados agregados de demandas por periodo, categoria, bairro e status.

### Mapa

Renderiza mapa com Leaflet/React Leaflet para visualizacao geoespacial.

### Usuarios

Permite convidar/remover usuarios, editar papel e manipular permissoes unitarias respeitando o plano do gabinete.

### Configuracoes

Centraliza dados do gabinete, acessos e configuracoes operacionais.

## Deploy Na Vercel

1. Conecte o repositorio na Vercel.
2. Configure as variaveis de ambiente, caso o cliente Supabase seja migrado para `.env`.
3. Execute as migrations no Supabase antes de validar o deploy.
4. Rode `npm run build` localmente ou acompanhe o build da Vercel.
5. Teste login, cadastro de demanda, upload de foto e painel admin.

## Checklist Antes Do Commit

```bash
npm install
npm run lint
npm run build
git status
```

Como `node_modules` nao deve ser versionado, mantenha o diretorio fora do commit. O `package-lock.json` deve ser mantido para builds reproduziveis.

## Observacoes Importantes

- A aplicacao depende de tabelas Supabase em portugues, como `usuarios`, `gabinetes`, `cidadaos`, `demandas`, `agenda` e `documentos`.
- O arquivo `schema.sql` contem tambem uma modelagem legada em ingles (`users`, `citizens`, `demands`). Confirme qual modelo esta ativo antes de aplicar em um banco existente.
- O bucket `documentos` tambem precisa existir para o cofre de documentos funcionar.
- O bucket `demand-photos` precisa existir e ser publico para as fotos de demandas aparecerem no painel.
- Algumas telas usam alertas e fluxos simulados/localizados que podem ser refinados para producao.


