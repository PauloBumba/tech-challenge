.PHONY: help dev dev-down dev-up dev-restart test test-backend test-frontend test-e2e build build-backend build-frontend clean clean-docker clean-all docker-build docker-push verify delivery delivery-build delivery-push delivery-verify db-migrate db-migration-add db-migration-remove db-migration-list db-migration-script db-drop db-reset db-info

# Variáveis
DOCKER_COMPOSE := docker compose
COMPOSE_DEV := ../../base/docker-compose.yml
COMPOSE_DELIVERY := docker-compose.yml
DOCKER_USERNAME := bumab
IMAGE_API := $(DOCKER_USERNAME)/desafio-4tech-api
IMAGE_WEB := $(DOCKER_USERNAME)/desafio-4tech-web
TAG := 1.0.0

# Cores para output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

help: ## 📖 Mostra este guia de ajuda
	@printf "$(BLUE)╔════════════════════════════════════════════════════════════════╗$(NC)\n"
	@printf "$(BLUE)║     Desafio Técnico 4Tech - Makefile de Comandos            ║$(NC)\n"
	@printf "$(BLUE)╚════════════════════════════════════════════════════════════════╝$(NC)\n"
	@printf "\n"
	@printf "$(GREEN)Desenvolvimento:$(NC)\n"
	@printf "  $(YELLOW)make dev$(NC)           - Sobe ambiente de desenvolvimento (API + Web + DB)\n"
	@printf "  $(YELLOW)make dev-down$(NC)      - Para ambiente de desenvolvimento\n"
	@printf "  $(YELLOW)make dev-up$(NC)        - Sobe ambiente de desenvolvimento\n"
	@printf "  $(YELLOW)make dev-restart$(NC)   - Reinicia ambiente de desenvolvimento\n"
	@printf "\n"
	@printf "$(GREEN)Testes:$(NC)\n"
	@printf "  $(YELLOW)make test$(NC)          - Executa todos os testes (backend + frontend)\n"
	@printf "  $(YELLOW)make test-backend$(NC)  - Executa testes do backend (.NET)\n"
	@printf "  $(YELLOW)make test-frontend$(NC) - Executa testes do frontend (Angular)\n"
	@printf "  $(YELLOW)make test-e2e$(NC)      - Executa testes E2E (Playwright)\n"
	@printf "\n"
	@printf "$(GREEN)Build:$(NC)\n"
	@printf "  $(YELLOW)make build$(NC)         - Build completo (backend + frontend)\n"
	@printf "  $(YELLOW)make build-backend$(NC) - Build do backend (.NET)\n"
	@printf "  $(YELLOW)make build-frontend$(NC)- Build do frontend (Angular)\n"
	@printf "\n"
	@printf "$(GREEN)Limpeza:$(NC)\n"
	@printf "  $(YELLOW)make clean$(NC)         - Limpa build e artefatos\n"
	@printf "  $(YELLOW)make clean-docker$(NC)  - Para e remove containers Docker\n"
	@printf "  $(YELLOW)make clean-all$(NC)     - Limpeza completa (Docker + build)\n"
	@printf "\n"
	@printf "$(GREEN)Docker:$(NC)\n"
	@printf "  $(YELLOW)make docker-build$(NC)  - Build das imagens Docker\n"
	@printf "  $(YELLOW)make docker-push$(NC)   - Push das imagens para Docker Hub\n"
	@printf "\n"
	@printf "$(GREEN)Entrega:$(NC)\n"
	@printf "  $(YELLOW)make verify$(NC)        - Executa script de verificação\n"
	@printf "  $(YELLOW)make delivery$(NC)      - Build + push + verificação completa\n"
	@printf "  $(YELLOW)make delivery-build$(NC)- Build multi-arch das imagens de entrega\n"
	@printf "  $(YELLOW)make delivery-push$(NC) - Push das imagens de entrega\n"
	@printf "  $(YELLOW)make delivery-verify$(NC)- Verificação da entrega\n"
	@printf "\n"
	@printf "$(GREEN)Status:$(NC)\n"
	@printf "  $(YELLOW)make status$(NC)        - Mostra status dos containers Docker\n"
	@printf "  $(YELLOW)make logs$(NC)          - Mostra logs dos containers\n"
	@printf "  $(YELLOW)make logs-api$(NC)      - Mostra logs da API\n"
	@printf "  $(YELLOW)make logs-web$(NC)      - Mostra logs do Web\n"
	@printf "\n"
	@printf "$(GREEN)Úteis:$(NC)\n"
	@printf "  $(YELLOW)make health$(NC)        - Verifica health da API\n"
	@printf "  $(YELLOW)make swagger$(NC)       - Abre documentação Swagger\n"
	@printf "  $(YELLOW)make metrics$(NC)       - Verifica métricas Prometheus\n"
	@printf "\n"
	@printf "$(GREEN)Banco de Dados:$(NC)\n"
	@printf "  $(YELLOW)make db-migrate$(NC)    - Aplica migrações ao banco (requer dev rodando)\n"
	@printf "  $(YELLOW)make db-migration-add$(NC) - Cria nova migração (uso: make db-migration-add NOME)\n"
	@printf "  $(YELLOW)make db-migration-remove$(NC) - Remove última migração\n"
	@printf "  $(YELLOW)make db-migration-list$(NC) - Lista todas as migrações\n"
	@printf "  $(YELLOW)make db-migration-script$(NC) - Gera script SQL das migrações\n"
	@printf "  $(YELLOW)make db-drop$(NC)       - Remove o banco de dados (via Docker)\n"
	@printf "  $(YELLOW)make db-reset$(NC)      - Remove e recria o banco (via Docker)\n"
	@printf "  $(YELLOW)make db-info$(NC)       - Mostra informações sobre migrações\n"
	@printf "\n"

