// Almacenamiento y estado global
let expenses = {};
let incomes = {};
let selectedMonth = new Date().getMonth();
let selectedYear = new Date().getFullYear();
let charts = {};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos del localStorage o desde un posible servicio de almacenamiento en la nube
    loadData();
    
    // Configurar interfaz
    setupDateSelectors();
    setupTabNavigation();
    setupEventListeners();
    
    // Actualizar la visualización
    updateUI();
});

// Cargar datos desde localStorage
function loadData() {
    try {
        expenses = JSON.parse(localStorage.getItem('monai_expenses')) || {};
        incomes = JSON.parse(localStorage.getItem('monai_incomes')) || {};
        
        // Migración de datos antiguos si existen
        const oldExpenses = JSON.parse(localStorage.getItem('expenses'));
        const oldIncomes = JSON.parse(localStorage.getItem('incomes'));
        
        if (oldExpenses && Object.keys(oldExpenses).length > 0 && Object.keys(expenses).length === 0) {
            expenses = oldExpenses;
            localStorage.setItem('monai_expenses', JSON.stringify(expenses));
            localStorage.removeItem('expenses');
            showToast('Datos antiguos de gastos migrados con éxito', 'success');
        }
        
        if (oldIncomes && Object.keys(oldIncomes).length > 0 && Object.keys(incomes).length === 0) {
            incomes = oldIncomes;
            localStorage.setItem('monai_incomes', JSON.stringify(incomes));
            localStorage.removeItem('incomes');
            showToast('Datos antiguos de ingresos migrados con éxito', 'success');
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
        showToast('Error al cargar datos. Se iniciará con datos vacíos.', 'error');
        expenses = {};
        incomes = {};
    }
}

// Configurar selectores de fecha
function setupDateSelectors() {
    // Establecer mes actual en el selector
    const monthSelect = document.getElementById('month-select');
    if (monthSelect) {
        monthSelect.value = selectedMonth;
        monthSelect.addEventListener('change', function() {
            selectedMonth = parseInt(this.value);
            updateUI();
        });
    }
    
    // Llenar y establecer el selector de año
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
        const currentYear = new Date().getFullYear();
        // Añadir 3 años anteriores y 2 futuros para selección
        for (let year = currentYear - 3; year <= currentYear + 2; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
        yearSelect.value = selectedYear;
        yearSelect.addEventListener('change', function() {
            selectedYear = parseInt(this.value);
            updateUI();
        });
    }
}

// Configurar navegación por pestañas
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Actualizar clases activas
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Si cambiamos a la pestaña de reportes, generamos el reporte inicial
            if (tabId === 'reports') {
                generateReport();
            }
        });
    });
    
    // Mostrar/ocultar fechas personalizadas en reportes
    const reportPeriod = document.getElementById('report-period');
    if (reportPeriod) {
        reportPeriod.addEventListener('change', function() {
            document.getElementById('custom-dates').style.display = 
                this.value === 'custom' ? 'block' : 'none';
        });
    }
    
    // Botón para generar reportes
    const generateReportBtn = document.getElementById('generate-report');
    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateReport);
    }
    
    // Botón para exportar datos
    const exportDataBtn = document.getElementById('export-data');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', exportData);
    }
}

// Configurar otros event listeners
function setupEventListeners() {
    // Establecer la fecha actual en los campos de fecha
    const today = new Date().toISOString().split('T')[0];
    const datePickers = document.querySelectorAll('input[type="date"]');
    datePickers.forEach(picker => {
        picker.value = today;
    });
}

// Actualizar toda la interfaz de usuario
function updateUI() {
    updateTotals();
    renderExpenses();
    renderIncomes();
    updateQuickSummary();
    updateFinanceChart();
}

