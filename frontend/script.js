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
    // NOVO: Referência para a barra de busca
    const searchInput = document.getElementById('search-input');

    // --- URL da nossa API Backend ---
    const apiUrl = 'http://localhost:3000/api/tarefas';

    // NOVO: Variável para guardar a lista completa de tarefas para a busca
    let todasAsTarefas = [];

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
            
            // NOVO: Armazena a lista completa na variável mestra
            todasAsTarefas = tasksFromServer;
            
            // NOVO: Em vez de renderizar diretamente, chama a função de filtro
            renderFilteredTasks(); 
        } catch (error) {
            console.error("Falha ao buscar e renderizar tarefas:", error);
            errorMessage.textContent = 'Não foi possível carregar as tarefas.';
        }
    };

    /**
     * NOVO: Filtra a lista mestra com base na busca e chama a renderização.
     */
    const renderFilteredTasks = () => {
        // Pega o valor da busca e normaliza (minúsculas, sem espaços)
        const termoBusca = searchInput.value.toLowerCase().trim();

        // Filtra a lista de tarefas mestra
        const tarefasFiltradas = todasAsTarefas.filter(task => {
            // Retorna true se a descrição da tarefa incluir o termo buscado
            return task.descricao.toLowerCase().includes(termoBusca);
        });

        // Chama a função de renderização passando a lista já filtrada
        renderTasks(tarefasFiltradas);
    };

    /**
     * Recebe um array de tarefas e as desenha na lista (UL) do HTML.
     * @param {Array} tasksToRender - O array de objetos de tarefa para mostrar na tela.
     */
    const renderTasks = (tasksToRender) => {
        // 1. Limpa a lista atual para não duplicar tarefas
        taskList.innerHTML = '';

        // 2. Verifica se a lista a ser renderizada está vazia
        if (tasksToRender.length === 0) {
            emptyState.style.display = 'block';
            // Altera a mensagem se a lista está vazia por causa de uma busca sem resultados
            if (todasAsTarefas.length > 0 && searchInput.value) {
                emptyState.querySelector('p').textContent = 'Nenhuma tarefa encontrada com este termo.';
            } else {
                emptyState.querySelector('p').textContent = 'Ainda não há tarefas nesta lista! :P';
            }
        } else {
            emptyState.style.display = 'none';
        }

        // 3. Para cada tarefa no array, cria um elemento <li> e o adiciona à lista
        tasksToRender.forEach(task => {
            const listItem = document.createElement('li');
            listItem.className = `task-item ${task.timestampRealizacao ? 'completed' : ''}`;
            listItem.dataset.id = task.idTarefa; // Guarda o ID da tarefa no elemento HTML

            const prazoDate = task.timestampPrazo ? new Date(task.timestampPrazo) : null;
            const realizacaoDate = task.timestampRealizacao ? new Date(task.timestampRealizacao) : null;
            
            // Lógica para tarefa atrasada
            const isOverdue = prazoDate && !realizacaoDate && new Date() > prazoDate;
            const overdueClass = isOverdue ? 'overdue' : '';

            const formatOptions = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            const prazoFormatado = prazoDate ? prazoDate.toLocaleString('pt-BR', formatOptions) : '';
            const realizacaoFormatada = realizacaoDate ? realizacaoDate.toLocaleString('pt-BR', formatOptions) : '';

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
                        <div class="task-meta ${overdueClass}">
                            ${prazoFormatado ? `
                            <span class="task-meta-item">
                                <svg class="task-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                Prazo: ${prazoFormatado}
                            </span>
                            ` : ''}
                            ${realizacaoFormatada ? `
                            <span class="task-meta-item">
                                <svg class="task-meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                Concluída: ${realizacaoFormatada}
                            </span>
                            ` : ''}
                        </div>
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
        
        // Lógica para marcar/desmarcar como concluída
        if (target.classList.contains('task-checkbox')) {
            const isChecked = target.checked;
            const endpoint = isChecked ? `${apiUrl}/${taskId}/concluir` : `${apiUrl}/${taskId}/desmarcar`;
            const errorMessageText = isChecked ? 'Falha ao concluir a tarefa.' : 'Falha ao desmarcar a tarefa.';

            try {
                const response = await fetch(endpoint, { method: 'PUT' });
                if (!response.ok) throw new Error(`Erro na operação de ${isChecked ? 'concluir' : 'desmarcar'}.`);
                fetchTasks(); // Atualiza a lista
            } catch(error) {
                console.error(error);
                errorMessage.textContent = errorMessageText;
                target.checked = !isChecked; 
            }
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
    // NOVO: Adiciona o "escutador" para a busca
    searchInput.addEventListener('input', renderFilteredTasks);

    // Carrega as tarefas iniciais do banco de dados ao carregar a página
    fetchTasks();
});