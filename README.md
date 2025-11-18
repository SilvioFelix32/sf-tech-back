<h1 align="left">Sobre o projeto SfTech</h1>

###

<p align="left">Este é um projeto pessoal de e-commerce, onde utilizei Clean Architecture, Clean Code e as melhores práticas para desenvolvimento backend. O projeto foi construído com Nest.js, Prisma ORM e Jest, garantindo uma estrutura robusta, escalável e completamente testada</p>

## Demonstração:

 <p align="left">Este backend faz parte do projeto portifólio Sf-tech, veja mais em https://sf-tech-front.vercel.app/</p>

## Cobertura de testes 100%:

  <img src="public/test-coverage.jpeg"  alt="demonstration"  />
  
## 🛠 Tecnologias utilizadas

<h2 align="left">O backend foi desenvolvido com as seguintes tecnologias principais:</h2>

<p align="left">Nest.js – Framework para aplicações Node.js escaláveis e modulares.</p>
<p align="left">Prisma ORM – ORM moderno para manipulação eficiente do banco de dados.</p>
<p align="left">Jest – Framework de testes para garantir alta cobertura de código.</p>
<p align="left">Redis – Cache eficiente para otimizar a performance da aplicação.</p>
<p align="left">TypeScript – Tipagem estática para um código mais seguro e robusto.</p>
<p align="left">Outras bibliotecas importantes incluem: Passport.js (autenticação), Class-Validator (validações), Axios (requisições HTTP), Swagger (documentação da API), Cache Manager, UUID, e muito mais.
</p>

## ▶️ Rodando o projeto localmente:

### 📌 Instalação das dependências

yarn install

### 🔥 Executando o Redis

redis-server

### 🏃 Iniciando o servidor

yarn dev

## 🐳 Rodando o projeto com Docker:

### 📦 Opção 1: Usando Docker Compose (Recomendado)

O Docker Compose já configura automaticamente o PostgreSQL, Redis e a aplicação:

```bash
# Construir e iniciar todos os serviços
docker-compose up -d

# Ver os logs da aplicação
docker-compose logs -f app

# Parar os serviços
docker-compose down

# Parar e remover volumes (limpar dados)
docker-compose down -v
```

A aplicação estará disponível em `http://localhost:3003`

**Nota:** Certifique-se de ter um arquivo `.env` configurado na raiz do projeto antes de executar.

### 🔨 Opção 2: Build manual da imagem Docker

```bash
# Construir a imagem
docker build -t sf-tech-backend .

# Executar o container
docker run -p 3003:3003 --env-file .env sf-tech-backend
```

**Importante:** Com esta opção, você precisará ter PostgreSQL e Redis rodando separadamente (localmente ou em outros containers).

## 📜 Licença

Este projeto está sob a licença MIT.

Feito com 💖 por Silvio Félix.

Obrigado! 🌠
