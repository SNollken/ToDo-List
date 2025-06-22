//-------------------------------------------------------------------
// ARQUIVO DE CONFIGURACAO DO KNEX (knexfile.js)
//-------------------------------------------------------------------

//carrega as variaveis de ambiente do arquivo .env
//esta linha precisa vir primeiro. ela le o nosso arquivo .env e carrega todas as variaveis
//que estao la (db_host, db_user, etc) para dentro de um objeto global do node.js
//chamado 'process.env'. assim, podemos acessar nossas senhas e segredos de forma segura.
require('dotenv').config();

//configuracao do knex
//module.exports eh a forma padrao do node.js de exportar um objeto deste arquivo,
//para que outras partes do nosso sistema (inclusive a ferramenta de linha de comando do knex)
//possam importa-lo e usa-lo.
module.exports = {

  //o knex permite configurar diferentes ambientes (desenvolvimento, teste, producao, etc).
  //aqui estamos definindo as configuracoes para o ambiente de 'development' (desenvolvimento),
  //que eh o que usamos enquanto programamos na nossa maquina.
  development: {

    //'client' diz ao knex qual 'dialeto' de sql ele deve usar.
    //'mysql2' eh o nome do pacote (driver) que usamos para nos conectarmos a um banco de dados mysql.
    client: 'mysql2',

    //o objeto 'connection' contem todas as credenciais para se conectar ao banco.
    connection: {

      //o endereco do servidor do banco de dados.
      //'process.env.db_host' pega o valor da variavel db_host que definimos no nosso arquivo .env.
      host: process.env.DB_HOST,

      //o nome de usuario para se conectar ao banco.
      //tambem vem do nosso arquivo .env.
      user: process.env.DB_USER,

      //a senha para o usuario do banco.
      //manter a senha aqui (e fora do github) eh o principal motivo de usarmos o .env.
      password: process.env.DB_PASSWORD,

      //o nome do banco de dados especifico ao qual queremos nos conectar.
      database: process.env.DB_DATABASE,

      //a porta de rede no servidor para a conexao com o banco.
      //as variaveis de ambiente sempre sao lidas como texto (string).
      //usamos a funcao 'parseint' para converter o texto da porta (ex: "29138") para um numero inteiro,
      //que eh o formato que o driver do banco de dados espera.
      port: parseInt(process.env.DB_PORT, 10)
    },

    //esta secao diz ao knex como ele deve lidar com os arquivos de migracao.
    migrations: {
      //'directory' especifica a pasta onde os nossos arquivos de migracao serao criados e lidos.
      //o comando 'npx knex migrate:make' usa essa configuracao para saber onde criar o arquivo.
      directory: './db/migrations'
    }
  }
  //aqui poderiam existir outros ambientes, como 'production': {} para o site no ar.
};