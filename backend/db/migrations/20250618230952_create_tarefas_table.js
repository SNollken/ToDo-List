//a funcao up eh o que a migration vai fazer no banco
exports.up = function(knex) {
  return knex.schema.createTable('tarefas', function(table) {
    //definindo as colunas da tabela tarefas
    table.increments('idTarefa').primary();
    table.string('descricao', 255).notNullable();
    table.timestamp('timestampInclusao').defaultTo(knex.fn.now());
    table.dateTime('timestampPrazo').nullable();
    table.dateTime('timestampRealizacao').nullable();
    table.dateTime('timestampExclusao').nullable();
  });
};

//a funcao down eh o que a migration vai fazer se precisarmos voltar atras (rollback)
exports.down = function(knex) {
  return knex.schema.dropTable('tarefas');
};