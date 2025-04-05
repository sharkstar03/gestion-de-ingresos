// Este archivo debe incluirse justo después de script.js
// Hace que el diseño moderno sea compatible con el script original

// Cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
    // Manejo del tema oscuro
    setupThemeToggle();
    
    // Navegación en la barra lateral
    setupSidebarNavigation();
});

// Función para manejar la navegación por pestañas desde la barra lateral
function setupSidebarNavigation() {
    const navItems = document.querySelectorAll('.nav-links li');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Simular clic en la pestaña correspondiente (para compatibilidad con el código original)
            document.querySelector(`.tab[data-tab="${tabId}"]`).click();
            
            // Actualizar clases activas en la navegación lateral
            navItems.forEach(navItem => {
                navItem.classList.remove('active');
            });
            
            this.classList.add('active');
        });
    });
}

// Función para manejar el tema oscuro
function setupThemeToggle() {
    // Detectar preferencia de tema del sistema
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Cargar preferencia guardada o usar la del sistema
    if (localStorage.getItem('dark-theme') === 'true' || 
        (prefersDarkScheme.matches && localStorage.getItem('dark-theme') !== 'false')) {
        document.body.classList.add('dark-theme');
        if (document.getElementById('theme-toggle')) {
            document.getElementById('theme-toggle').checked = true;
        }
    }
    
    // Manejar cambios en el switch
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', toggleDarkTheme);
    }
}

// Función para alternar el tema oscuro
function toggleDarkTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('dark-theme', document.body.classList.contains('dark-theme'));
    
    // Actualizar gráficos cuando cambia el tema
    if (window.updateFinanceChart) {
        updateFinanceChart();
    }
    
    if (document.getElementById('reports').classList.contains('active') && window.generateReport) {
        generateReport();
    }
}

// Sobrescribir la función renderExpenses para usar el nuevo diseño con íconos
// Guarda la función original
const originalRenderExpenses = window.renderExpenses;

window.renderExpenses = function() {
    const expensesContainer = document.getElementById('expenses-list');
    if (!expensesContainer) return;
    
    expensesContainer.innerHTML = '';
    
    // Verificar si hay gastos para el mes y año seleccionados
    if (!window.expenses[window.selectedYear] || !window.expenses[window.selectedYear][window.selectedMonth] || 
        window.expenses[window.selectedYear][window.selectedMonth].length === 0) {
        expensesContainer.innerHTML = '<p class="no-items">No hay gastos registrados para este periodo.</p>';
        return;
    }
    
    // Ordenar gastos por fecha (más reciente primero)
    const sortedExpenses = [...window.expenses[window.selectedYear][window.selectedMonth]].sort((a, b) => {
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
};

// Sobrescribir la función renderIncomes para usar el nuevo diseño con íconos
// Guarda la función original
const originalRenderIncomes = window.renderIncomes;

window.renderIncomes = function() {
    const incomesContainer = document.getElementById('incomes-list');
    if (!incomesContainer) return;
    
    incomesContainer.innerHTML = '';
    
    // Verificar si hay ingresos para el mes y año seleccionados
    if (!window.incomes[window.selectedYear] || !window.incomes[window.selectedYear][window.selectedMonth] || 
        window.incomes[window.selectedYear][window.selectedMonth].length === 0) {
        incomesContainer.innerHTML = '<p class="no-items">No hay ingresos registrados para este periodo.</p>';
        return;
    }
    
    // Ordenar ingresos por fecha (más reciente primero)
    const sortedIncomes = [...window.incomes[window.selectedYear][window.selectedMonth]].sort((a, b) => {
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
};