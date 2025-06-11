// src/pages/HomePage.js
import React from 'react';
import { Card, Container } from 'react-bootstrap';

const HomePage = () => {
    return (
        <Container>
            <Card className="mt-4">
                <Card.Body>
                    <Card.Title>Финансовый трекер</Card.Title>
                    <Card.Text>
                        Управляйте вашими доходами и расходами с помощью этого приложения.
                        <br />
                        Используйте навигационное меню для работы с транзакциями и категориями.
                    </Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default HomePage;