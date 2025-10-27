import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  QrCode, 
  History, 
  Plus, 
  Package, 
  Leaf, 
  Users, 
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  const isProducer = user?.type === 'producer';

  const consumerFeatures = [
    {
      title: 'Escanear QR Code',
      description: 'Escaneie códigos QR para rastrear a origem e sustentabilidade dos produtos',
      href: '/scan',
      icon: QrCode,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Catálogo de Produtos',
      description: 'Explore produtos de todos os produtores e veja avaliações da comunidade',
      href: '/catalog',
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Histórico de Produtos',
      description: 'Veja todos os produtos que você já rastreou e avaliou',
      href: '/history',
      icon: History,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    }
  ];

  const producerFeatures = [
    {
      title: 'Adicionar Produto',
      description: 'Cadastre novos produtos e lotes para rastreamento',
      href: '/add-product',
      icon: Plus,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700'
    },
    {
      title: 'Gestão de Estoque',
      description: 'Gerencie seu estoque e registre vendas',
      href: '/stock',
      icon: Package,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    }
  ];

  const stats = [
    {
      name: 'Produtos Rastreados',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Leaf
    },
    {
      name: 'Usuários Ativos',
      value: '5,678',
      change: '+8%',
      changeType: 'positive',
      icon: Users
    },
    {
      name: 'Impacto Ambiental',
      value: '89%',
      change: '+5%',
      changeType: 'positive',
      icon: TrendingUp
    },
    {
      name: 'Relatórios Gerados',
      value: '456',
      change: '+23%',
      changeType: 'positive',
      icon: BarChart3
    }
  ];

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo, {user?.displayName || user?.name || 'Usuário'}!
          </h1>
          <p className="text-muted-foreground">
            {isProducer 
              ? 'Gerencie seus produtos e acompanhe a rastreabilidade'
              : 'Descubra a origem e sustentabilidade dos seus alimentos'
            }
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="agro-card p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                    <div className="flex items-baseline">
                      <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                      <p className={`ml-2 text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            {isProducer ? 'Funcionalidades do Produtor' : 'Funcionalidades do Consumidor'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(isProducer ? producerFeatures : consumerFeatures).map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  to={feature.href}
                  className="group block"
                >
                  <div className={`agro-card p-6 hover:shadow-lg transition-all duration-200 group-hover:scale-105 ${feature.bgColor}`}>
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className={`text-lg font-semibold ${feature.textColor} group-hover:text-opacity-80`}>
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground mt-2">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/scan"
              className="agro-card p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center">
                <QrCode className="w-8 h-8 text-green-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-green-600">
                    Escanear QR Code
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Rastreie um produto agora
                  </p>
                </div>
              </div>
            </Link>

            {isProducer && (
              <Link
                to="/add-product"
                className="agro-card p-6 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center">
                  <Plus className="w-8 h-8 text-orange-600 mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-orange-600">
                      Cadastrar Produto
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Adicione um novo lote
                    </p>
                  </div>
                </div>
              </Link>
            )}

            <Link
              to="/history"
              className="agro-card p-6 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center">
                <History className="w-8 h-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-blue-600">
                    Ver Histórico
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Produtos rastreados
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">Atividade Recente</h2>
          <div className="agro-card p-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <p className="text-sm text-foreground">
                  Produto "Tomate Orgânico" foi rastreado com sucesso
                </p>
                <span className="ml-auto text-xs text-muted-foreground">2 min atrás</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <p className="text-sm text-foreground">
                  Novo lote "Alface Hidropônica" cadastrado
                </p>
                <span className="ml-auto text-xs text-muted-foreground">1 hora atrás</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <p className="text-sm text-foreground">
                  Relatório de sustentabilidade gerado
                </p>
                <span className="ml-auto text-xs text-muted-foreground">3 horas atrás</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