// Actualizar los totales en el resumen
function updateTotals() {
    let totalExpenses = 0, totalIncomes = 0;
    
    // Calcular total de gastos
    if (expenses[selectedYear] && expenses[selectedYear][selectedMonth]) {
        totalExpenses = expenses[selectedYear][selectedMonth].reduce((acc, e) => acc + e.amount, 0);
    }
    
    // Calcular total de ingresos
    if (incomes[selectedYear] && incomes[selectedYear][selectedMonth]) {
        totalIncomes = incomes[selectedYear][selectedMonth].reduce((acc, i) => acc + i.amount, 0);
    }
    
    // Actualizar los elementos HTML
    // Actualizar los elementos HTML
    document.getElementById("total-expenses").textContent = totalExpenses.toFixed(2);

    // Configuración del gráfico
    const chartConfig = {
        type: 'bar',
        data: {
            datasets: [
                {
                    label: 'Ingresos',
                    data: incomesData,
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Gastos',
                    data: expensesData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Ingresos vs Gastos (Últimos 6 Meses)'
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Monto ($)'
                    }
                }
            }
        }
    };

    // Crear el gráfico
    new Chart(document.getElementById('chartCanvas'), chartConfig);
}

// Generate financial report
function generateReport() {
const reportType = document.getElementById('report-type').value;
const reportPeriod = document.getElementById('report-period').value;
const reportChartContainer = document.getElementById('report-chart');
const reportSummaryContainer = document.getElementById('report-summary');

// Clear previous report
if (charts.reportChart) {
charts.reportChart.destroy();
}
reportSummaryContainer.innerHTML = '';

// Determine date range
let startDate, endDate;
const now = new Date();
switch (reportPeriod) {
case 'month':
startDate = new Date(selectedYear, selectedMonth, 1);
endDate = new Date(selectedYear, selectedMonth + 1, 0);
break;
case 'quarter':
startDate = new Date(selectedYear, selectedMonth - 2, 1);
endDate = new Date(selectedYear, selectedMonth + 1, 0);
break;
case 'year':
startDate = new Date(selectedYear, 0, 1);
endDate = new Date(selectedYear, 11, 31);
break;
case 'custom':
startDate = new Date(document.getElementById('start-date').value);
endDate = new Date(document.getElementById('end-date').value);
break;
}

// Collect data based on report type
switch (reportType) {
case 'monthly':
generateMonthlyReport(startDate, endDate, reportChartContainer, reportSummaryContainer);
break;
case 'category':
generateCategoryReport(startDate, endDate, reportChartContainer, reportSummaryContainer);
break;
case 'trend':
generateTrendReport(startDate, endDate, reportChartContainer, reportSummaryContainer);
break;
}
}

// Monthly report generation
function generateMonthlyReport(startDate, endDate, chartContainer, summaryContainer) {
const monthLabels = [];
const expensesData = [];
const incomesData = [];

// Collect monthly data
let currentDate = new Date(startDate);
while (currentDate <= endDate) {
const year = currentDate.getFullYear();
const month = currentDate.getMonth();

monthLabels.push(new Date(year, month).toLocaleString('default', { month: 'short', year: 'numeric' }));

// Calculate total expenses
const monthExpenses = expenses[year] && expenses[year][month]
? expenses[year][month].reduce((acc, e) => acc + e.amount, 0)
: 0;

// Calculate total incomes
const monthIncomes = incomes[year] && incomes[year][month]
? incomes[year][month].reduce((acc, i) => acc + i.amount, 0)
: 0;

expensesData.push(monthExpenses);
incomesData.push(monthIncomes);

// Move to next month
currentDate.setMonth(currentDate.getMonth() + 1);
}

// Create chart
charts.reportChart = new Chart(chartContainer, {
type: 'line',
data: {
labels: monthLabels,
datasets: [
{
    label: 'Ingresos',
    data: incomesData,
    borderColor: 'rgb(75, 192, 192)',
    tension: 0.1
},
{
    label: 'Gastos',
    data: expensesData,
    borderColor: 'rgb(255, 99, 132)',
    tension: 0.1
}
]
},
options: {
responsive: true,
plugins: {
title: {
    display: true,
    text: 'Ingresos y Gastos Mensuales'
}
},
scales: {
y: {
    beginAtZero: true
}
}
}
});

// Generate summary
let totalExpenses = expensesData.reduce((a, b) => a + b, 0);
let totalIncomes = incomesData.reduce((a, b) => a + b, 0);

summaryContainer.innerHTML = `
<h3>Resumen del Reporte Mensual</h3>
<p><strong>Total de Ingresos:</strong> $${totalIncomes.toFixed(2)}</p>
<p><strong>Total de Gastos:</strong> $${totalExpenses.toFixed(2)}</p>
<p><strong>Balance:</strong> $${(totalIncomes - totalExpenses).toFixed(2)}</p>
`;
}

