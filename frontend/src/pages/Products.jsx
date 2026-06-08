import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Modal, Form, Alert, Spinner, Badge, InputGroup, Pagination, Row, Col,
} from 'react-bootstrap';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', description: '', price: '', stock: '' };

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const LIMIT = 8;
  const totalPages = Math.ceil(total / LIMIT);

  async function fetchProducts(p = page, q = search) {
    setLoading(true);
    try {
      const res = await api.get(`/products?page=${p}&limit=${LIMIT}&search=${q}`);
      setProducts(res.data.data);
      setTotal(res.data.total);
    } catch {
      setError('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, [page]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchProducts(1, search);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError('');
    setShowModal(true);
  }

  function openEdit(product) {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
    });
    setError('');
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/products/${editing.id}`, form);
        setSuccess('Produto atualizado com sucesso!');
      } else {
        await api.post('/products', form);
        setSuccess('Produto criado com sucesso!');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar produto');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Deseja excluir o produto "${product.name}"?`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      setSuccess('Produto excluído com sucesso!');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao excluir produto');
    }
  }

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Produtos</h4>
          <p className="text-muted mb-0">{total} produto(s) cadastrado(s)</p>
        </div>
        {isAdmin && (
          <Button variant="primary" onClick={openCreate} data-cy="btn-new-product">
            + Novo Produto
          </Button>
        )}
      </div>

      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
      {error && !showModal && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <Card.Header className="bg-white py-3">
          <Form onSubmit={handleSearch}>
            <InputGroup style={{ maxWidth: 360 }}>
              <Form.Control
                placeholder="Buscar produto..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                data-cy="search-input"
              />
              <Button type="submit" variant="outline-secondary">Buscar</Button>
            </InputGroup>
          </Form>
        </Card.Header>

        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-center text-muted p-5 mb-0">Nenhum produto encontrado.</p>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Descrição</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    {isAdmin && <th>Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} data-cy="product-row">
                      <td className="text-muted">#{p.id}</td>
                      <td className="fw-semibold">{p.name}</td>
                      <td className="text-muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.description || '—'}
                      </td>
                      <td>R$ {Number(p.price).toFixed(2)}</td>
                      <td>
                        <Badge bg={p.stock > 10 ? 'success' : p.stock > 0 ? 'warning' : 'danger'} text={p.stock > 10 ? undefined : 'dark'}>
                          {p.stock} un.
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td>
                          <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEdit(p)} data-cy="btn-edit-product">
                            Editar
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(p)} data-cy="btn-delete-product">
                            Excluir
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>

        {totalPages > 1 && (
          <Card.Footer className="bg-white">
            <Pagination size="sm" className="mb-0 justify-content-end">
              <Pagination.Prev disabled={page === 1} onClick={() => setPage(page - 1)} />
              {Array.from({ length: totalPages }, (_, i) => (
                <Pagination.Item key={i + 1} active={page === i + 1} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next disabled={page === totalPages} onClick={() => setPage(page + 1)} />
            </Pagination>
          </Card.Footer>
        )}
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Editar Produto' : 'Novo Produto'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave} data-cy="product-form">
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Nome *</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                data-cy="product-name-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descrição</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                data-cy="product-desc-input"
              />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Preço (R$) *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    data-cy="product-price-input"
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="mb-3">
                  <Form.Label>Estoque</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    data-cy="product-stock-input"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving} data-cy="product-save-btn">
              {saving ? <Spinner animation="border" size="sm" className="me-1" /> : null}
              {editing ? 'Salvar alterações' : 'Criar produto'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}