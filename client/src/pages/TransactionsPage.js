// src/pages/TransactionsPage.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Container, Alert } from 'react-bootstrap';
import {
    getTransactions,
    createTransaction,
    deleteTransaction,
    updateTransaction
} from '../services/api';
import { getCategories } from '../services/api';

const TransactionsPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [formData, setFormData] = useState({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        categoryID: '',
        description: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [transactionsData, categoriesData] = await Promise.all([
                getTransactions(),
                getCategories()
            ]);
            setTransactions(transactionsData);
            setCategories(categoriesData);
        } catch (err) {
            setError('Ошибка загрузки данных');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                amount: parseFloat(formData.amount),
                categoryID: parseInt(formData.categoryID)
            };

            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, data);
            } else {
                await createTransaction(data);
            }

            setShowModal(false);
            fetchData();
            resetForm();
        } catch (err) {
            setError('Ошибка сохранения транзакции');
        }
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setFormData({
            amount: transaction.amount.toString(),
            date: transaction.date.split('T')[0],
            categoryID: transaction.categoryID.toString(),
            description: transaction.description
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить транзакцию?')) {
            try {
                await deleteTransaction(id);
                fetchData();
            } catch (err) {
                setError('Ошибка удаления транзакции');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            amount: '',
            date: new Date().toISOString().split('T')[0],
            categoryID: '',
            description: ''
        });
        setEditingTransaction(null);
    };

    const getCategoryName = (id) => {
        const category = categories.find(c => c.id === id);
        return category ? category.name : 'Неизвестно';
    };

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Транзакции</h1>
                <Button variant="primary" onClick={() => { setShowModal(true); resetForm(); }}>
                    Добавить транзакцию
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Сумма</th>
                        <th>Дата</th>
                        <th>Категория</th>
                        <th>Описание</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map(transaction => (
                        <tr key={transaction.id}>
                            <td>{transaction.id}</td>
                            <td>{transaction.amount}</td>
                            <td>{new Date(transaction.date).toLocaleDateString()}</td>
                            <td>{getCategoryName(transaction.categoryID)}</td>
                            <td>{transaction.description}</td>
                            <td>
                                <Button variant="info" size="sm" onClick={() => handleEdit(transaction)}>
                                    Редактировать
                                </Button>{' '}
                                <Button variant="danger" size="sm" onClick={() => handleDelete(transaction.id)}>
                                    Удалить
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingTransaction ? 'Редактировать' : 'Добавить'} транзакцию</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Сумма</Form.Label>
                            <Form.Control
                                type="number"
                                step="0.01"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Дата</Form.Label>
                            <Form.Control
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Категория</Form.Label>
                            <Form.Select
                                name="categoryID"
                                value={formData.categoryID}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Выберите категорию</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name} ({category.type})
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Описание</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Отмена
                        </Button>
                        <Button variant="primary" type="submit">
                            Сохранить
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default TransactionsPage;