# ============================================================================
# Desenvolvimento
# ============================================================================

dev: ## 🚀 Sobe ambiente de desenvolvimento (API + Web + DB)
	@printf "$(BLUE)Subindo ambiente de desenvolvimento...$(NC)\n"
	$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) up -d
	@printf "$(GREEN)✓ Ambiente de desenvolvimento pronto!$(NC)\n"
	@printf "$(GREEN)  API: http://localhost:9999$(NC)\n"
	@printf "$(GREEN)  Web: http://localhost:4200$(NC)\n"
	@printf "$(GREEN)  Health: http://localhost:9999/health$(NC)\n"
	@printf "$(GREEN)  Swagger: http://localhost:9999/swagger$(NC)\n"

dev-down: ## 🛑 Para ambiente de desenvolvimento
	@printf "$(BLUE)Parando ambiente de desenvolvimento...$(NC)\n"
	$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) down
	@printf "$(GREEN)✓ Ambiente de desenvolvimento parado!$(NC)\n"

dev-up: ## 🚀 Sobe ambiente de desenvolvimento
	@printf "$(BLUE)Subindo ambiente de desenvolvimento...$(NC)\n"
	$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) up -d
	@printf "$(GREEN)✓ Ambiente de desenvolvimento pronto!$(NC)\n"

dev-restart: ## 🔄 Reinicia ambiente de desenvolvimento
	@printf "$(BLUE)Reiniciando ambiente de desenvolvimento...$(NC)\n"
	$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) restart
	@printf "$(GREEN)✓ Ambiente de desenvolvimento reiniciado!$(NC)\n"

# ============================================================================
# Testes
# ============================================================================

test: test-backend test-frontend ## 🧪 Executa todos os testes (backend + frontend)
	@printf "$(GREEN)✓ Todos os testes concluídos!$(NC)\n"

test-backend: ## 🧪 Executa testes do backend (.NET)
	@printf "$(BLUE)Executando testes do backend...$(NC)\n"
	cd ../../base/backend-dotnet && dotnet test
	@printf "$(GREEN)✓ Testes do backend concluídos!$(NC)\n"