// Category report generation
function generateCategoryReport(startDate, endDate, chartContainer, summaryContainer) {
const expenseCategories = {};
const incomeCategories = {};

// Collect category data
let currentDate = new Date(startDate);
while (currentDate <= endDate) {
const year = currentDate.getFullYear();
const month = currentDate.getMonth();

// Process expenses
if (expenses[year] && expenses[year][month]) {
expenses[year][month].forEach(expense => {
expenseCategories[expense.category] = 
    (expenseCategories[expense.category] || 0) + expense.amount;
});
}

// Process incomes
if (incomes[year] && incomes[year][month]) {
incomes[year][month].forEach(income => {
incomeCategories[income.category] = 
    (incomeCategories[income.category] || 0) + income.amount;
});
}

// Move to next month
currentDate.setMonth(currentDate.getMonth() + 1);
}

// Prepare data for chart
const expenseCategoryLabels = Object.keys(expenseCategories);
const expenseCategoryData = Object.values(expenseCategories);
const incomeCategoryLabels = Object.keys(incomeCategories);
const incomeCategoryData = Object.values(incomeCategories);

// Create chart
charts.reportChart = new Chart(chartContainer, {
type: 'pie',
data: {
labels: [...expenseCategoryLabels, ...incomeCategoryLabels],
datasets: [{
label: 'Categorías',
data: [...expenseCategoryData, ...incomeCategoryData],
backgroundColor: [
    // Expense colors
    ...expenseCategoryLabels.map(() => 'rgba(255, 99, 132, 0.6)'),
    // Income colors
    ...incomeCategoryLabels.map(() => 'rgba(75, 192, 192, 0.6)')
]
}]
},
options: {
responsive: true,
plugins: {
title: {
    display: true,
    text: 'Distribución por Categorías'
},
legend: {
    position: 'right'
}
}
}
});

// Generate summary
let summaryHTML = `
<h3>Resumen por Categorías</h3>
<div class="category-breakdown">
<h4>Gastos por Categoría:</h4>
`;

Object.entries(expenseCategories).forEach(([category, amount]) => {
summaryHTML += `
<div class="category-item">
<span>${category}</span>
<span>$${amount.toFixed(2)}</span>
</div>
`;
});

summaryHTML += `
<h4>Ingresos por Categoría:</h4>
`;

Object.entries(incomeCategories).forEach(([category, amount]) => {
summaryHTML += `
<div class="category-item">
<span>${category}</span>
<span>$${amount.toFixed(2)}</span>
</div>
`;
});

summaryHTML += `</div>`;
summaryContainer.innerHTML = summaryHTML;
}

