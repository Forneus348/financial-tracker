// src/services/api.js
const API_URL = 'http://localhost:5000/api';

// Категории
export const getCategories = async () => {
    const response = await fetch(`${API_URL}/Category`);
    return response.json();
};

export const createCategory = async (category) => {
    const response = await fetch(`${API_URL}/Category`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка сервера');
    }

    return response.json();
};


export const deleteCategory = async (id) => {
    await fetch(`${API_URL}/Category/${id}`, { method: 'DELETE' });
};

export const updateCategory = async (id, category) => {
    await fetch(`${API_URL}/Category/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
    });
};

// Транзакции
export const getTransactions = async () => {
    const response = await fetch(`${API_URL}/Transaction`);
    return response.json();
};

export const createTransaction = async (transaction) => {
    const response = await fetch(`${API_URL}/Transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
    });
    return response.json();
};

export const deleteTransaction = async (id) => {
    await fetch(`${API_URL}/Transaction/${id}`, { method: 'DELETE' });
};

export const updateTransaction = async (id, transaction) => {
    await fetch(`${API_URL}/Transaction/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction)
    });
};