test-frontend: ## 🧪 Executa testes do frontend (Angular)
	@printf "$(BLUE)Executando testes do frontend...$(NC)\n"
	cd ../../base/frontend-angular && npm test -- --watch=false --browsers=ChromeHeadless
	@printf "$(GREEN)✓ Testes do frontend concluídos!$(NC)\n"

test-e2e: ## 🧪 Executa testes E2E (Playwright)
	@printf "$(BLUE)Executando testes E2E...$(NC)\n"
	cd ../../base/frontend-angular && npm run e2e
	@printf "$(GREEN)✓ Testes E2E concluídos!$(NC)\n"

# ============================================================================
# Build
# ============================================================================

build: build-backend build-frontend ## 🔨 Build completo (backend + frontend)
	@printf "$(GREEN)✓ Build completo concluído!$(NC)\n"

build-backend: ## 🔨 Build do backend (.NET)
	@printf "$(BLUE)Build do backend...$(NC)\n"
	cd ../../base/backend-dotnet && dotnet build --configuration Release
	@printf "$(GREEN)✓ Build do backend concluído!$(NC)\n"

build-frontend: ## 🔨 Build do frontend (Angular)
	@printf "$(BLUE)Build do frontend...$(NC)\n"
	cd ../../base/frontend-angular && npm run build
	@printf "$(GREEN)✓ Build do frontend concluído!$(NC)\n"

# ============================================================================
# Limpeza
# ============================================================================

clean: ## 🧹 Limpa build e artefatos
	@printf "$(BLUE)Limpando build e artefatos...$(NC)\n"
	cd ../../base/backend-dotnet && dotnet clean
	cd ../../base/frontend-angular && rm -rf dist
	@printf "$(GREEN)✓ Build e artefatos limpos!$(NC)\n"

clean-docker: ## 🧹 Para e remove containers Docker
	@printf "$(BLUE)Limpando containers Docker...$(NC)\n"
	$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) down -v
	$(DOCKER_COMPOSE) -f $(COMPOSE_DELIVERY) down -v
	@printf "$(GREEN)✓ Containers Docker limpos!$(NC)\n"

clean-all: clean clean-docker ## 🧹 Limpeza completa (Docker + build)
	@printf "$(GREEN)✓ Limpeza completa concluída!$(NC)\n"

# ============================================================================
# Docker
# ============================================================================

docker-build: ## 🐳 Build das imagens Docker
	@printf "$(BLUE)Build das imagens Docker...$(NC)\n"
	$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) build
	@printf "$(GREEN)✓ Imagens Docker buildadas!$(NC)\n"

docker-push: ## 🐳 Push das imagens para Docker Hub
	@printf "$(BLUE)Push das imagens para Docker Hub...$(NC)\n"
	docker push $(IMAGE_API):$(TAG)
	docker push $(IMAGE_WEB):$(TAG)
	@printf "$(GREEN)✓ Imagens pushadas para Docker Hub!$(NC)\n"

# ============================================================================
# Entrega
# ============================================================================

verify: ## ✅ Executa script de verificação
	@printf "$(BLUE)Executando verificação...$(NC)\n"
	../../verificar.sh .
	@printf "$(GREEN)✓ Verificação concluída!$(NC)\n"

delivery-build: ## 📦 Build multi-arch das imagens de entrega
	@printf "$(BLUE)Build multi-arch das imagens de entrega...$(NC)\n"
	docker buildx create --name multiarch-builder --use 2>/dev/null || docker buildx use multiarch-builder
	docker buildx build --platform linux/amd64,linux/arm64 -t $(IMAGE_API):$(TAG) --push ../../base/backend-dotnet
	docker buildx build --platform linux/amd64,linux/arm64 -t $(IMAGE_WEB):$(TAG) --push ../../base/frontend-angular
	@printf "$(GREEN)✓ Build multi-arch concluído!$(NC)\n"

