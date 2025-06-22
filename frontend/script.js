//referencias aos elementos do html
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const prazoInput = document.getElementById('prazo-input');
const taskList = document.getElementById('task-list');

//url da nossa api backend
const apiUrl = 'http://localhost:3000/api/tarefas';

//funcao para buscar as tarefas da api e exibir na tela
async function fetchTarefas() {
  try {
    const response = await fetch(apiUrl);
    const tarefas = await response.json();

    //limpa a lista atual antes de adicionar as novas
    taskList.innerHTML = '';

    //cria um elemento de lista para cada tarefa
    tarefas.forEach(tarefa => {
      const item = document.createElement('li');
      item.className = 'task-item';
      if (tarefa.timestampRealizacao) {
        item.classList.add('completed');
      }

      // formata a data do prazo, se existir
      const prazoFormatado = tarefa.timestampPrazo ? 
        ` (Prazo: ${new Date(tarefa.timestampPrazo).toLocaleString('pt-BR')})` : '';

      item.innerHTML = `
        <span class="task-description">${tarefa.descricao}${prazoFormatado}</span>
        <div class="actions">
          <button class="complete-btn" onclick="concluirTarefa(${tarefa.idTarefa})">Concluir</button>
          <button class="delete-btn" onclick="excluirTarefa(${tarefa.idTarefa})">Excluir</button>
        </div>
      `;
      taskList.appendChild(item);
    });
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
  }
}

//funcao para adicionar uma nova tarefa
async function adicionarTarefa(event) {
  event.preventDefault(); //evita que o formulario recarregue a pagina

  const descricao = taskInput.value;
  const prazo = prazoInput.value;

  const body = { descricao };
  if (prazo) {
    body.timestampPrazo = prazo;
  }

  try {
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    taskInput.value = ''; //limpa o campo de input
    prazoInput.value = ''; //limpa o campo de prazo
    fetchTarefas(); //atualiza a lista
  } catch (error) {
    console.error('Erro ao adicionar tarefa:', error);
  }
}

//funcao para marcar tarefa como concluida
async function concluirTarefa(id) {
  try {
    await fetch(`${apiUrl}/${id}/concluir`, { method: 'PUT' });
    fetchTarefas(); //atualiza a lista
  } catch (error) {
    console.error('Erro ao concluir tarefa:', error);
  }
}

//funcao para excluir uma tarefa
async function excluirTarefa(id) {
  try {
    await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
    fetchTarefas(); //atualiza a lista
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
  }
}

//adiciona o 'escutador' de evento para o formulario
taskForm.addEventListener('submit', adicionarTarefa);

//busca as tarefas iniciais quando a pagina carrega
fetchTarefas();