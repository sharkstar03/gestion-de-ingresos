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

updateTotal();
