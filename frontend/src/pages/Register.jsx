import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Spinner, Container, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      return setError('As senhas não coincidem');
    }
    if (form.password.length < 6) {
      return setError('A senha deve ter no mínimo 6 caracteres');
    }

    setLoading(true);
    try {
      await signup(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={10} md={6} lg={5}>
          <div className="text-center mb-4">
            <h2 className="fw-bold">◆ Loja Online</h2>
            <p className="text-muted">Crie sua conta</p>
          </div>

          <Card className="shadow-sm">
            <Card.Body className="p-4">
              {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

              <Form onSubmit={handleSubmit} data-cy="register-form">
                <Form.Group className="mb-3">
                  <Form.Label>Nome completo</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    required
                    data-cy="name-input"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                    data-cy="email-input"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Senha</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    required
                    data-cy="password-input"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Confirmar senha</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirm"
                    value={form.confirm}
                    onChange={handleChange}
                    placeholder="Repita a senha"
                    required
                    data-cy="confirm-input"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100"
                  disabled={loading}
                  data-cy="submit-btn"
                >
                  {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
                  {loading ? 'Criando conta...' : 'Criar conta'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <p className="text-center mt-3 text-muted">
            Já tem conta?{' '}
            <Link to="/login" className="text-primary">
              Entrar
            </Link>
          </p>
        </Col>
      </Row>
    </Container>
  );
}