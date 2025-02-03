const expenses = JSON.parse(localStorage.getItem('expenses')) || {};
const incomes = JSON.parse(localStorage.getItem('incomes')) || {};
const currentMonth = new Date().getMonth();
const currentYear = new Date().getFullYear();

function addExpense() {
    const name = document.getElementById("expense-name").value;
    const amount = parseFloat(document.getElementById("expense-amount").value);
    if (name && !isNaN(amount) && amount > 0) {
        const expense = { name, amount, date: new Date().toLocaleString() };
        if (!expenses[currentYear]) expenses[currentYear] = {};
        if (!expenses[currentYear][currentMonth]) expenses[currentYear][currentMonth] = [];
        expenses[currentYear][currentMonth].push(expense);
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderExpenses();
        updateTotal();
    }
}

function addIncome() {
    const name = document.getElementById("income-name").value;
    const amount = parseFloat(document.getElementById("income-amount").value);
    if (name && !isNaN(amount) && amount > 0) {
        const income = { name, amount, date: new Date().toLocaleString() };
        if (!incomes[currentYear]) incomes[currentYear] = {};
        if (!incomes[currentYear][currentMonth]) incomes[currentYear][currentMonth] = [];
        incomes[currentYear][currentMonth].push(income);
        localStorage.setItem('incomes', JSON.stringify(incomes));
        renderIncomes();
        updateTotal();
    }
}

function updateTotal() {
    let totalExpenses = 0, totalIncomes = 0;
    if (expenses[currentYear] && expenses[currentYear][currentMonth]) {
        totalExpenses = expenses[currentYear][currentMonth].reduce((acc, e) => acc + e.amount, 0);
    }
    if (incomes[currentYear] && incomes[currentYear][currentMonth]) {
        totalIncomes = incomes[currentYear][currentMonth].reduce((acc, i) => acc + i.amount, 0);
    }
    document.getElementById("total-expenses").textContent = totalExpenses.toFixed(2);
    document.getElementById("total-incomes").textContent = totalIncomes.toFixed(2);
    document.getElementById("available-money").textContent = (totalIncomes - totalExpenses).toFixed(2);
}

function deleteExpense(index) {
    expenses[currentYear][currentMonth].splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
    updateTotal();
}

function deleteIncome(index) {
    incomes[currentYear][currentMonth].splice(index, 1);
    localStorage.setItem('incomes', JSON.stringify(incomes));
    renderIncomes();
    updateTotal();
}

function editExpense(index) {
    const expense = expenses[currentYear][currentMonth][index];
    const newName = prompt("Editar nombre del gasto:", expense.name);
    const newAmount = parseFloat(prompt("Editar monto del gasto:", expense.amount));
    if (newName && !isNaN(newAmount) && newAmount > 0) {
        expenses[currentYear][currentMonth][index] = { ...expense, name: newName, amount: newAmount };
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderExpenses();
        updateTotal();
    }
}

function editIncome(index) {
    const income = incomes[currentYear][currentMonth][index];
    const newName = prompt("Editar nombre del ingreso:", income.name);
    const newAmount = parseFloat(prompt("Editar monto del ingreso:", income.amount));
    if (newName && !isNaN(newAmount) && newAmount > 0) {
        incomes[currentYear][currentMonth][index] = { ...income, name: newName, amount: newAmount };
        localStorage.setItem('incomes', JSON.stringify(incomes));
        renderIncomes();
        updateTotal();
    }
}

function renderExpenses() {
    const expensesContainer = document.getElementById("expenses");
    expensesContainer.innerHTML = "<h2>Gastos Registrados</h2>";
    if (expenses[currentYear] && expenses[currentYear][currentMonth]) {
        expenses[currentYear][currentMonth].forEach((expense, index) => {
            const expenseItem = document.createElement("div");
            expenseItem.className = "expense-item";
            expenseItem.innerHTML = `
                <span>${expense.name}</span>
                <span>$${expense.amount.toFixed(2)}</span>
                <div>
                    <button class="edit" onclick="editExpense(${index})">Editar</button>
                    <button class="delete" onclick="deleteExpense(${index})">Eliminar</button>
                </div>
            `;
            expensesContainer.appendChild(expenseItem);
        });
    }
}

function renderIncomes() {
    const incomesContainer = document.getElementById("incomes");
    incomesContainer.innerHTML = "<h2>Ingresos Registrados</h2>";
    if (incomes[currentYear] && incomes[currentYear][currentMonth]) {
        incomes[currentYear][currentMonth].forEach((income, index) => {
            const incomeItem = document.createElement("div");
            incomeItem.className = "income-item";
            incomeItem.innerHTML = `
                <span>${income.name}</span>
                <span>$${income.amount.toFixed(2)}</span>
                <div>
                    <button class="edit" onclick="editIncome(${index})">Editar</button>
                    <button class="delete" onclick="deleteIncome(${index})">Eliminar</button>
                </div>
            `;
            incomesContainer.appendChild(incomeItem);
        });
    }
}

updateTotal();
renderExpenses();
renderIncomes();
