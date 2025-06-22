//-------------------------------------------------------------------
// ARQUIVO DE MIGRACAO DO KNEX (..._create_tarefas_table.js)
//-------------------------------------------------------------------

//a funcao 'up' eh a funcao que o knex executa quando rodamos 'npx knex migrate:latest'.
//o trabalho dela eh aplicar uma mudanca no banco de dados, ou seja, evoluir o schema.
//neste caso, a mudanca eh criar a nossa tabela 'tarefas'.
exports.up = function(knex) {
  //'return' eh importante porque o knex lida com 'promises'. ao retornar a operacao do schema,
  //o knex sabe quando a operacao terminou para poder prosseguir.
  //knex.schema eh a parte do knex que lida com a estrutura do banco (criar/alterar/deletar tabelas).
  //.createTable() eh o comando para criar uma nova tabela.
  //'tarefas' eh o nome que damos a nossa tabela.
  //a funcao 'function(table) {...}' nos da um objeto 'table' que usamos para definir as colunas.
  return knex.schema.createTable('tarefas', function(table) {

    //----- definindo as colunas da tabela tarefas -----

    //cria uma coluna chamada 'idTarefa'.
    //.increments() cria uma coluna de numero inteiro que se auto-incrementa a cada novo registro (1, 2, 3...).
    //.primary() marca esta coluna como a chave primaria da tabela, o que garante que cada tarefa tera um id unico.
    table.increments('idTarefa').primary();

    //cria uma coluna chamada 'descricao'.
    //.string() cria uma coluna de texto (varchar no mysql).
    //'255' eh o tamanho maximo de caracteres que a coluna pode ter.
    //.notNullable() adiciona uma restricao 'not null', o que significa que esta coluna eh obrigatoria.
    //nao eh possivel criar uma tarefa sem uma descricao.
    table.string('descricao', 255).notNullable();

    //cria uma coluna chamada 'timestampInclusao'.
    //.timestamp() eh um tipo de coluna especifico para armazenar data e hora.
    //.defaultTo() define um valor padrao para a coluna caso nenhum seja fornecido na insercao.
    //knex.fn.now() eh uma funcao especial do knex que usa a funcao nativa do banco de dados (como now() no mysql)
    //para pegar a data e hora exatas do momento da insercao.
    table.timestamp('timestampInclusao').defaultTo(knex.fn.now());

    //cria a coluna 'timestampPrazo' para o prazo da tarefa.
    //.dateTime() eh outro tipo de coluna para data e hora.
    //.nullable() permite que esta coluna tenha o valor 'null' (vazio). isso faz sentido,
    //pois uma tarefa pode ser criada sem um prazo definido.
    table.dateTime('timestampPrazo').nullable();

    //cria a coluna 'timestampRealizacao'.
    //ela comeca como nula, e so sera preenchida quando a tarefa for marcada como concluida.
    table.dateTime('timestampRealizacao').nullable();

    //cria a coluna 'timestampExclusao'.
    //ela comeca como nula e so sera preenchida quando a tarefa for 'excluida' logicamente.
    //esta coluna eh a chave para o nosso sistema de 'soft delete'.
    table.dateTime('timestampExclusao').nullable();
  });
};

//a funcao 'down' eh o 'antidoto' da funcao 'up'.
//ela eh executada quando rodamos 'npx knex migrate:rollback'.
//o trabalho dela eh reverter exatamente o que a funcao 'up' fez.
exports.down = function(knex) {
  //se a funcao 'up' criou a tabela 'tarefas', a funcao 'down' deve apaga-la.
  //.dropTable() eh o comando do knex para deletar uma tabela inteira.
  //isso garante que podemos avancar e retroceder as versoes do nosso banco de dados de forma segura.
  return knex.schema.dropTable('tarefas');
};