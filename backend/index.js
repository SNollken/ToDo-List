//importando o express
const express = require('express');

//configurando o knex para nosso projeto
const knex = require('knex')(require('./knexfile')['development']);

//criando uma instancia do express
const app = express();
//avisando para o express usar json no corpo das requisicoes
app.use(express.json());

//definindo a porta do servidor
const PORT = 3000;

// ----- endpoints da api -----

//endpoint para listar todas as tarefas (get)
app.get('/api/tarefas', async (req, res) => {
  try {
    //usando o knex para fazer um select na tabela de tarefas
    const tarefas = await knex('tarefas').select('*');
    res.json(tarefas);
  } catch (error) {
    //em caso de erro, devolve uma mensagem de erro
    res.status(500).json({ message: 'Erro ao buscar tarefas', error: error.message });
  }
});

//endpoint para criar uma nova tarefa (post) (C do CRUD)
app.post('/api/tarefas', async (req, res) => {
  try {
    //pegando a descricao da tarefa do corpo da requisicao
    const { descricao, timestampPrazo } = req.body;

    //validacao simples para ver se a descricao foi enviada
    if (!descricao) {
      return res.status(400).json({ message: 'A descrição é obrigatória.' });
    }

    //usando o knex para inserir a nova tarefa no banco
    //o .returning() nos devolve os dados que foram inseridos
    const [novaTarefa] = await knex('tarefas').insert({
      descricao: descricao,
      timestampPrazo: timestampPrazo //sera nulo se nao for enviado
    }).returning('*');

    //se tudo deu certo, retorna um status 201 (created) e a tarefa criada
    res.status(201).json({ message: 'Tarefa criada com sucesso!', tarefa: novaTarefa });

  } catch (error) {
    //em caso de erro, devolve uma mensagem de erro
    res.status(500).json({ message: 'Erro ao criar tarefa', error: error.message });
  }
});
// ----- fim dos endpoints -----


//fazendo o servidor "escutar" por requisicoes na porta definida
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});