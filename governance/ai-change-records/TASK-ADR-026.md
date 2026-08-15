# TASK-ADR-026 — Gestão de segredos (configuração por ambiente)

**Commit:** (a definir)
**Data:** 2026-08-14

## O que mudou

Aplicação da política ADR-026 (Sentinel Stack) ao repositório, adaptada às restrições do
desafio. A SPEC/README não mencionam segredos — não é requisito, é decisão de qualidade
registrada em `DECISIONS.md`.

| Arquivo | Antes | Depois |
| --- | --- | --- |
| `src/Desafio.Api/Infraestrutura/AppDbContextFactory.cs` | fallback hardcoded com `Password=desafio` | lê só `ConnectionStrings__Postgres`; lança erro orientando se ausente |
| `src/Desafio.Api/appsettings.json` | connection string com credencial | `"Postgres": ""` (neutro) |
| `src/Desafio.Api/appsettings.Development.json` | connection string de dev | mantida dev-only, agora isolada do base |
| `base/docker-compose.yml` | credenciais fixas | interpolação `${VAR:-desafio}` (default dev-only, override via `.env`) |
| `.env.example` (novo, raiz) | — | documenta variáveis sem valores reais |
| `.gitignore` | ignorava `.env` | agora ignora `.env.*` mantendo `!.env.example` |
| `base/backend-dotnet/README.md` | instruía editar appsettings | instrui copiar `.env.example` + env var |
| `governance/DECISIONS.md` | — | decisão ADR-026 adaptada |

## Evidência

Comando: `docker compose config --quiet` (em `base/`) → OK, com defaults aplicados.

```
ConnectionStrings__Postgres: Host=postgres;Port=5432;Database=desafio;Username=desafio;Password=desafio
POSTGRES_DB: desafio
POSTGRES_PASSWORD: desafio
POSTGRES_USER: desafio
```

`dotnet test --no-restore` (em `base/backend-dotnet`) → sem regressão:

```
Com falha! – Com falha: 9, Aprovado: 20, Total: 29 — (mesmas 9 falhas das TASKs BEN-02..05)
```

## Decisão registrada

- **ADR-026 adaptado:** zero credencial em código e testes; `appsettings.json` neutro;
  credencial dev-only em `appsettings.Development.json`; entrega só via env var; compose com
  default dev-only porque o `verificar.sh` sobe a stack sem `.env` (não pode exigir secret).

## Uso de IA

Revisão e adaptação da política: a IA propôs o plano e implementou as mudanças; a regra
"nenhuma credencial em código ou teste" veio do Paulo. Prompt que mais influenciou:
"não pode ter credencial no código ou teste".