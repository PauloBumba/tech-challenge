# Código base da API de Beneficiários (.NET 10)

Ponto de partida do desafio. A especificação do comportamento esperado está em
[`SPEC.md`](../../SPEC.md), na raiz do repositório. A interface web que consome esta API está
descrita na seção 9 do mesmo documento.

## Como rodar

O `docker-compose.yml` fica um nível acima, em `base/`, e sobe a API, o banco e a interface
web juntos:

```bash
cd ..
docker compose up --build
```

A API sobe em `http://localhost:9999` junto com o PostgreSQL. O schema é criado
automaticamente por migrations e os cinco planos da carga inicial são inseridos na subida.

```bash
curl http://localhost:9999/health
curl http://localhost:9999/planos
```

A documentação OpenAPI fica em `http://localhost:9999/swagger`.

Para derrubar tudo, incluindo os dados, ainda em `base/`:

```bash
docker compose down -v
```

## Suíte de testes

```bash
dotnet test
```

Os testes sobem um PostgreSQL descartável em container, via Testcontainers, e a API apontando
para ele. **O Docker precisa estar rodando**, mas não é necessário subir o `docker-compose`
antes: a suíte cria e destrói o próprio banco, sem tocar no ambiente de desenvolvimento.

Na largada a suíte tem falhas. Elas são o mapa do que falta fazer: parte aponta defeito no
código existente, parte aponta funcionalidade ainda não implementada. A entrega esperada é
com tudo verde.

Os testes que você escrever para o que criar entram no mesmo projeto.

## Rodando fora do Docker

Requer .NET SDK 10 e um PostgreSQL acessível. A conexão vem da variável de ambiente
`ConnectionStrings__Postgres` (fonte da verdade); em desenvolvimento ela também pode ser
configurada em `appsettings.Development.json`. Fora do Docker:

```bash
cp ../../.env.example .env
set -a; source .env; set +a   # carrega ConnectionStrings__Postgres
dotnet run --project src/Desafio.Api
```

Para o `dotnet-ef` (migrations), a mesma variável é exigida — não há conexão hardcoded.

## Organização

```
base/backend-dotnet/
├── Desafio.sln
├── Dockerfile                     imagem da API, multi-stage
└── src/Desafio.Api/
    ├── Dominio/                   regras de negócio, sem dependência de framework
    │   ├── Entidades/             Plano.cs, Beneficiario.cs
    │   ├── Enums/                 StatusBeneficiario.cs
    │   └── Excecoes/              exceções de domínio e o status HTTP de cada uma
    ├── Aplicacao/                 orquestração dos casos de uso
    │   ├── Servicos/              PlanoServico.cs, BeneficiarioServico.cs
    │   └── Contratos/             DTOs de entrada e de filtro/paginação
    ├── Infraestrutura/            acesso a dados
    │   ├── AppDbContext.cs
    │   ├── CargaInicial.cs
    │   └── Migrations/
    ├── Api/                       apresentação
    │   ├── Controllers/
    │   ├── Contratos/             DTOs de saída e a configuração de JSON
    │   └── Middlewares/           tratamento centralizado de erro
    └── Program.cs
```

## Convenções

- JSON em `snake_case`, aplicado por `JsonPadrao`. Nomes em C# seguem PascalCase e a
  conversão é automática.
- Regra de negócio vive no domínio ou no serviço, nunca no controller.
- Erro previsto é lançado como exceção de domínio (`ValidacaoException`,
  `NaoEncontradoException`, `ConflitoException`, `NaoProcessavelException`) e convertido em
  resposta HTTP pelo `TratamentoDeErroMiddleware`. Controller não monta corpo de erro.
- Logs estruturados, com os valores passados como parâmetros do template e não interpolados
  na mensagem.

## Migrations

A ferramenta `dotnet-ef` está declarada no manifesto local de ferramentas:

```bash
dotnet tool restore
dotnet dotnet-ef migrations add NomeDaMigration --project src/Desafio.Api --output-dir Infraestrutura/Migrations
```

Migrations pendentes são aplicadas automaticamente quando a aplicação sobe.

## Estado da implementação

O módulo de **Planos** está completo e em conformidade com a `SPEC.md`. Use-o como
referência de padrão: é assim que o resto da aplicação deve ser escrito.

O módulo de **Beneficiários** está incompleto e apresenta defeitos. Parte deles tem teste
vermelho apontando na suíte pública; parte só aparece lendo a especificação e o código.
