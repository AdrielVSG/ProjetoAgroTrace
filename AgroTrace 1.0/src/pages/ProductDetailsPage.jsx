import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { 
  ArrowLeft, 
  Share2, 
  Star, 
  MapPin, 
  Droplets, 
  Shield, 
  Calendar,
  Leaf,
  Award,
  BarChart3
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [allRatings, setAllRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    fetchProduct();
    fetchAllRatings();
    if (user) {
      checkUserRating();
    }
  }, [id, user]);

  const fetchProduct = async () => {
    try {
      const productRef = doc(db, 'products', id);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        setProduct({
          id: productSnap.id,
          ...productSnap.data()
        });
      } else {
        toast.error('Produto não encontrado');
        navigate('/scan');
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      toast.error('Erro ao carregar produto');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRatings = async () => {
    try {
      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('product_id', '==', id),
        orderBy('created_at', 'desc')
      );
      
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const ratingsList = ratingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAllRatings(ratingsList);
      
      // Calcular média
      if (ratingsList.length > 0) {
        const sum = ratingsList.reduce((acc, rating) => acc + rating.rating, 0);
        setAverageRating(sum / ratingsList.length);
      }
    } catch (error) {
      console.error('Erro ao buscar avaliações:', error);
    }
  };

  const checkUserRating = async () => {
    try {
      const ratingsQuery = query(
        collection(db, 'ratings'),
        where('product_id', '==', id),
        where('user_id', '==', user.uid)
      );
      const querySnapshot = await getDocs(ratingsQuery);
      
      if (!querySnapshot.empty) {
        const ratingDoc = querySnapshot.docs[0];
        setUserRating(ratingDoc.data().rating);
        setHasRated(true);
      }
    } catch (error) {
      console.error('Erro ao verificar avaliação:', error);
    }
  };

  const handleRating = async (rating) => {
    if (hasRated) {
      toast.error('Você já avaliou este produto');
      return;
    }

    setRatingLoading(true);
    try {
      await addDoc(collection(db, 'ratings'), {
        product_id: id,
        user_id: user.uid,
        rating: rating,
        timestamp: new Date().toISOString()
      });

      setUserRating(rating);
      setHasRated(true);
      toast.success(`Avaliação de ${rating} estrelas registrada!`);
      
      // Recarregar todas as avaliações
      await fetchAllRatings();
    } catch (error) {
      console.error('Erro ao avaliar produto:', error);
      toast.error('Erro ao registrar avaliação');
    } finally {
      setRatingLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Produto: ${product?.name}`,
        text: `Confira as informações de rastreabilidade deste produto no AgroTrace`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando produto...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="p-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Produto não encontrado</h1>
          <button
            onClick={() => navigate('/scan')}
            className="agro-button-primary px-6 py-2"
          >
            Voltar ao Scanner
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>
          <button
            onClick={handleShare}
            className="flex items-center agro-button-secondary px-4 py-2"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Compartilhar
          </button>
        </div>

        {/* Product Info */}
        <div className="agro-card p-8 mb-6">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {product.name}
            </h1>
            <p className="text-muted-foreground">
              Código de Rastreamento: {product.id}
            </p>
          </div>

          {/* Product Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Origem</h3>
                  <p className="text-muted-foreground">{product.origin || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Droplets className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Uso de Água</h3>
                  <p className="text-muted-foreground">{product.waterUsage || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Data de Cadastro</h3>
                  <p className="text-muted-foreground">
                    {product.timestamp ? new Date(product.timestamp).toLocaleDateString('pt-BR') : 'Não informado'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start">
                <Shield className="w-5 h-5 text-green-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Certificações</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {product.certifications && product.certifications.length > 0 ? (
                      product.certifications.map((cert, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {cert}
                        </span>
                      ))
                    ) : (
                      <p className="text-muted-foreground">Nenhuma certificação</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start">
                <BarChart3 className="w-5 h-5 text-green-600 mr-3 mt-1" />
                <div>
                  <h3 className="font-semibold text-foreground">Impacto Ambiental</h3>
                  <p className="text-muted-foreground">
                    {product.environmentalImpact || 'Dados não disponíveis'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-foreground mb-3">Descrição</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}
        </div>

        {/* Rating Section */}
        {user && (
          <div className="agro-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Avalie este Produto
            </h3>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRating(star)}
                  disabled={hasRated || ratingLoading}
                  className={`w-10 h-10 text-2xl transition-colors ${
                    star <= userRating
                      ? 'text-yellow-400'
                      : 'text-gray-300 hover:text-yellow-200'
                  } ${hasRated || ratingLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  ★
                </button>
              ))}
            </div>
            {hasRated && (
              <p className="text-sm text-green-600 mt-2">
                Obrigado! Você avaliou este produto com {userRating} estrelas.
              </p>
            )}
            {ratingLoading && (
              <p className="text-sm text-muted-foreground mt-2">
                Registrando avaliação...
              </p>
            )}
          </div>
        )}

        {/* Sustainability Info */}
        <div className="agro-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Award className="w-5 h-5 mr-2 text-green-600" />
            Informações de Sustentabilidade
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Droplets className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-foreground">Uso de Água</h4>
              <p className="text-sm text-muted-foreground">{product.waterUsage || 'N/A'}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-foreground">Orgânico</h4>
              <p className="text-sm text-muted-foreground">
                {product.certifications?.includes('Orgânico') ? 'Sim' : 'Não'}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-foreground">Certificações</h4>
              <p className="text-sm text-muted-foreground">
                {product.certifications?.length || 0} certificações
              </p>
            </div>
          </div>
        </div>

        {/* Community Ratings */}
        {allRatings.length > 0 && (
          <div className="agro-card p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-600" />
              Avaliações da Comunidade
            </h3>
            
            {/* Average Rating */}
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avaliação Média</p>
                  <div className="flex items-center mt-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(averageRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-lg font-semibold">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      ({allRatings.length} avaliações)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Ratings */}
            <div className="space-y-4">
              {allRatings.map((rating) => (
                <div key={rating.id} className="border-b border-border pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                        {rating.user_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {rating.user_name || 'Usuário Anônimo'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(rating.timestamp).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rating.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {rating.comment && (
                    <p className="text-sm text-muted-foreground ml-11">
                      "{rating.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailsPage;