// Trend report generation
function generateTrendReport(startDate, endDate, chartContainer, summaryContainer) {
const trendData = {
expenses: [],
incomes: [],
labels: []
};

// Collect trend data
let currentDate = new Date(startDate);
let runningExpenseTotal = 0;
let runningIncomeTotal = 0;

while (currentDate <= endDate) {
const year = currentDate.getFullYear();
const month = currentDate.getMonth();

// Calculate total expenses
const monthExpenses = expenses[year] && expenses[year][month]
? expenses[year][month].reduce((acc, e) => acc + e.amount, 0)
: 0;

// Calculate total incomes
const monthIncomes = incomes[year] && incomes[year][month]
? incomes[year][month].reduce((acc, i) => acc + i.amount, 0)
: 0;

// Accumulate running totals
runningExpenseTotal += monthExpenses;
runningIncomeTotal += monthIncomes;

// Store data
trendData.expenses.push(runningExpenseTotal);
trendData.incomes.push(runningIncomeTotal);
trendData.labels.push(new Date(year, month).toLocaleString('default', { month: 'short', year: 'numeric' }));

// Move to next month
currentDate.setMonth(currentDate.getMonth() + 1);
}

// Create chart
charts.reportChart = new Chart(chartContainer, {
type: 'line',
data: {
labels: trendData.labels,
datasets: [
{
    label: 'Tendencia de Ingresos Acumulados',
    data: trendData.incomes,
    borderColor: 'rgb(75, 192, 192)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    fill: true,
    tension: 0.1
},
{
    label: 'Tendencia de Gastos Acumulados',
    data: trendData.expenses,
    borderColor: 'rgb(255, 99, 132)',
    backgroundColor: 'rgba(255, 99, 132, 0.2)',
    fill: true,
    tension: 0.1
}
]
},
options: {
responsive: true,
plugins: {
title: {
    display: true,
    text: 'Tendencia de Ingresos y Gastos Acumulados'
}
},
scales: {
y: {
    beginAtZero: true
}
}
}
});

// Generate summary
summaryContainer.innerHTML = `
<h3>Resumen de Tendencia</h3>
<p><strong>Ingresos Totales Acumulados:</strong> $${trendData.incomes[trendData.incomes.length - 1].toFixed(2)}</p>
<p><strong>Gastos Totales Acumulados:</strong> $${trendData.expenses[trendData.expenses.length - 1].toFixed(2)}</p>
<p><strong>Balance Acumulado:</strong> $${(trendData.incomes[trendData.incomes.length - 1] - trendData.expenses[trendData.expenses.length - 1]).toFixed(2)}</p>
`;
}

// Export data functionality
function exportData() {
// Combine expenses and incomes
const exportData = {
expenses: expenses,
incomes: incomes,
exportDate: new Date().toISOString()
};

// Convert to JSON
const jsonData = JSON.stringify(exportData, null, 2);

// Create a Blob
const blob = new Blob([jsonData], {type: 'application/json'});

// Create a link element
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = `monai_export_${new Date().toISOString().split('T')[0]}.json`;

// Trigger download
document.body.appendChild(link);
link.click();
document.body.removeChild(link);

showToast('Datos exportados exitosamente', 'success');
}

// Initialize the application
function initializeApp() {
// Load data from localStorage
try {
const savedExpenses = localStorage.getItem('monai_expenses');
const savedIncomes = localStorage.getItem('monai_incomes');

if (savedExpenses) {
expenses = JSON.parse(savedExpenses);
}

if (savedIncomes) {
incomes = JSON.parse(savedIncomes);
}
} catch (error) {
console.error('Error loading data:', error);
showToast('Error al cargar datos guardados', 'error');
}

// Setup date selectors
const monthSelect = document.getElementById('month-select');
const yearSelect = document.getElementById('year-select');

if (monthSelect) {
monthSelect.value = selectedMonth;
monthSelect.addEventListener('change', function() {
selectedMonth = parseInt(this.value);
updateTotals();
renderExpenses();
renderIncomes();
updateFinanceChart();
});
}

if (yearSelect) {
const currentYear = new Date().getFullYear();
// Populate year select
for (let year = currentYear - 3; year <= currentYear + 2; year++) {
const option = document.createElement('option');
option.value = year;
option.textContent = year;
yearSelect.appendChild(option);
}
yearSelect.value = selectedYear;
yearSelect.addEventListener('change', function() {
selectedYear = parseInt(this.value);
updateTotals();
renderExpenses();
renderIncomes();
updateFinanceChart();
});
}

// Initial UI update
updateTotals();
renderExpenses();renderIncomes();
updateFinanceChart();

// Setup tab navigation
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
    tab.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        // Remove active class from all tabs and tab contents
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        this.classList.add('active');
        document.getElementById(tabId).classList.add('active');
        
        // Special handling for reports tab
        if (tabId === 'reports') {
            generateReport();
        }
    });
});

// Setup report period change listener
const reportPeriodSelect = document.getElementById('report-period');
if (reportPeriodSelect) {
    reportPeriodSelect.addEventListener('change', function() {
        const customDatesContainer = document.getElementById('custom-dates');
        customDatesContainer.style.display = this.value === 'custom' ? 'block' : 'none';
    });
}

