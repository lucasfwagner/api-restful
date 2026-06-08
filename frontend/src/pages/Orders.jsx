import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Modal, Form, Alert, Spinner, Badge, ListGroup,
} from 'react-bootstrap';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_OPTIONS = ['pending', 'processing', 'completed', 'cancelled'];
const STATUS_LABELS = {
  pending: { label: 'Pendente', bg: 'warning', text: 'dark' },
  processing: { label: 'Em andamento', bg: 'primary', text: 'white' },
  completed: { label: 'Concluído', bg: 'success', text: 'white' },
  cancelled: { label: 'Cancelado', bg: 'danger', text: 'white' },
};

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [orderItems, setOrderItems] = useState([{ productId: '', quantity: 1 }]);
  const [saving, setSaving] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch {
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }

  async function fetchProducts() {
    try {
      const res = await api.get('/products?limit=100');
      setProducts(res.data.data);
    } catch {}
  }

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  function openDetail(order) {
    setSelectedOrder(order);
    setShowDetail(true);
  }

  async function handleStatusChange(order, status) {
    try {
      await api.put(`/orders/${order.id}`, { status });
      setSuccess('Status atualizado!');
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao atualizar status');
    }
  }

  async function handleDelete(order) {
    if (!window.confirm(`Deseja excluir o pedido #${order.id}?`)) return;
    try {
      await api.delete(`/orders/${order.id}`);
      setSuccess('Pedido excluído!');
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao excluir pedido');
    }
  }

  function addItem() {
    setOrderItems([...orderItems, { productId: '', quantity: 1 }]);
  }

  function removeItem(i) {
    setOrderItems(orderItems.filter((_, idx) => idx !== i));
  }

  function updateItem(i, field, value) {
    const updated = [...orderItems];
    updated[i] = { ...updated[i], [field]: value };
    setOrderItems(updated);
  }

  async function handleCreate(e) {
    e.preventDefault();
    const items = orderItems
      .filter((it) => it.productId)
      .map((it) => ({ productId: Number(it.productId), quantity: Number(it.quantity) }));

    if (items.length === 0) return setError('Adicione ao menos um produto');

    setSaving(true);
    setError('');
    try {
      await api.post('/orders', { items });
      setSuccess('Pedido criado com sucesso!');
      setShowCreate(false);
      setOrderItems([{ productId: '', quantity: 1 }]);
      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar pedido');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Pedidos</h4>
          <p className="text-muted mb-0">{orders.length} pedido(s)</p>
        </div>
        <Button variant="primary" onClick={() => { setError(''); setShowCreate(true); }} data-cy="btn-new-order">
          + Novo Pedido
        </Button>
      </div>

      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}
      {error && !showCreate && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5"><Spinner animation="border" variant="primary" /></div>
          ) : orders.length === 0 ? (
            <p className="text-center text-muted p-5 mb-0">Nenhum pedido encontrado.</p>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    {user?.role === 'admin' && <th>Cliente</th>}
                    <th>Status</th>
                    <th>Total</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const s = STATUS_LABELS[order.status] || { label: order.status, bg: 'secondary', text: 'white' };
                    return (
                      <tr key={order.id} data-cy="order-row">
                        <td className="fw-semibold">#{order.id}</td>
                        {user?.role === 'admin' && <td>{order.user?.name}</td>}
                        <td><Badge bg={s.bg} text={s.text}>{s.label}</Badge></td>
                        <td>R$ {Number(order.total).toFixed(2)}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                        <td>
                          <Button size="sm" variant="outline-info" className="me-1" onClick={() => openDetail(order)}>
                            Ver
                          </Button>
                          <Button size="sm" variant="outline-danger" onClick={() => handleDelete(order)}>
                            Excluir
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Pedido #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <p className="mb-1"><strong>Cliente:</strong> {selectedOrder.user?.name} ({selectedOrder.user?.email})</p>
              <p className="mb-3"><strong>Data:</strong> {new Date(selectedOrder.createdAt).toLocaleString('pt-BR')}</p>

              <Form.Group className="mb-3">
                <Form.Label><strong>Status</strong></Form.Label>
                <Form.Select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder, e.target.value)}
                  data-cy="order-status-select"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]?.label || s}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <h6 className="fw-bold mt-3 mb-2">Produtos do Pedido</h6>
              <ListGroup variant="flush">
                {selectedOrder.orderItems?.map((item) => (
                  <ListGroup.Item key={item.id} className="d-flex justify-content-between px-0">
                    <span>{item.product?.name} × {item.quantity}</span>
                    <span className="fw-semibold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </ListGroup.Item>
                ))}
                <ListGroup.Item className="d-flex justify-content-between px-0 fw-bold border-top pt-2">
                  <span>Total</span>
                  <span>R$ {Number(selectedOrder.total).toFixed(2)}</span>
                </ListGroup.Item>
              </ListGroup>
            </>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Novo Pedido</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreate} data-cy="order-form">
          <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}
            <p className="text-muted small mb-3">Selecione os produtos e quantidades:</p>
            {orderItems.map((item, i) => (
              <div key={i} className="d-flex gap-2 mb-2 align-items-center">
                <Form.Select
                  value={item.productId}
                  onChange={(e) => updateItem(i, 'productId', e.target.value)}
                  data-cy={`order-product-${i}`}
                  style={{ flex: 2 }}
                >
                  <option value="">Selecione...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — R$ {Number(p.price).toFixed(2)} (est: {p.stock})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', e.target.value)}
                  style={{ flex: 1 }}
                  data-cy={`order-qty-${i}`}
                />
                {orderItems.length > 1 && (
                  <Button size="sm" variant="outline-danger" onClick={() => removeItem(i)}>✕</Button>
                )}
              </div>
            ))}
            <Button size="sm" variant="outline-secondary" onClick={addItem} className="mt-1">
              + Adicionar produto
            </Button>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={saving} data-cy="order-save-btn">
              {saving ? <Spinner animation="border" size="sm" className="me-1" /> : null}
              Criar Pedido
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Layout>
  );
}