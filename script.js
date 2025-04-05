// Actualización para renderExpenses() - Formato de elementos mejorado
function renderExpenses() {
    const expensesContainer = document.getElementById('expenses-list');
    if (!expensesContainer) return;
    
    expensesContainer.innerHTML = '';
    
    // Verificar si hay gastos para el mes y año seleccionados
    if (!expenses[selectedYear] || !expenses[selectedYear][selectedMonth] || 
        expenses[selectedYear][selectedMonth].length === 0) {
        expensesContainer.innerHTML = '<p class="no-items">No hay gastos registrados para este periodo.</p>';
        return;
    }
    
    // Ordenar gastos por fecha (más reciente primero)
    const sortedExpenses = [...expenses[selectedYear][selectedMonth]].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Crear elementos para cada gasto
    sortedExpenses.forEach((expense, index) => {
        const expenseElement = document.createElement('div');
        expenseElement.className = 'expense-item fade-in';
        
        // Formatear la categoría para mostrar con primera letra mayúscula
        const formattedCategory = expense.category.charAt(0).toUpperCase() + expense.category.slice(1);
        
        expenseElement.innerHTML = `
            <div class="item-details">
                <strong>${expense.name}</strong>
                <span class="category-tag">${formattedCategory}</span>
                <span class="date">${new Date(expense.date).toLocaleDateString()}</span>
                ${expense.description ? `<span class="description">${expense.description}</span>` : ''}
            </div>
            <span class="item-amount">$${expense.amount.toFixed(2)}</span>
            <div class="actions-container">
                <button class="btn-icon-small edit" onclick="editExpense(${index})" title="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-icon-small delete" onclick="deleteExpense(${index})" title="Eliminar">
                    <i class="fa-solid fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        expensesContainer.appendChild(expenseElement);
    });
}

// Actualización para renderIncomes() - Formato de elementos mejorado
function renderIncomes() {
    const incomesContainer = document.getElementById('incomes-list');
    if (!incomesContainer) return;
    
    incomesContainer.innerHTML = '';
    
    // Verificar si hay ingresos para el mes y año seleccionados
    if (!incomes[selectedYear] || !incomes[selectedYear][selectedMonth] || 
        incomes[selectedYear][selectedMonth].length === 0) {
        incomesContainer.innerHTML = '<p class="no-items">No hay ingresos registrados para este periodo.</p>';
        return;
    }
    
    // Ordenar ingresos por fecha (más reciente primero)
    const sortedIncomes = [...incomes[selectedYear][selectedMonth]].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Crear elementos para cada ingreso
    sortedIncomes.forEach((income, index) => {
        const incomeElement = document.createElement('div');
        incomeElement.className = 'income-item fade-in';
        
        // Formatear la categoría para mostrar con primera letra mayúscula
        const formattedCategory = income.category.charAt(0).toUpperCase() + income.category.slice(1);
        
        incomeElement.innerHTML = `
            <div class="item-details">
                <strong>${income.name}</strong>
                <span class="category-tag">${formattedCategory}</span>
                <span class="date">${new Date(income.date).toLocaleDateString()}</span>
                ${income.description ? `<span class="description">${income.description}</span>` : ''}
            </div>
            <span class="item-amount">$${income.amount.toFixed(2)}</span>
            <div class="actions-container">
                <button class="btn-icon-small edit" onclick="editIncome(${index})" title="Editar">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="btn-icon-small delete" onclick="deleteIncome(${index})" title="Eliminar">
                    <i class="fa-solid fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        incomesContainer.appendChild(incomeElement);
    });
}