// Setup report generation button
const generateReportBtn = document.getElementById('generate-report');
if (generateReportBtn) {
    generateReportBtn.addEventListener('click', generateReport);
}

// Setup export data button
const exportDataBtn = document.getElementById('export-data');
if (exportDataBtn) {
    exportDataBtn.addEventListener('click', exportData);
}

// Set default dates for date inputs
const today = new Date().toISOString().split('T')[0];
const datePickers = document.querySelectorAll('input[type="date"]');
datePickers.forEach(picker => {
    picker.value = today;
});

// Check for first-time use
if (!localStorage.getItem('monai_first_visit')) {
    showWelcomeMessage();
}
}

// Show welcome message for first-time users
function showWelcomeMessage() {
const welcomeMessage = `
    <div class="welcome-modal">
        <h2>¡Bienvenido a MonAI!</h2>
        <p>Gracias por elegir MonAI para administrar tus finanzas personales. Aquí algunos consejos para comenzar:</p>
        <ul>
            <li>Registra tus ingresos y gastos mensualmente</li>
            <li>Utiliza las categorías para un mejor seguimiento</li>
            <li>Revisa tus reportes para entender tus patrones financieros</li>
            <li>Exporta tus datos regularmente como respaldo</li>
        </ul>
        <button id="close-welcome">Entendido</button>
    </div>
`;

// Create modal
const modalContainer = document.createElement('div');
modalContainer.id = 'welcome-modal-container';
modalContainer.innerHTML = welcomeMessage;
document.body.appendChild(modalContainer);

// Style the modal
const style = document.createElement('style');
style.textContent = `
    #welcome-modal-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .welcome-modal {
        background: white;
        padding: 30px;
        border-radius: 10px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .welcome-modal h2 {
        color: #2C3E50;
        margin-bottom: 20px;
    }
    .welcome-modal ul {
        text-align: left;
        margin: 20px 0;
        padding-left: 20px;
    }
    .welcome-modal button {
        background-color: #1ABC9C;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    .welcome-modal button:hover {
        background-color: #16A085;
    }
`;
document.head.appendChild(style);

// Close modal event
document.getElementById('close-welcome').addEventListener('click', () => {
    document.body.removeChild(modalContainer);
    document.head.removeChild(style);
    localStorage.setItem('monai_first_visit', 'true');
});
}

// Import data functionality
function importData(event) {
const file = event.target.files[0];
if (!file) return;

const reader = new FileReader();
reader.onload = function(e) {
    try {
        const importedData = JSON.parse(e.target.result);
        
        // Validate imported data
        if (importedData.expenses && importedData.incomes) {
            // Merge imported data with existing data
            expenses = importedData.expenses;
            incomes = importedData.incomes;

            // Save to localStorage
            localStorage.setItem('monai_expenses', JSON.stringify(expenses));
            localStorage.setItem('monai_incomes', JSON.stringify(incomes));

            // Update UI
            updateTotals();
            renderExpenses();
            renderIncomes();
            updateFinanceChart();

            showToast('Datos importados exitosamente', 'success');
        } else {
            showToast('Formato de archivo inválido', 'error');
        }
    } catch (error) {
        console.error('Error importing data:', error);
        showToast('Error al importar datos', 'error');
    }
};
reader.readAsText(file);
}

// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Attach import data functionality (this would typically be in your HTML)
const importDataInput = document.createElement('input');
importDataInput.type = 'file';
importDataInput.accept = '.json';
importDataInput.style.display = 'none';
importDataInput.addEventListener('change', importData);
document.body.appendChild(importDataInput);

// Function to trigger import
function triggerImportData() {
importDataInput.click();
}

// Export functions to global scope if needed
window.addExpense = addExpense;
window.addIncome = addIncome;
window.editExpense = editExpense;
window.editIncome = editIncome;
window.deleteExpense = deleteExpense;
window.deleteIncome = deleteIncome;
window.exportData = exportData;
window.triggerImportData = triggerImportData;