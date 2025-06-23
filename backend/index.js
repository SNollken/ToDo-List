// backend/index.js

//-------------------------------------------------------------------
// SETUP INICIAL E IMPORTACOES
//-------------------------------------------------------------------
const express = require('express');
const cors = require('cors');

// NOVO: Importando nossa instância centralizada do Knex
const knex = require('./db');

//-------------------------------------------------------------------
// CONFIGURACAO DO APP EXPRESS
//-------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000;

app.get('/api/test', (req, res) => {
  console.log(">>> ROTA DE TESTE /api/test FOI ACIONADA!");
  res.status(200).json({ message: 'Se você está vendo isso, o servidor Express está funcionando!' });
});

//-------------------------------------------------------------------
// ENDPOINTS DA API (ROTAS)
//-------------------------------------------------------------------

app.get('/api/tarefas', async (req, res) => {
  try {
    console.log(">>> Rota GET /api/tarefas ACIONADA");
    const tarefas = await knex('tarefas')
      .whereNull('timestampExclusao')
      .select('*');

    res.json(tarefas);

  } catch (error) {
    console.error(">>> ERRO NA ROTA GET:", error); 
    res.status(500).json({ message: 'Erro ao buscar tarefas', error: error.message });
  }
});

app.post('/api/tarefas', async (req, res) => {
  try {
    const { descricao, timestampPrazo } = req.body;
    if (!descricao) {
      return res.status(400).json({ message: 'A descrição é obrigatória.' });
    }

    // Passo 1: Inserir a nova tarefa. 
    // Para o MySQL, o resultado do insert é um array com o ID do novo item.
    const [insertedId] = await knex('tarefas').insert({
      descricao: descricao,
      timestampPrazo: timestampPrazo
    });

    // Passo 2: Buscar a tarefa que acabamos de inserir usando o ID dela.
    const novaTarefa = await knex('tarefas')
      .where({ idTarefa: insertedId })
      .first(); // .first() pega o primeiro (e único) resultado diretamente.

    res.status(201).json({ message: 'Tarefa criada com sucesso!', tarefa: novaTarefa });

  } catch (error) {
    console.error(">>> ERRO NA ROTA POST:", error);
    res.status(500).json({ message: 'Erro ao criar tarefa', error: error.message });
  }
});

app.put('/api/tarefas/:id/concluir', async (req, res) => {
  try {
    const { id } = req.params;
    const atualizadas = await knex('tarefas')
      .where({ idTarefa: id })
      .update({
        timestampRealizacao: new Date()
      });

    if (atualizadas === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    res.status(200).json({ message: `Tarefa '${id}' marcada como concluída.` });

  } catch (error) {
    console.error(">>> ERRO NA ROTA PUT:", error);
    res.status(500).json({ message: 'Erro ao atualizar tarefa', error: error.message });
  }
});

app.delete('/api/tarefas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const atualizadas = await knex('tarefas')
      .where({ idTarefa: id })
      .update({
        timestampExclusao: new Date()
      });

    if (atualizadas === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    res.status(200).json({ message: `Tarefa '${id}' excluída com sucesso.` });

  } catch (error) {
    console.error(">>> ERRO NA ROTA DELETE:", error);
    res.status(500).json({ message: 'Erro ao excluir tarefa', error: error.message });
  }
});

//-------------------------------------------------------------------
// INICIALIZACAO DO SERVIDOR
//-------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});