delivery-push: ## 📤 Push das imagens de entrega
	@printf "$(BLUE)Push das imagens de entrega...$(NC)\n"
	docker push $(IMAGE_API):$(TAG)
	docker push $(IMAGE_WEB):$(TAG)
	@printf "$(GREEN)✓ Imagens de entrega pushadas!$(NC)\n"

delivery-verify: ## ✅ Verificação da entrega
	@printf "$(BLUE)Verificação da entrega...$(NC)\n"
	../../verificar.sh .
	@printf "$(GREEN)✓ Verificação da entrega concluída!$(NC)\n"

delivery: delivery-build delivery-verify ## 📦 Build + push + verificação completa
	@printf "$(GREEN)✓ Processo de entrega concluído!$(NC)\n"

# ============================================================================
# Status
# ============================================================================

status: ## 📊 Mostra status dos containers Docker
	@printf "$(BLUE)Status dos containers Docker:$(NC)\n"
	$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) ps

logs: ## 📋 Mostra logs dos containers
	@printf "$(BLUE)Logs dos containers:$(NC)\n"
	$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) logs -f

logs-api: ## 📋 Mostra logs da API
	@printf "$(BLUE)Logs da API:$(NC)\n"
	$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) logs -f api

logs-web: ## 📋 Mostra logs do Web
	@printf "$(BLUE)Logs do Web:$(NC)\n"
	$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) logs -f web

# ============================================================================
# Úteis
# ============================================================================

health: ## 🏥 Verifica health da API
	@printf "$(BLUE)Verificando health da API...$(NC)\n"
	@curl -s http://localhost:9999/health | jq . || curl -s http://localhost:9999/health

swagger: ## 📚 Abre documentação Swagger
	@printf "$(BLUE)Abrindo Swagger...$(NC)\n"
	@xdg-open http://localhost:9999/swagger 2>/dev/null || open http://localhost:9999/swagger 2>/dev/null || printf "Abra http://localhost:9999/swagger no navegador\n"

metrics: ## 📊 Verifica métricas Prometheus
	@printf "$(BLUE)Verificando métricas Prometheus...$(NC)\n"
	@curl -s http://localhost:9999/metrics

# ============================================================================
# Banco de Dados
# ============================================================================

db-migrate: ## 🗄️ Aplica migrações ao banco (requer ambiente dev rodando)
	@printf "$(BLUE)Aplicando migrações ao banco...$(NC)\n"
	@printf "$(YELLOW)Nota: O ambiente de desenvolvimento precisa estar rodando (make dev)$(NC)\n"
	cd ../../base/backend-dotnet && dotnet ef database update --project src/Desafio.Api
	@printf "$(GREEN)✓ Migrações aplicadas com sucesso!$(NC)\n"

db-migration-add: ## ➕ Cria nova migração (uso: make db-migration-add NOME)
	@if [ -z "$(NAME)" ]; then \
		printf "$(RED)Erro: Informe o nome da migração$(NC)\n"; \
		printf "$(YELLOW)Uso: make db-migration-add NOME$(NC)\n"; \
		exit 1; \
	fi
	@printf "$(BLUE)Criando migração: $(NAME)$(NC)\n"
	@printf "$(YELLOW)Nota: O ambiente de desenvolvimento precisa estar rodando (make dev)$(NC)\n"
	cd ../../base/backend-dotnet && dotnet ef migrations add $(NAME) --project src/Desafio.Api
	@printf "$(GREEN)✓ Migração $(NAME) criada com sucesso!$(NC)\n"

db-migration-remove: ## ➖ Remove última migração
	@printf "$(BLUE)Removendo última migração...$(NC)\n"
	@printf "$(YELLOW)Nota: O ambiente de desenvolvimento precisa estar rodando (make dev)$(NC)\n"
	cd ../../base/backend-dotnet && dotnet ef migrations remove --project src/Desafio.Api
	@printf "$(GREEN)✓ Última migração removida com sucesso!$(NC)\n"

