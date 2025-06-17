//importando o express
const express = require('express');

//criando uma instancia do express
const app = express();

//definindo a porta do servidor
const PORT = 3000;

//fazendo o servidor "escutar" por requisicoes na porta definida
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});