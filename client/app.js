const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function () {
    // Инициализация
    initApp();
});

function initApp() {
    // Загрузка данных
    loadTransactions();
    loadCategories();

    // Обработчики событий с проверкой элементов
    const filterType = document.getElementById('filter-type');
    if (filterType) {
        filterType.addEventListener('change', loadTransactions);
    }

    const saveTransactionBtn = document.getElementById('save-transaction');
    if (saveTransactionBtn) {
        saveTransactionBtn.addEventListener('click', handleSaveTransaction);
    }

    const saveCategoryBtn = document.getElementById('save-category');
    if (saveCategoryBtn) {
        saveCategoryBtn.addEventListener('click', handleSaveCategory);
    }

    // Установка текущей даты по умолчанию
    setDefaultDateTime();

    // Обновляем список категорий при открытии модального окна транзакции
    const transactionModal = document.getElementById('addTransactionModal');
    if (transactionModal) {
        transactionModal.addEventListener('show.bs.modal', function () {
            refreshCategoryDropdown();
        });
    }
}

function setDefaultDateTime() {
    const dateInput = document.getElementById('transaction-date');
    if (dateInput) {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now - timezoneOffset).toISOString().slice(0, 16);
        dateInput.value = localISOTime;
    }
}

// ========== Транзакции ==========

async function loadTransactions() {
    try {
        // Проверяем, существует ли контейнер транзакций
        const container = document.getElementById('transactions-container');
        if (!container) {
            console.error('Элемент transactions-container не найден');
            return;
        }

        // Показываем индикатор загрузки
        container.innerHTML = `
            <div class="col-12 text-center py-4 text-muted">
                <i class="bi bi-hourglass-split"></i> Загрузка транзакций...
            </div>
        `;

        // Получаем значение фильтра, если элемент существует
        let filter = 'all';
        const filterEl = document.getElementById('filter-type');
        if (filterEl) {
            filter = filterEl.value;
        }

        const response = await fetch(`${API_URL}/Transaction`);

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const transactions = await response.json();
        const filteredTransactions = filter === 'all'
            ? transactions
            : transactions.filter(t => t.category && t.category.type === filter);

        displayTransactions(filteredTransactions);
        calculateSummary(transactions);
    } catch (error) {
        showError('Не удалось загрузить транзакции', error);
    }
}

function displayTransactions(transactions) {
    const container = document.getElementById('transactions-container');
    if (!container) return;

    if (!transactions || transactions.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-4 text-muted">
                <i class="bi bi-wallet2"></i> Нет транзакций
            </div>
        `;
        return;
    }

    container.innerHTML = transactions.map(transaction => `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start">
                        <h5 class="card-title mb-1">${transaction.category ? transaction.category.name : 'Без категории'}</h5>
                        <span class="badge bg-${transaction.category && transaction.category.type === 'Доход' ? 'success' : 'danger'}">
                            ${transaction.category ? transaction.category.type : 'Неизвестно'}
                        </span>
                    </div>
                    <p class="card-text ${transaction.category && transaction.category.type === 'Доход' ? 'text-success' : 'text-danger'} fs-4 mb-2">
                        ${transaction.category && transaction.category.type === 'Доход' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)} ₽
                    </p>
                    <p class="card-text text-muted small mb-1">
                        <i class="bi bi-calendar"></i> ${new Date(transaction.date).toLocaleDateString()}
                        ${new Date(transaction.date).toLocaleTimeString()}
                    </p>
                    ${transaction.description ? `<p class="card-text">${transaction.description}</p>` : ''}
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-sm btn-outline-primary edit-transaction" data-id="${transaction.id}">
                        <i class="bi bi-pencil"></i> Изменить
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-transaction" data-id="${transaction.id}">
                        <i class="bi bi-trash"></i> Удалить
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Добавляем обработчики для динамически созданных элементов
    document.querySelectorAll('.edit-transaction').forEach(btn => {
        btn.addEventListener('click', () => editTransaction(btn.dataset.id));
    });

    document.querySelectorAll('.delete-transaction').forEach(btn => {
        btn.addEventListener('click', () => deleteTransaction(btn.dataset.id));
    });
}

async function handleSaveTransaction() {
    const form = document.getElementById('transaction-form');
    const saveBtn = document.getElementById('save-transaction');

    if (!form || !saveBtn) return;

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    try {
        // Показываем индикатор загрузки на кнопке
        toggleSaveButtonLoading(saveBtn, true);

        const transactionId = document.getElementById('transaction-id').value;
        const isEdit = !!transactionId;

        const transactionData = {
            amount: parseFloat(document.getElementById('transaction-amount').value),
            date: document.getElementById('transaction-date').value,
            categoryID: parseInt(document.getElementById('transaction-category').value),
            description: document.getElementById('transaction-description').value
        };

        const response = await fetch(
            `${API_URL}/Transaction${isEdit ? `/${transactionId}` : ''}`,
            {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(transactionData)
            }
        );

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        // Закрываем модальное окно и обновляем данные
        const modal = bootstrap.Modal.getInstance(document.getElementById('addTransactionModal'));
        if (modal) modal.hide();

        await loadTransactions();
        resetTransactionForm();

        showToast(isEdit ? 'Транзакция обновлена' : 'Транзакция создана', 'success');
    } catch (error) {
        showError('Не удалось сохранить транзакцию', error);
    } finally {
        toggleSaveButtonLoading(saveBtn, false);
    }
}