db-migration-list: ## 📋 Lista todas as migrações
	@printf "$(BLUE)Listando todas as migrações...$(NC)\n"
	@printf "$(YELLOW)Nota: O ambiente de desenvolvimento precisa estar rodando (make dev)$(NC)\n"
	cd ../../base/backend-dotnet && dotnet ef migrations list --project src/Desafio.Api

db-migration-script: ## 📝 Gera script SQL das migrações
	@printf "$(BLUE)Gerando script SQL das migrações...$(NC)\n"
	@printf "$(YELLOW)Nota: O ambiente de desenvolvimento precisa estar rodando (make dev)$(NC)\n"
	cd ../../base/backend-dotnet && dotnet ef migrations script --project src/Desafio.Api --output migrations.sql
	@printf "$(GREEN)✓ Script SQL gerado em migrations.sql$(NC)\n"

db-drop: ## 💣 Remove o banco de dados (via Docker Compose)
	@printf "$(RED)ATENÇÃO: Isso vai remover o banco de dados completo!$(NC)\n"
	@printf "$(YELLOW)Tem certeza? (s/N): $(NC)"; \
	read answer; \
	if [ "$$answer" = "s" ] || [ "$$answer" = "S" ]; then \
		printf "$(BLUE)Removendo banco de dados...$(NC)\n"; \
		$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) down -v; \
		$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) up -d postgres; \
		printf "$(GREEN)✓ Banco de dados removido!$(NC)\n"; \
	else \
		printf "$(YELLOW)Operação cancelada.$(NC)\n"; \
	fi

db-reset: ## 🔄 Remove e recria o banco (reset completo via Docker Compose)
	@printf "$(RED)ATENÇÃO: Isso vai remover e recriar o banco de dados completo!$(NC)\n"
	@printf "$(YELLOW)Tem certeza? (s/N): $(NC)"; \
	read answer; \
	if [ "$$answer" = "s" ] || [ "$$answer" = "S" ]; then \
		printf "$(BLUE)Resetando banco de dados...$(NC)\n"; \
		$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) down -v; \
		$(DOCKER_COMPOSE) -f $(COMPOSE_DEV) up -d; \
		printf "$(GREEN)✓ Banco de dados resetado com sucesso!$(NC)\n"; \
	else \
		printf "$(YELLOW)Operação cancelada.$(NC)\n"; \
	fi

db-info: ## ℹ️ Mostra informações sobre migrações
	@printf "$(BLUE)=== Informações sobre Migrações Entity Framework ===$(NC)\n"
	@printf "\n"
	@printf "$(GREEN)Como funciona neste projeto:$(NC)\n"
	@printf "  - Migrações são aplicadas automaticamente na subida do container$(NC)\n"
	@printf "  - O AppDbContext roda as migrações no startup$(NC)\n"
	@printf "  - Comandos EF requerem o ambiente dev rodando (make dev)$(NC)\n"
	@printf "\n"
	@printf "$(GREEN)Localização das migrações:$(NC)\n"
	@printf "  ../../base/backend-dotnet/src/Desafio.Api/Infraestrutura/Persistence/Migrations/$(NC)\n"
	@printf "\n"
	@printf "$(GREEN)Fluxo típico de desenvolvimento:$(NC)\n"
	@printf "  1. make dev                    # Sobe ambiente$(NC)\n"
	@printf "  2. make db-migration-add NAME # Cria nova migração$(NC)\n"
	@printf "  3. make db-migrate             # Aplica migrações$(NC)\n"
	@printf "  4. make test-backend          # Testa as mudanças$(NC)\n"
	@printf "\n"
	@printf "$(GREEN)Para ambiente de produção:$(NC)\n"
	@printf "  - Migrações são aplicadas automaticamente no startup$(NC)\n"
	@printf "  - Não há comando manual necessário$(NC)\n"
	@printf "\n"
	@printf "$(GREEN)Para gerar script SQL:$(NC)\n"
	@printf "  make db-migration-script       # Gera migrations.sql$(NC)\n"
	@printf "\n"
