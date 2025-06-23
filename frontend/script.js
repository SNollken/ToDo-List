// Espera o HTML carregar completamente antes de rodar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- Referências aos elementos do HTML ---
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    const taskList = document.getElementById('task-list');
    const errorMessage = document.getElementById('error-message');
    const emptyState = document.getElementById('empty-state');

    // --- URL da nossa API Backend ---
    const apiUrl = 'http://localhost:3000/api/tarefas';

    // --- Funções Principais ---

    /**
     * Busca as tarefas do servidor e chama a função para renderizá-las na tela.
     */
    const fetchTasks = async () => {
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error('Erro ao buscar tarefas do servidor.');
        }
        const tasksFromServer = await response.json();
        // Passa os dados recebidos do servidor para a função que desenha na tela
        renderTasks(tasksFromServer); 
      } catch (error) {
        console.error("Falha ao buscar e renderizar tarefas:", error);
        errorMessage.textContent = 'Não foi possível carregar as tarefas.';
      }
    };

    /**
     * Recebe um array de tarefas e as desenha na lista (UL) do HTML.
     * @param {Array} tasks - O array de objetos de tarefa.
     */
    const renderTasks = (tasks) => {
      // 1. Limpa a lista atual para não duplicar tarefas
      taskList.innerHTML = '';

      // 2. Verifica se a lista está vazia e mostra uma mensagem se for o caso
      if (tasks.length === 0) {
        emptyState.style.display = 'block';
      } else {
        emptyState.style.display = 'none';
      }

      // 3. Para cada tarefa no array, cria um elemento <li> e o adiciona à lista
      tasks.forEach(task => {
        const listItem = document.createElement('li');
        listItem.className = `task-item ${task.timestampRealizacao ? 'completed' : ''}`;
        listItem.dataset.id = task.idTarefa; // Guarda o ID da tarefa no elemento HTML

        const prazoCompleto = task.timestampPrazo ? new Date(task.timestampPrazo) : null;
        const prazoFormatado = prazoCompleto ? prazoCompleto.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

        // 4. Constrói o HTML interno de cada item da lista
        listItem.innerHTML = `
            <div class="task-item-content">
                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.timestampRealizacao ? 'checked' : ''}
                />
                <div class="task-details">
                    <div class="task-text">${task.descricao}</div>
                    ${prazoFormatado ? `
                    <div class="task-meta">
                        <span class="task-meta-item">
                            <svg class="task-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            Prazo: ${prazoFormatado}
                        </span>
                    </div>
                    ` : ''}
                </div>
            </div>
            <button class="delete-button" aria-label="Remover tarefa">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
            </button>
        `;
        // 5. Adiciona o item recém-criado à lista na tela
        taskList.appendChild(listItem);
      });
    };
    
    // --- Funções de Evento ---

    /**
     * É chamada quando o formulário de nova tarefa é enviado.
     */
    const addTask = async (e) => {
      e.preventDefault(); // Previne o recarregamento padrão da página

      const descricao = taskInput.value.trim();
      const date = dateInput.value;
      const time = timeInput.value;
      
      let timestampPrazo = null;
      if (date && time) {
        timestampPrazo = `${date}T${time}:00`;
      }

      if (!descricao) {
        errorMessage.textContent = "Por favor, digite uma tarefa.";
        return;
      }
      
      errorMessage.textContent = "";

      const newTaskData = {
        descricao: descricao,
        timestampPrazo: timestampPrazo
      };

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTaskData)
        });

        if (!response.ok) throw new Error('Erro ao salvar a tarefa.');

        // Limpa os campos do formulário
        taskInput.value = "";
        dateInput.value = "";
        timeInput.value = "";

        // Busca a lista de tarefas atualizada do servidor para mostrar a nova tarefa
        fetchTasks(); 
      } catch (error) {
        console.error(error);
        errorMessage.textContent = 'Falha ao adicionar a tarefa.';
      }
    };

    /**
     * É chamada quando há um clique na lista de tarefas (UL),
     * e descobre se o clique foi em uma checkbox ou em um botão de deletar.
     */
    const handleTaskListClick = async (e) => {
      const target = e.target;
      const parentLi = target.closest('.task-item');
      if (!parentLi) return;

      const taskId = parentLi.dataset.id;
      
      // Lógica para marcar como concluída
      if (target.classList.contains('task-checkbox')) {
        if (target.checked) {
           try {
              const response = await fetch(`${apiUrl}/${taskId}/concluir`, { method: 'PUT' });
              if (!response.ok) throw new Error('Erro ao concluir tarefa.');
              fetchTasks(); // Atualiza a lista
           } catch(error) {
              console.error(error);
              errorMessage.textContent = 'Falha ao concluir a tarefa.';
           }
        }
        // Nota: A lógica para "desmarcar" uma tarefa não foi implementada no backend.
      }

      // Lógica para remover a tarefa
      if (target.closest('.delete-button')) {
         try {
            const response = await fetch(`${apiUrl}/${taskId}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Erro ao excluir tarefa.');
            fetchTasks(); // Atualiza a lista
         } catch(error) {
            console.error(error);
            errorMessage.textContent = 'Falha ao excluir a tarefa.';
         }
      }
    };

    // --- Inicialização da Aplicação ---

    // Adiciona os "escutadores" de eventos aos elementos HTML
    taskForm.addEventListener('submit', addTask);
    taskList.addEventListener('click', handleTaskListClick);

    // Carrega as tarefas iniciais do banco de dados ao carregar a página
    fetchTasks();
});