async function editTransaction(id) {
    const saveBtn = document.getElementById('save-transaction');
    if (saveBtn) toggleSaveButtonLoading(saveBtn, true);

    try {
        const response = await fetch(`${API_URL}/Transaction/${id}`);

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const transaction = await response.json();

        const idInput = document.getElementById('transaction-id');
        if (idInput) idInput.value = transaction.id;

        const amountInput = document.getElementById('transaction-amount');
        if (amountInput) amountInput.value = transaction.amount;

        const dateInput = document.getElementById('transaction-date');
        if (dateInput) {
            // Форматируем дату для input[type=datetime-local]
            const date = new Date(transaction.date);
            const timezoneOffset = date.getTimezoneOffset() * 60000;
            const localISOTime = new Date(date - timezoneOffset).toISOString().slice(0, 16);
            dateInput.value = localISOTime;
        }

        const categorySelect = document.getElementById('transaction-category');
        if (categorySelect) categorySelect.value = transaction.categoryID;

        const descriptionInput = document.getElementById('transaction-description');
        if (descriptionInput) descriptionInput.value = transaction.description || '';

        // Показываем модальное окно
        const modal = new bootstrap.Modal(document.getElementById('addTransactionModal'));
        modal.show();
    } catch (error) {
        showError('Не удалось загрузить транзакцию', error);
    } finally {
        if (saveBtn) toggleSaveButtonLoading(saveBtn, false);
    }
}

async function deleteTransaction(id) {
    if (!confirm('Вы уверены, что хотите удалить эту транзакцию?')) return;

    try {
        const response = await fetch(`${API_URL}/Transaction/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        await loadTransactions();
        showToast('Транзакция удалена', 'success');
    } catch (error) {
        showError('Не удалось удалить транзакцию', error);
    }
}

function resetTransactionForm() {
    const form = document.getElementById('transaction-form');
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
        const idInput = document.getElementById('transaction-id');
        if (idInput) idInput.value = '';
        setDefaultDateTime();
    }
}

// ========== Категории ==========

let categoriesCache = []; // Кэш для хранения категорий

async function loadCategories() {
    try {
        const tableBody = document.getElementById('categories-table');
        if (!tableBody) return;

        // Показываем индикатор загрузки
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-3 text-muted">
                    <i class="bi bi-hourglass-split"></i> Загрузка категорий...
                </td>
            </tr>
        `;

        const response = await fetch(`${API_URL}/Category`);

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        categoriesCache = await response.json(); // Сохраняем в кэш
        displayCategories(categoriesCache);
        populateCategoryDropdown(categoriesCache);
    } catch (error) {
        showError('Не удалось загрузить категории', error);
    }
}

// Новая функция для обновления выпадающего списка
function refreshCategoryDropdown() {
    populateCategoryDropdown(categoriesCache);
}

function displayCategories(categories) {
    const tableBody = document.getElementById('categories-table');
    if (!tableBody) return;

    if (!categories || categories.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-3 text-muted">
                    <i class="bi bi-tags"></i> Нет категорий
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>
                <span class="badge bg-${category.type === 'Доход' ? 'success' : 'danger'}">
                    ${category.type}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary edit-category" data-id="${category.id}">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-category" data-id="${category.id}">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // Добавляем обработчики для кнопок
    document.querySelectorAll('.edit-category').forEach(btn => {
        btn.addEventListener('click', () => editCategory(btn.dataset.id));
    });

    document.querySelectorAll('.delete-category').forEach(btn => {
        btn.addEventListener('click', () => deleteCategory(btn.dataset.id));
    });
}

function populateCategoryDropdown(categories) {
    const dropdown = document.getElementById('transaction-category');
    if (!dropdown) return;

    // Сортируем категории по типу
    const incomeCategories = categories.filter(c => c.type === 'Доход');
    const expenseCategories = categories.filter(c => c.type === 'Расход');

    dropdown.innerHTML = '';

    // Добавляем пустую опцию по умолчанию
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Выберите категорию';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    dropdown.appendChild(defaultOption);

    if (incomeCategories.length > 0) {
        const optgroupIncome = document.createElement('optgroup');
        optgroupIncome.label = 'Доходы';
        incomeCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            optgroupIncome.appendChild(option);
        });
        dropdown.appendChild(optgroupIncome);
    }

    if (expenseCategories.length > 0) {
        const optgroupExpense = document.createElement('optgroup');
        optgroupExpense.label = 'Расходы';
        expenseCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            optgroupExpense.appendChild(option);
        });
        dropdown.appendChild(optgroupExpense);
    }
}

