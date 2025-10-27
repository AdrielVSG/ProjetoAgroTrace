import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  History, 
  Search, 
  Filter, 
  Star, 
  Calendar,
  MapPin,
  Eye,
  TrendingUp,
  Clock
} from 'lucide-react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const HistoryPage = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredHistory, setFilteredHistory] = useState([]);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    filterHistory();
  }, [history, searchTerm, filterType]);

  const fetchHistory = async () => {
    try {
      // Buscar avaliações do usuário
      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('user_id', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const productIds = ratingsSnapshot.docs.map(doc => doc.data().product_id);
      
      if (productIds.length === 0) {
        setHistory([]);
        setLoading(false);
        return;
      }

      // Buscar detalhes dos produtos
      const historyList = [];
      for (const ratingDoc of ratingsSnapshot.docs) {
        const ratingData = ratingDoc.data();
        
        // Buscar produto usando o product_id como ID do documento
        const productQuery = query(
          collection(db, 'products'),
          where('__name__', '==', ratingData.product_id)
        );
        const productSnapshot = await getDocs(productQuery);
        
        if (!productSnapshot.empty) {
          const productData = productSnapshot.docs[0].data();
          historyList.push({
            id: ratingData.product_id,
            rating: ratingData.rating,
            timestamp: ratingData.timestamp,
            ...productData
          });
        }
      }
      
      setHistory(historyList);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = history;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (filterType === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(item => 
        new Date(item.timestamp) > oneWeekAgo
      );
    } else if (filterType === 'high-rated') {
      filtered = filtered.filter(item => item.rating >= 4);
    } else if (filterType === 'low-rated') {
      filtered = filtered.filter(item => item.rating <= 2);
    }

    setFilteredHistory(filtered);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const itemDate = new Date(timestamp);
    const diffInHours = Math.floor((now - itemDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Agora mesmo';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks}sem atrás`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mes atrás`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando histórico...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <History className="w-8 h-8 mr-3 text-blue-600" />
            Histórico de Produtos
          </h1>
          <p className="text-muted-foreground">
            Veja todos os produtos que você já rastreou e avaliou
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="agro-card p-6">
            <div className="flex items-center">
              <History className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rastreado</p>
                <p className="text-2xl font-bold text-foreground">{history.length}</p>
              </div>
            </div>
          </div>
          
          <div className="agro-card p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avaliação Média</p>
                <p className="text-2xl font-bold text-foreground">
                  {history.length > 0 
                    ? (history.reduce((sum, item) => sum + item.rating, 0) / history.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
          
          <div className="agro-card p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Bem Avaliados</p>
                <p className="text-2xl font-bold text-foreground">
                  {history.filter(item => item.rating >= 4).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="agro-card p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold text-foreground">
                  {history.filter(item => {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    return new Date(item.timestamp) > oneWeekAgo;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="agro-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar no histórico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="agro-input pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="agro-input"
              >
                <option value="all">Todos</option>
                <option value="recent">Recentes (7 dias)</option>
                <option value="high-rated">Bem avaliados (4+ estrelas)</option>
                <option value="low-rated">Mal avaliados (≤2 estrelas)</option>
              </select>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {filteredHistory.length === 0 ? (
            <div className="agro-card p-12 text-center">
              <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm || filterType !== 'all' ? 'Nenhum item encontrado' : 'Nenhum produto rastreado'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || filterType !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece escaneando seu primeiro produto'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <Link
                  to="/scan"
                  className="agro-button-primary px-6 py-2 inline-flex items-center"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Escanear Produto
                </Link>
              )}
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div key={`${item.id}-${item.timestamp}`} className="agro-card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="text-lg font-semibold text-foreground mr-3">
                        {item.name}
                      </h3>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < item.rating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className={`ml-2 font-semibold ${getRatingColor(item.rating)}`}>
                          {item.rating}/5
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{item.origin}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{getTimeAgo(item.timestamp)}</span>
                      </div>
                      <div>
                        <strong>ID QR:</strong> {item.id}
                      </div>
                    </div>
                    
                    {item.certifications && item.certifications.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {item.certifications.map((cert, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    <Link
                      to={`/product/${item.id}`}
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver detalhes
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default HistoryPage;