// Actualización para updateFinanceChart() - Gráfico mejorado con colores que coinciden con el tema
function updateFinanceChart() {
    const chartCanvas = document.getElementById('finance-chart');
    if (!chartCanvas) return;
    
    // Destruir gráfico anterior si existe
    if (charts.financeChart) {
        charts.financeChart.destroy();
    }
    
    // Preparar datos para los últimos 6 meses
    const labels = [];
    const incomesData = [];
    const expensesData = [];
    
    // Obtener los últimos 6 meses
    for (let i = 5; i >= 0; i--) {
        let date = new Date(selectedYear, selectedMonth - i, 1);
        let month = date.getMonth();
        let year = date.getFullYear();
        
        labels.push(date.toLocaleString('default', { month: 'short' }));
        
        // Calcular totales para cada mes
        let monthExpense = 0;
        if (expenses[year] && expenses[year][month]) {
            monthExpense = expenses[year][month].reduce((acc, e) => acc + e.amount, 0);
        }
        
        let monthIncome = 0;
        if (incomes[year] && incomes[year][month]) {
            monthIncome = incomes[year][month].reduce((acc, i) => acc + i.amount, 0);
        }
        
        expensesData.push(monthExpense);
        incomesData.push(monthIncome);
    }
    
    // Obtener colores del tema actual
    const isDarkTheme = document.body.classList.contains('dark-theme');
    const incomeColor = getComputedStyle(document.documentElement).getPropertyValue('--income-color').trim();
    const expenseColor = getComputedStyle(document.documentElement).getPropertyValue('--expense-color').trim();
    const gridColor = isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary').trim();
    
    // Configuración del gráfico
    const chartConfig = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ingresos',
                    data: incomesData,
                    backgroundColor: incomeColor + '80', // 50% opacidad
                    borderColor: incomeColor,
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: 'Gastos',
                    data: expensesData,
                    backgroundColor: expenseColor + '80', // 50% opacidad
                    borderColor: expenseColor,
                    borderWidth: 2,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        color: textColor
                    }
                },
                tooltip: {
                    backgroundColor: isDarkTheme ? '#2d3748' : '#ffffff',
                    titleColor: isDarkTheme ? '#f7fafc' : '#2d3748',
                    bodyColor: isDarkTheme ? '#e2e8f0' : '#4a5568',
                    borderColor: isDarkTheme ? '#4a5568' : '#e2e8f0',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': $' + context.raw.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: gridColor,
                        drawBorder: false
                    },
                    ticks: {
                        color: textColor,
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    };
    
    // Crear el gráfico
    charts.financeChart = new Chart(chartCanvas, chartConfig);
}

// Mejora de la función showToast para usar el nuevo diseño
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Agregar icono según el tipo
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    // Añadir clase para animación
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Función para alternar el tema oscuro
function toggleDarkTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('dark-theme', document.body.classList.contains('dark-theme'));
    
    // Actualizar gráficos cuando cambia el tema
    updateFinanceChart();
    if (document.getElementById('reports').classList.contains('active')) {
        generateReport();
    }
}

// Agregar la siguiente función al final del script.js existente:
document.addEventListener('DOMContentLoaded', function() {
    // Código de inicialización existente...
    
    // Cargar preferencia de tema
    if (localStorage.getItem('dark-theme') === 'true' || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && 
         localStorage.getItem('dark-theme') !== 'false')) {
        document.body.classList.add('dark-theme');
        if (document.getElementById('theme-toggle')) {
            document.getElementById('theme-toggle').checked = true;
        }
    }
    
    // Agregar event listener para el toggle de tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleDarkTheme);
    }
    
    // Configurar navegación por pestañas desde la barra lateral
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Actualizar clases activas
            navItems.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Si cambiamos a la pestaña de reportes, generamos el reporte inicial
            if (tabId === 'reports') {
                generateReport();
            }
        });
    });
});
// Agregar estas funciones para asegurar la funcionalidad del tema oscuro

// Función para alternar el tema oscuro
function toggleDarkTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('dark-theme', document.body.classList.contains('dark-theme'));
    
    // Actualizar gráficos cuando cambia el tema
    updateFinanceChart();
    if (document.getElementById('reports').classList.contains('active')) {
        generateReport();
    }
}

