Projeto: Lista de Tarefas
Esta é uma aplicação web completa (full-stack) para gerenciamento de uma lista de tarefas. O projeto consiste em um backend construído com Node.js, que expõe uma API REST para controlar as tarefas, e um frontend simples, construído com HTML, CSS e JavaScript puro, que consome essa API para fornecer uma interface gráfica ao usuário.

Integrantes do Grupo
Sofia Novaes
Vitor Dutra
Warley
Felipe

#Funcionalidades Principais 🚀
Criar uma nova tarefa com descrição e um prazo opcional.
Listar todas as tarefas ativas (que não foram excluídas).
Marcar uma tarefa como concluída.
Excluir uma tarefa (através de exclusão lógica, ou soft delete).
#Tecnologias Utilizadas 🛠️
Backend: Node.js, Express.js, Knex.js, mysql2, cors, dotenv
Frontend: HTML5, CSS3, JavaScript (com Fetch API)
Banco de Dados: MySQL (hospedado na nuvem via Railway.app)
Nossos Endpoints da API


Aqui estão os "caminhos" da nossa API que o frontend usa para conversar com o backend.

GET /api/tarefas

Descrição: Lista todas as tarefas que não foram excluídas.
POST /api/tarefas

Descrição: Cria uma nova tarefa.
Corpo (Body) esperado em formato JSON:
JSON
{
  "descricao": "Descrição da nova tarefa",
}
PUT /api/tarefas/:id/concluir

Descrição: Marca uma tarefa existente como concluída. O :id na URL deve ser o ID da tarefa.
DELETE /api/tarefas/:id

Descrição: Realiza a exclusão lógica de uma tarefa. O :id na URL deve ser o ID da tarefa a ser excluída.


#Como Rodar o Projeto
Este guia explica como configurar e executar o projeto a partir do código clonado.

Pré-requisitos
Node.js: Versão 18.x ou superior. É altamente recomendado gerenciar sua versão do Node com o nvm.
Git: Para clonar o repositório.

Passo a Passo
Clone o Repositório

Abra seu terminal e rode o comando:

cd backend
nvm use --lts

Instale todas as dependências do projeto:

npm install


Este projeto se conecta a um banco de dados na nuvem já existente. Para obter acesso, você precisa do arquivo .env com as credenciais.
Por motivos educacionais, deixei um arquivo com as credenciais do banco de dados em um txt.
Dentro da pasta backend, crie um novo arquivo chamado .env e cole o conteúdo dele.


Agora que tudo está configurado, inicie o servidor:

node index.js

O terminal deverá mostrar a mensagem Servidor rodando na porta 3000.
Importante: Deixe este terminal aberto. O backend precisa estar rodando para que o frontend funcione.

Execute o index.html e pronto!


Solução de Problemas Comuns
Problema: Erro Error: Cannot find module 'node:events' ao iniciar o servidor.

Causa: Seu terminal está usando uma versão antiga do Node.js.
Solução: Se você usa nvm, rode nvm use --lts no terminal antes de iniciar o servidor.

Problema: Erro Error: Cannot find module 'express' (ou 'knex', 'cors', etc.).

Causa: A pasta node_modules está faltando.
Solução: Na pasta backend, rode o comando npm install para reinstalar as dependências.
Problema: Erro net::ERR_CONNECTION_REFUSED no console do navegador.

Causa: O frontend não conseguiu se conectar ao backend porque o servidor não está rodando.
Solução: Verifique o terminal do backend e inicie o servidor com node index.js.

Problema: Nada acontece ao clicar nos botões (e há um erro de CORS no console).

Causa: O backend não está configurado para aceitar requisições do frontend.
Solução: Garanta que o pacote cors está instalado (npm install cors) e que as linhas const cors = require('cors'); e app.use(cors()); estão no seu arquivo backend/index.js.