import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Package, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const StockPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterType]);

  const fetchProducts = () => {
    const productsQuery = query(
      collection(db, 'products'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const productsList = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(product => product.producerId === user.uid);
      setProducts(productsList);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao carregar produtos');
      setLoading(false);
    });

    return unsubscribe;
  };

  const filterProducts = () => {
    let filtered = products;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (filterType === 'recent') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      filtered = filtered.filter(product => 
        new Date(product.createdAt) > oneWeekAgo
      );
    } else if (filterType === 'certified') {
      filtered = filtered.filter(product => 
        product.certifications && product.certifications.length > 0
      );
    }

    setFilteredProducts(filtered);
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (window.confirm(`Tem certeza que deseja remover "${productName}" do estoque?`)) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        toast.success('Produto removido com sucesso');
      } catch (error) {
        console.error('Erro ao remover produto:', error);
        toast.error('Erro ao remover produto');
      }
    }
  };

  const getProductStatus = (product) => {
    const createdAt = new Date(product.createdAt);
    const now = new Date();
    const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    if (daysDiff <= 7) {
      return { status: 'recent', color: 'text-green-600', icon: CheckCircle };
    } else if (daysDiff <= 30) {
      return { status: 'normal', color: 'text-blue-600', icon: Clock };
    } else {
      return { status: 'old', color: 'text-orange-600', icon: AlertTriangle };
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando estoque...</p>
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
            <Package className="w-8 h-8 mr-3 text-purple-600" />
            Gestão de Estoque
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus produtos cadastrados e acompanhe o estoque
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="agro-card p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Produtos</p>
                <p className="text-2xl font-bold text-foreground">{products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="agro-card p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produtos Recentes</p>
                <p className="text-2xl font-bold text-foreground">
                  {products.filter(p => {
                    const daysDiff = Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24));
                    return daysDiff <= 7;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="agro-card p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-orange-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produtos Antigos</p>
                <p className="text-2xl font-bold text-foreground">
                  {products.filter(p => {
                    const daysDiff = Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24));
                    return daysDiff > 30;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="agro-card p-6">
            <div className="flex items-center">
              <Filter className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Certificados</p>
                <p className="text-2xl font-bold text-foreground">
                  {products.filter(p => p.certifications && p.certifications.length > 0).length}
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
                  placeholder="Buscar produtos..."
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
                <option value="certified">Certificados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {filteredProducts.length === 0 ? (
            <div className="agro-card p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm || filterType !== 'all' ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece cadastrando seu primeiro produto'
                }
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => {
              const status = getProductStatus(product);
              const StatusIcon = status.icon;
              
              return (
                <div key={product.id} className="agro-card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-foreground mr-3">
                          {product.name}
                        </h3>
                        <StatusIcon className={`w-5 h-5 ${status.color}`} />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <strong>Origem:</strong> {product.origin}
                        </div>
                        <div>
                          <strong>ID QR:</strong> {product.id}
                        </div>
                        <div>
                          <strong>Cadastrado:</strong> {new Date(product.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      
                      {product.certifications && product.certifications.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-2">
                            {product.certifications.map((cert, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => window.open(`/product/${product.id}`, '_blank')}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Remover produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StockPage;
