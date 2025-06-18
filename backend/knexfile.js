//carrega as variaveis de ambiente do arquivo .env
require('dotenv').config();

//configuracao do knex
module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      //adicionamos a porta que o railway fornece
      port: parseInt(process.env.DB_PORT, 10)
    },
    migrations: {
      directory: './db/migrations'
    }
  }
};