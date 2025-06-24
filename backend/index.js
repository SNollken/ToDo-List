//-------------------------------------------------------------------
// SETUP INICIAL E IMPORTACOES
//-------------------------------------------------------------------

//importando o express
//o express eh uma biblioteca (framework) para node.js que simplifica a criacao de servidores web e apis.
//a linha abaixo 'chama' a biblioteca express para dentro do nosso arquivo.
const express = require('express');

//importando o cors
//cors eh um pacote que nos permite relaxar as politicas de seguranca do navegador
//para que nosso frontend (rodando em uma origem) possa fazer requisicoes para nosso backend (rodando em outra).
const cors = require('cors');

//configurando e inicializando o knex
//aqui, importamos a biblioteca knex e imediatamente a inicializamos com as nossas configuracoes.
//require('./knexfile') importa o arquivo de configuracao do knex.
//['development'] especifica que queremos usar o bloco de configuracoes de 'development' daquele arquivo.
const knex = require('knex')(require('./knexfile')['development']);

//-------------------------------------------------------------------
// CONFIGURACAO DO APP EXPRESS
//-------------------------------------------------------------------

//criando uma instancia do express
//a variavel 'app' sera nosso objeto principal para configurar e rodar o servidor.
const app = express();

//ativando o cors para todas as rotas
//app.use() eh como adicionamos 'middlewares' ao express. middlewares sao funcoes que rodam
//para toda requisicao que chega, antes de chegar nos nossos endpoints.
//aqui, estamos dizendo: 'use o cors para todas as requisições'.
app.use(cors());

//avisando para o express usar json no corpo das requisicoes
//este middleware ensina o express a 'ler' o formato json que enviamos no corpo (body) das
//requisicoes post e put. sem ele, req.body seria indefinido.
app.use(express.json());

//definindo a porta do servidor
//definimos uma constante para a porta de rede onde nosso servidor vai 'escutar'.
const PORT = 3000;

//-------------------------------------------------------------------
// ENDPOINTS DA API (ROTAS)
//-------------------------------------------------------------------

//----- [R]ead - Ler todas as tarefas -----
//este endpoint responde a requisicoes do tipo GET para o caminho '/api/tarefas'
app.get('/api/tarefas', async (req, res) => {
  //usamos 'async' para poder usar 'await' dentro da funcao, o que facilita lidar com operacoes demoradas (como falar com o banco).
  //'req' (request) contem os dados da requisicao que o cliente enviou.
  //'res' (response) eh o objeto que usamos para enviar uma resposta de volta para o cliente.

  //o bloco try...catch eh uma 'rede de seguranca'. tentamos executar o codigo no 'try'.
  //se qualquer erro acontecer, o programa pula para o 'catch' em vez de quebrar.
  try {
    //'await' pausa a execucao da funcao ate que a operacao com o banco de dados termine.
    //knex('tarefas') diz que queremos operar na tabela 'tarefas'.
    //.whereNull('timestampExclusao') filtra, trazendo apenas as tarefas que nao foram excluidas logicamente.
    //.select('*') eh o comando para selecionar todas as colunas.
    const tarefas = await knex('tarefas')
      .whereNull('timestampExclusao')
      .select('*');
    
    //se a busca no banco deu certo, enviamos a lista de tarefas de volta como resposta, em formato json.
    res.json(tarefas);

  } catch (error) {
    //se algo deu errado no bloco 'try', o erro eh capturado aqui.
    //enviamos um status de erro http 500 (erro interno do servidor) e uma mensagem json com o detalhe do erro.
    res.status(500).json({ message: 'Erro ao buscar tarefas', error: error.message });
  }
});

