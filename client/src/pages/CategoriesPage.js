// src/pages/CategoriesPage.js
import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Container, Alert } from 'react-bootstrap';
import {
    getCategories,
    createCategory,
    deleteCategory,
    updateCategory
} from '../services/api';

const CategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'Доход' });
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (err) {
            setError('Ошибка загрузки категорий');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // src/pages/CategoriesPage.js
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Исправляем имя поля для типа категории
            const dataToSend = {
                Name: formData.name,
                Type: formData.type
            };

            if (editingCategory) {
                await updateCategory(editingCategory.id, dataToSend);
            } else {
                await createCategory(dataToSend);
            }

            setShowModal(false);
            fetchCategories();
            resetForm();
        } catch (err) {
            // Выводим детальную ошибку
            setError(`Ошибка сохранения категории: ${err.message}`);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({ name: category.name, type: category.type });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить категорию?')) {
            try {
                await deleteCategory(id);
                fetchCategories();
            } catch (err) {
                setError('Ошибка удаления категории');
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', type: 'Доход' });
        setEditingCategory(null);
    };

    return (
        <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Категории</h1>
                <Button variant="primary" onClick={() => { setShowModal(true); resetForm(); }}>
                    Добавить категорию
                </Button>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Название</th>
                        <th>Тип</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {categories.map(category => (
                        <tr key={category.id}>
                            <td>{category.id}</td>
                            <td>{category.name}</td>
                            <td>{category.type}</td>
                            <td>
                                <Button variant="info" size="sm" onClick={() => handleEdit(category)}>
                                    Редактировать
                                </Button>{' '}
                                <Button variant="danger" size="sm" onClick={() => handleDelete(category.id)}>
                                    Удалить
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingCategory ? 'Редактировать' : 'Добавить'} категорию</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Название</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Тип</Form.Label>
                            <Form.Select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                            >
                                <option value="Доход">Доход</option>
                                <option value="Расход">Расход</option>
                            </Form.Select>
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

export default CategoriesPage;