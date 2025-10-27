import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Calendar,
  Eye,
  User,
  Package
} from 'lucide-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

const CatalogPage = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, filterType]);

  const fetchProducts = async () => {
    try {
      const productsQuery = query(
        collection(db, 'products'),
        orderBy('createdAt', 'desc')
      );
      
      const productsSnapshot = await getDocs(productsQuery);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(productsList);
      
      // Buscar avaliações para cada produto
      const ratingsData = {};
      for (const product of productsList) {
        const ratingsQuery = query(
          collection(db, 'ratings'),
          where('product_id', '==', product.id)
        );
        const ratingsSnapshot = await getDocs(ratingsQuery);
        const productRatings = ratingsSnapshot.docs.map(doc => doc.data().rating);
        
        if (productRatings.length > 0) {
          ratingsData[product.id] = {
            average: productRatings.reduce((sum, rating) => sum + rating, 0) / productRatings.length,
            count: productRatings.length
          };
        }
      }
      
      setRatings(ratingsData);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.producerName?.toLowerCase().includes(searchTerm.toLowerCase())
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
    } else if (filterType === 'rated') {
      filtered = filtered.filter(product => 
        ratings[product.id] && ratings[product.id].count > 0
      );
    }

    setFilteredProducts(filtered);
  };

  const getRatingStars = (productId) => {
    const rating = ratings[productId];
    if (!rating) return null;
    
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating.average)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-muted-foreground">
          ({rating.count})
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando catálogo...</p>
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
            <Package className="w-8 h-8 mr-3 text-green-600" />
            Catálogo de Produtos
          </h1>
          <p className="text-muted-foreground">
            Descubra produtos de todos os produtores e veja as avaliações da comunidade
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
              <User className="w-8 h-8 text-green-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produtores</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(products.map(p => p.producerId)).size}
                </p>
              </div>
            </div>
          </div>
          
          <div className="agro-card p-6">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produtos Avaliados</p>
                <p className="text-2xl font-bold text-foreground">
                  {Object.keys(ratings).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="agro-card p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-purple-600 mr-4" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                <p className="text-2xl font-bold text-foreground">
                  {products.filter(p => {
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    return new Date(p.createdAt) > oneWeekAgo;
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
                  placeholder="Buscar produtos, produtores..."
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
                <option value="rated">Avaliados</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full agro-card p-12 text-center">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm || filterType !== 'all' ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || filterType !== 'all' 
                  ? 'Tente ajustar os filtros de busca'
                  : 'Ainda não há produtos cadastrados no sistema'
                }
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="agro-card p-6 hover:shadow-lg transition-all duration-200">
                {/* Product Image */}
                {product.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
                
                {/* Product Info */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {product.name}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{product.origin}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span>{product.producerName}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(product.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                {ratings[product.id] && (
                  <div className="mb-4">
                    {getRatingStars(product.id)}
                  </div>
                )}

                {/* Certifications */}
                {product.certifications && product.certifications.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {product.certifications.slice(0, 3).map((cert, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {cert}
                        </span>
                      ))}
                      {product.certifications.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{product.certifications.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Link
                  to={`/product/${product.id}`}
                  className="w-full flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Detalhes
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CatalogPage;