//----- [C]reate - Criar uma nova tarefa -----
//este endpoint responde a requisicoes do tipo POST para '/api/tarefas'
app.post('/api/tarefas', async (req, res) => {
  try {
    //pegamos os dados enviados pelo cliente no corpo (body) da requisicao.
    //usamos 'desestruturacao' para pegar 'descricao' e 'timestampPrazo' diretamente de req.body.
    const { descricao, timestampPrazo } = req.body;

    //fazemos uma validacao simples para garantir que o campo obrigatorio foi enviado.
    if (!descricao) {
      //se a descricao nao existe, retornamos um erro 400 (bad request) e paramos a execucao.
      return res.status(400).json({ message: 'A descrição é obrigatória.' });
    }

    //knex('tarefas').insert({...}) eh o comando para inserir um novo registro.
    //passamos um objeto onde as chaves sao os nomes das colunas e os valores sao os dados que queremos inserir.
    //.returning('*') eh um comando especial que pede ao banco para devolver a linha inteira que foi acabou de ser criada.
    //o resultado de .returning eh sempre um array, por isso usamos [novaTarefa] para pegar o primeiro (e unico) item.
    const [novaTarefa] = await knex('tarefas').insert({
      descricao: descricao,
      timestampPrazo: timestampPrazo //sera nulo se nao for enviado
    }).returning('*');

    //se a insercao deu certo, retornamos o status 201 (created), que eh o codigo http correto para criacao de recurso.
    //tambem enviamos uma mensagem de sucesso e o objeto da tarefa criada.
    res.status(201).json({ message: 'Tarefa criada com sucesso!', tarefa: novaTarefa });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar tarefa', error: error.message });
  }
});

//----- [U]pdate - Marcar tarefa como concluida -----
//este endpoint responde a requisicoes do tipo PUT para um caminho dinamico.
//':id' eh um 'parametro de rota'. ele age como uma variavel na url.
app.put('/api/tarefas/:id/concluir', async (req, res) => {
  try {
    //pegamos o valor do parametro :id diretamente da url atraves de req.params.
    const { id } = req.params;

    //knex('tarefas').where({...}) seleciona a linha que queremos alterar.
    //.update({...}) realiza a alteracao na linha encontrada pelo 'where'.
    //estamos definindo o 'timestampRealizacao' para a data e hora atuais.
    const atualizadas = await knex('tarefas')
      .where({ idTarefa: id })
      .update({
        timestampRealizacao: new Date()
      });
    
    //o metodo .update() do knex retorna o numero de linhas que foram alteradas.
    //se o numero for 0, significa que nenhuma tarefa com o 'id' fornecido foi encontrada.
    if (atualizadas === 0) {
      //retornamos o status 404 (not found).
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    //se a atualizacao deu certo (atualizadas > 0), retornamos o status 200 (ok) e uma mensagem de sucesso.
    res.status(200).json({ message: `Tarefa '${id}' marcada como concluída.` });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar tarefa', error: error.message });
  }
});

// ----- [U]pdate - Desmarcar tarefa como concluida -----
app.put('/api/tarefas/:id/desmarcar', async (req, res) => {
    try {
        const { id } = req.params;

        const atualizadas = await knex('tarefas')
            .where({ idTarefa: id })
            .update({
                timestampRealizacao: null
            });

        if (atualizadas === 0) {
            return res.status(404).json({ message: 'Tarefa não encontrada.' });
        }

        res.status(200).json({ message: `Tarefa '${id}' marcada como não concluída.` });

    } catch (error) {
        res.status(500).json({ message: 'Erro ao desmarcar tarefa', error: error.message });
    }
});


//----- [D]elete - Excluir uma tarefa (logicamente) -----
//este endpoint responde a requisicoes do tipo DELETE. semanticamente, eh para apagar um recurso.
app.delete('/api/tarefas/:id', async (req, res) => {
  try {
    //o processo eh identico ao de 'concluir', pegamos o id pela url.
    const { id } = req.params;

    //a diferenca eh que aqui, em vez de apagar a linha (o que seria uma ma pratica),
    //nos apenas fazemos um 'update' no campo 'timestampExclusao', marcando a data e hora
    //em que a tarefa foi 'excluida'. isso eh chamado de 'soft delete' ou 'exclusao logica'.
    const atualizadas = await knex('tarefas')
      .where({ idTarefa: id })
      .update({
        timestampExclusao: new Date()
      });
    
    //a logica de verificacao se a tarefa foi encontrada eh a mesma do update.
    if (atualizadas === 0) {
      return res.status(404).json({ message: 'Tarefa não encontrada.' });
    }

    //retornamos o status 200 (ok) e a mensagem de sucesso.
    res.status(200).json({ message: `Tarefa '${id}' excluída com sucesso.` });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao excluir tarefa', error: error.message });
  }
});

//-------------------------------------------------------------------
// INICIALIZACAO DO SERVIDOR
//-------------------------------------------------------------------

//fazendo o servidor "escutar" por requisicoes na porta definida
//app.listen() eh o comando que efetivamente 'liga' o nosso servidor.
//o segundo argumento, a funcao '() => {...}', eh um 'callback' que sera executado
//assim que o servidor estiver no ar e pronto para receber requisicoes.
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});