async function handleSaveCategory() {
    const form = document.getElementById('category-form');
    const saveBtn = document.getElementById('save-category');

    if (!form || !saveBtn) return;

    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    try {
        // Показываем индикатор загрузки на кнопке
        toggleSaveButtonLoading(saveBtn, true);

        const categoryId = document.getElementById('category-id').value;
        const isEdit = !!categoryId;

        const categoryData = {
            name: document.getElementById('category-name').value,
            type: document.getElementById('category-type').value
        };

        const response = await fetch(
            `${API_URL}/Category${isEdit ? `/${categoryId}` : ''}`,
            {
                method: isEdit ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(categoryData)
            }
        );

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        // Закрываем модальное окно и обновляем данные
        const modal = bootstrap.Modal.getInstance(document.getElementById('addCategoryModal'));
        if (modal) modal.hide();

        // Обновляем кэш и отображение
        await loadCategories();
        await loadTransactions(); // Обновляем транзакции, так как категории могли измениться

        resetCategoryForm();

        showToast(isEdit ? 'Категория обновлена' : 'Категория создана', 'success');
    } catch (error) {
        showError('Не удалось сохранить категорию', error);
    } finally {
        toggleSaveButtonLoading(saveBtn, false);
    }
}

async function editCategory(id) {
    const saveBtn = document.getElementById('save-category');
    if (saveBtn) toggleSaveButtonLoading(saveBtn, true);

    try {
        const response = await fetch(`${API_URL}/Category/${id}`);

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        const category = await response.json();

        const idInput = document.getElementById('category-id');
        if (idInput) idInput.value = category.id;

        const nameInput = document.getElementById('category-name');
        if (nameInput) nameInput.value = category.name;

        const typeSelect = document.getElementById('category-type');
        if (typeSelect) typeSelect.value = category.type;

        // Показываем модальное окно
        const modal = new bootstrap.Modal(document.getElementById('addCategoryModal'));
        modal.show();
    } catch (error) {
        showError('Не удалось загрузить категорию', error);
    } finally {
        if (saveBtn) toggleSaveButtonLoading(saveBtn, false);
    }
}

async function deleteCategory(id) {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;

    try {
        const response = await fetch(`${API_URL}/Category/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(await getErrorMessage(response));
        }

        await loadCategories();
        await loadTransactions(); // Обновляем транзакции, так как могла измениться категория
        showToast('Категория удалена', 'success');
    } catch (error) {
        showError('Не удалось удалить категорию', error);
    }
}

function resetCategoryForm() {
    const form = document.getElementById('category-form');
    if (form) {
        form.reset();
        form.classList.remove('was-validated');
        const idInput = document.getElementById('category-id');
        if (idInput) idInput.value = '';
    }
}

// ========== Вспомогательные функции ==========

async function getErrorMessage(response) {
    try {
        const errorResponse = await response.json();
        return errorResponse.message || errorResponse.title || response.statusText;
    } catch {
        return response.statusText;
    }
}

function showError(message, error) {
    console.error(error);
    // Показываем toast-уведомление
    showToast(`${message}: ${error.message}`, 'danger');
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();

    const toast = document.createElement('div');
    toast.className = `toast show align-items-center text-white bg-${type} border-0`;
    toast.role = 'alert';
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;

    toastContainer.appendChild(toast);

    // Автоматическое скрытие через 5 секунд
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '1100';
    document.body.appendChild(container);
    return container;
}

function toggleSaveButtonLoading(button, isLoading) {
    const spinner = button.querySelector('.spinner-border');
    const text = button.querySelector('.save-text');

    if (spinner && text) {
        spinner.classList.toggle('hidden', !isLoading);
        text.classList.toggle('hidden', isLoading);
        button.disabled = isLoading;
    }
}

function calculateSummary(transactions) {
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpenseEl = document.getElementById('total-expense');
    const totalBalanceEl = document.getElementById('total-balance');

    if (!totalIncomeEl || !totalExpenseEl || !totalBalanceEl) return;

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
        if (transaction.category && transaction.category.type === 'Доход') {
            totalIncome += transaction.amount;
        } else {
            totalExpense += transaction.amount;
        }
    });

    totalIncomeEl.textContent = `+${totalIncome.toFixed(2)} ₽`;
    totalExpenseEl.textContent = `-${totalExpense.toFixed(2)} ₽`;
    totalBalanceEl.textContent = `${(totalIncome - totalExpense).toFixed(2)} ₽`;
}