// Añadir este código al final de la función setupEventListeners o initializeApp
// para manejar el cambio de tema
function setupThemeToggle() {
    // Cargar preferencia de tema
    if (localStorage.getItem('dark-theme') === 'true' || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches && 
         localStorage.getItem('dark-theme') !== 'false')) {
        document.body.classList.add('dark-theme');
    }
    
    // Toggle desde el botón de cambio de tema
    const themeToggleBtn = document.getElementById('toggle-theme');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleDarkTheme);
    }
}

// Versión mejorada de la función showToast para usar el nuevo diseño
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    // Agregar icono según el tipo
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    
    const container = document.getElementById('toast-container');
    container.appendChild(toast);
    
    // Añadir clase para animación
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Modificación de la función renderExpenses para usar el nuevo diseño con íconos
function renderExpenses() {
    const expensesContainer = document.getElementById('expenses-list');
    if (!expensesContainer) return;
    
    expensesContainer.innerHTML = '';
    
    // Verificar si hay gastos para el mes y año seleccionados
    if (!expenses[selectedYear] || !expenses[selectedYear][selectedMonth] || 
        expenses[selectedYear][selectedMonth].length === 0) {
        expensesContainer.innerHTML = '<p class="no-items">No hay gastos registrados para este periodo.</p>';
        return;
    }
    
    // Ordenar gastos por fecha (más reciente primero)
    const sortedExpenses = [...expenses[selectedYear][selectedMonth]].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Crear elementos para cada gasto
    sortedExpenses.forEach((expense, index) => {
        const expenseElement = document.createElement('div');
        expenseElement.className = 'expense-item fade-in';
        
        expenseElement.innerHTML = `
            <div class="item-details">
                <strong>${expense.name}</strong>
                <span class="category-tag">${expense.category}</span>
                <span class="date">${new Date(expense.date).toLocaleDateString()}</span>
                ${expense.description ? `<span class="description">${expense.description}</span>` : ''}
            </div>
            <span class="item-amount">$${expense.amount.toFixed(2)}</span>
            <div class="item-actions">
                <button class="edit" onclick="editExpense(${index})">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
                <button class="delete" onclick="deleteExpense(${index})">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </div>
        `;
        
        expensesContainer.appendChild(expenseElement);
    });
}

// Modificación de la función renderIncomes para usar el nuevo diseño con íconos
function renderIncomes() {
    const incomesContainer = document.getElementById('incomes-list');
    if (!incomesContainer) return;
    
    incomesContainer.innerHTML = '';
    
    // Verificar si hay ingresos para el mes y año seleccionados
    if (!incomes[selectedYear] || !incomes[selectedYear][selectedMonth] || 
        incomes[selectedYear][selectedMonth].length === 0) {
        incomesContainer.innerHTML = '<p class="no-items">No hay ingresos registrados para este periodo.</p>';
        return;
    }
    
    // Ordenar ingresos por fecha (más reciente primero)
    const sortedIncomes = [...incomes[selectedYear][selectedMonth]].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });
    
    // Crear elementos para cada ingreso
    sortedIncomes.forEach((income, index) => {
        const incomeElement = document.createElement('div');
        incomeElement.className = 'income-item fade-in';
        
        incomeElement.innerHTML = `
            <div class="item-details">
                <strong>${income.name}</strong>
                <span class="category-tag">${income.category}</span>
                <span class="date">${new Date(income.date).toLocaleDateString()}</span>
                ${income.description ? `<span class="description">${income.description}</span>` : ''}
            </div>
            <span class="item-amount">$${income.amount.toFixed(2)}</span>
            <div class="item-actions">
                <button class="edit" onclick="editIncome(${index})">
                    <i class="fa-solid fa-pen"></i> Editar
                </button>
                <button class="delete" onclick="deleteIncome(${index})">
                    <i class="fa-solid fa-trash"></i> Eliminar
                </button>
            </div>
        `;
        
        incomesContainer.appendChild(incomeElement);
    });
}

// Agrega esto al final de la función document.addEventListener('DOMContentLoaded', function() { ... })
setupThemeToggle();