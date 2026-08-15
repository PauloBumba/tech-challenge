# Testes E2E

Testes de ponta a ponta exercitam a aplicação **inteira rodando** — API, banco e interface
web juntos, pelo mesmo caminho que a avaliação usa (`docker compose up` + `verificar.sh`).
Seguem a mesma arquitetura da aplicação: o cenário navega a UI real e conversa com a API real,
sem mocks.

## Como executar

```bash
cd ../../..                    # base/
docker compose up --build -d   # sobe API + banco + web na porta 9999/4200
cd backend-dotnet
dotnet run --project src/Desafio.Api   # ou deixe o compose cuidando
```

## Estrutura esperada

```
E2E/
├── Planos/       cenários do módulo de Planos (referência de padrão)
└── Beneficiarios/ cenários do módulo de Beneficiários
```

## Nota

A infraestrutura E2E (ex.: driver de navegador para a UI Angular) ainda não foi adicionada;
está prevista para a fase de frontend (TASK-FE). Enquanto isso, os cenários de integração em
`../Integracao/` já exercitam o contrato HTTP completo contra banco real via Testcontainers.