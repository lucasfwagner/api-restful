import { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { STATUS_LABELS } from '../utils/orderStatus';

function StatCard({ title, value, color, link, loading }) {
  return (
    <Col xs={12} md={4}>
      <Card className="h-100">
        <Card.Body className="d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <p className="text-muted mb-1 small fw-semibold text-uppercase">{title}</p>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <h3 className={`fw-bold text-${color} mb-0`}>{value}</h3>
              )}
            </div>
          </div>
          <Link to={link} className="mt-auto small text-decoration-none">
            Ver detalhes →
          </Link>
        </Card.Body>
      </Card>
    </Col>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          api.get('/products?limit=100'),
          api.get('/orders'),
        ]);
        setStats({
          products: productsRes.data.total,
          orders: ordersRes.data.length,
          revenue: ordersRes.data
            .filter((o) => o.status === 'completed')
            .reduce((acc, o) => acc + o.total, 0),
        });
        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <Layout>
      <div className="mb-4">
        <h4 className="fw-bold mb-0">Bem-vindo, {user?.name}!</h4>
        <p className="text-muted">Aqui está um resumo da sua loja.</p>
      </div>

      <Row className="g-3 mb-4">
        <StatCard title="Total de Produtos" value={stats?.products ?? '—'} color="primary" link="/products" loading={loading} />
        <StatCard title="Total de Pedidos" value={stats?.orders ?? '—'} color="success" link="/orders" loading={loading} />
        <StatCard
          title="Receita (concluídos)"
          value={stats ? `R$ ${stats.revenue.toFixed(2)}` : '—'}
          color="warning"
          link="/orders"
          loading={loading}
        />
      </Row>

      <Card>
        <Card.Header className="bg-white fw-semibold">Pedidos Recentes</Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-center text-muted p-4 mb-0">Nenhum pedido encontrado.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => {
                    const s = STATUS_LABELS[order.status] || { label: order.status, bg: 'secondary', text: 'white' };
                    return (
                      <tr key={order.id}>
                        <td>
                          <Link to="/orders" className="text-decoration-none">#{order.id}</Link>
                        </td>
                        <td>
                          <Badge bg={s.bg} text={s.text}>{s.label}</Badge>
                        </td>
                        <td>R$ {order.total.toFixed(2)}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>
    </Layout>
  );
}