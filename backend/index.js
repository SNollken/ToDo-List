//importando o express
const express = require('express');
const cors = require('cors'); //importando o cors

//configurando o knex para nosso projeto
const knex = require('knex')(require('./knexfile')['development']);

//criando uma instancia do express
const app = express();

//ativando o cors para todas as rotas
app.use(cors()); // NOVO: ativando o porteiro amigavel


//avisando para o express usar json no corpo das requisicoes
app.use(express.json());

//definindo a porta do servidor
const PORT = 3000;

// ----- endpoints da api -----

//endpoint para listar todas as tarefas (get) (R do CRUD)
app.get('/api/tarefas', async (req, res) => {
  try {
    //usando o knex para fazer um select na tabela de tarefas
    const tarefas = await knex('tarefas').select('*')
    .whereNull('timestampExclusao') //filtra para nao trazer tarefas excluidas
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

//endpoint para atualizar uma tarefa como concluida (update) (U do CRUD)
app.put('/api/tarefas/:id/concluir', async (req, res) => {
  try {
    //pegando o id da tarefa pelos parametros da rota
    const { id } = req.params;

    //usando o knex para encontrar a tarefa pelo id e atualizar ela
    const atualizadas = await knex('tarefas')
      .where({ idTarefa: id })
      .update({
        timestampRealizacao: new Date() //coloca a data e hora atual
      });
    
    //o knex retorna 0 se nao encontrou ninguem com o id, e 1 se atualizou
    if (atualizadas === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    //se tudo deu certo, retorna uma mensagem de sucesso
    res.status(200).json({ message: `Tarefa '${id}' marcada como concluída.` });

  } catch (error) {
    //em caso de erro, devolve uma mensagem de erro
    res.status(500).json({ message: 'Erro ao atualizar tarefa', error: error.message });
  }
});

//endpoint para excluir uma tarefa (exclusao logica) (D do CRUD)
app.delete('/api/tarefas/:id', async (req, res) => {
  try {
    //pegando o id da tarefa pelos parametros da rota
    const { id } = req.params;

    //usando o knex para encontrar a tarefa pelo id e marcar como excluida
    const atualizadas = await knex('tarefas')
      .where({ idTarefa: id })
      .update({
        timestampExclusao: new Date() //coloca a data e hora atual da exclusao
      });
    
    //se nao encontrou, retorna 404
    if (atualizadas === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    //se deu certo, retorna mensagem de sucesso
    res.status(200).json({ message: `Tarefa '${id}' excluída com sucesso.` });

  } catch (error) {
    //em caso de erro, devolve uma mensagem de erro
    res.status(500).json({ message: 'Erro ao excluir tarefa', error: error.message });
  }
});
// ----- fim dos endpoints -----


//fazendo o servidor "escutar" por requisicoes na porta definida
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});