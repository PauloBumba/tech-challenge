# Makefile — Comandos de desenvolvimento e entrega

Este `Makefile` automatiza desenvolvimento, testes, build, Docker e o fluxo de entrega. Execute os comandos **dentro desta pasta** (`participantes/paulobumba/`).

## Desenvolvimento

```bash
make dev            # Sobe API + Web + Postgres (http://localhost:9999 e :4200)
make dev-down       # Para o ambiente
make dev-up         # Sobe de novo
make dev-restart    # Reinicia os containers
```

## Testes

```bash
make test           # Backend + frontend
make test-backend   # Suíte .NET (88 testes)
make test-frontend  # Suíte Angular (Karma)
make test-e2e       # E2E Playwright
```

> `test-frontend` exige Chrome (`CHROME_BIN` configurado). `test-e2e` sobe a API real.

## Build

```bash
make build           # Backend + frontend
make build-backend   # dotnet build --configuration Release
make build-frontend  # npm run build
```

## Docker / entrega

```bash
make docker-build    # Build local das imagens
make docker-push     # Push bumab/desafio-4tech-*:1.0.0
make delivery-build  # Build multi-arch (linux/amd64 + arm64) e push
make delivery-verify # Roda ./verificar.sh (valida a entrega)
make delivery        # Build + push + verificação completa
make verify          # Apenas verifica (precisa do dev parado)
```

## Status e diagnóstico

```bash
make status    # Containers rodando
make logs      # Logs de todos os serviços
make logs-api  # Logs só da API
make logs-web  # Logs só do Web
make health    # GET /health (status + banco)
make swagger   # Abre a documentação OpenAPI
make metrics   # Métricas Prometheus
```

## Banco de dados (Entity Framework)

Os comandos `dotnet ef` rodam no host e precisam de `ConnectionStrings__Postgres` no ambiente
(exporte a variável ou copie `.env.example` → `.env` na raiz do repositório). Migrações são
aplicadas automaticamente no startup dos containers.

```bash
make db-migrate             # Aplica migrações
make db-migration-add NAME  # Cria migração
make db-migration-remove    # Remove a última
make db-migration-list      # Lista migrações
make db-migration-script    # Gera migrations.sql
make db-drop                # Remove o banco (pede confirmação)
make db-reset               # Remove e recria (pede confirmação)
make db-info                # Explica o fluxo de migrações
```

## Limpeza

```bash
make clean        # Limpa build/artefatos locais
make clean-docker # Derruba containers (-v)
make clean-all    # Tudo
```

## Observações

- As imagens de entrega são `bumab/desafio-4tech-api:1.0.0` e `bumab/desafio-4tech-web:1.0.0`
  (definidas em `TAG`), publicadas no Docker Hub em multi-arch.
- `delivery-verify` e `verify` sobem o `docker-compose.yml` desta pasta nas portas
  **9999/4200** — o ambiente de desenvolvimento (`make dev`) precisa estar parado.
- Comandos destrutivos (`db-drop`, `db-reset`, `clean-all`) pedem confirmação antes de agir.