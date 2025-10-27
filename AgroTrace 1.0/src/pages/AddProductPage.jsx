import React, { useState } from 'react';
import Layout from '../components/Layout';
import { 
  Plus, 
  Package, 
  MapPin, 
  Droplets, 
  Shield, 
  FileText,
  Save,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from '../components/ImageUpload';
import toast from 'react-hot-toast';

const AddProductPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    qrCodeId: '',
    name: '',
    origin: '',
    waterUsage: '',
    certifications: '',
    description: '',
    environmentalImpact: '',
    harvestDate: '',
    batchNumber: '',
    imageUrl: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar campos obrigatórios
      if (!formData.qrCodeId || !formData.name || !formData.origin) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      // Preparar dados do produto
      const productData = {
        name: formData.name,
        origin: formData.origin,
        waterUsage: formData.waterUsage || 'Não informado',
        certifications: formData.certifications 
          ? formData.certifications.split(',').map(c => c.trim()).filter(c => c)
          : [],
        description: formData.description || `Produto rastreado via AgroTrace. Lote: ${formData.qrCodeId}`,
        environmentalImpact: formData.environmentalImpact || 'Dados não disponíveis',
        harvestDate: formData.harvestDate || '',
        batchNumber: formData.batchNumber || formData.qrCodeId,
        imageUrl: formData.imageUrl || '',
        producerId: user.uid,
        producerName: user.displayName || user.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Salvar no Firestore usando o QR Code ID como documento ID
      await setDoc(doc(db, 'products', formData.qrCodeId), productData);

      toast.success('Produto cadastrado com sucesso!');
      
      // Limpar formulário
      setFormData({
        qrCodeId: '',
        name: '',
        origin: '',
        waterUsage: '',
        certifications: '',
        description: '',
        environmentalImpact: '',
        harvestDate: '',
        batchNumber: ''
      });

    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      toast.error('Erro ao cadastrar produto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCodeId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    const qrId = `TRC${timestamp}${random}`.toUpperCase();
    setFormData(prev => ({ ...prev, qrCodeId: qrId }));
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <Plus className="w-8 h-8 mr-3 text-orange-600" />
            Cadastrar Novo Produto
          </h1>
          <p className="text-muted-foreground">
            Adicione informações detalhadas sobre seu produto para rastreabilidade
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="agro-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Informações Básicas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="qrCodeId" className="block text-sm font-medium text-foreground mb-2">
                  ID do QR Code *
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="qrCodeId"
                    name="qrCodeId"
                    value={formData.qrCodeId}
                    onChange={handleInputChange}
                    required
                    className="agro-input rounded-r-none"
                    placeholder="Ex: TRC12345"
                  />
                  <button
                    type="button"
                    onClick={generateQRCodeId}
                    className="px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-r-md hover:bg-secondary/80 transition-colors"
                  >
                    Gerar
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="agro-input"
                  placeholder="Ex: Tomate Orgânico"
                />
              </div>

              <div>
                <label htmlFor="origin" className="block text-sm font-medium text-foreground mb-2">
                  Origem/Fazenda *
                </label>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  required
                  className="agro-input"
                  placeholder="Ex: Fazenda Sol Nascente"
                />
              </div>

              <div>
                <label htmlFor="batchNumber" className="block text-sm font-medium text-foreground mb-2">
                  Número do Lote
                </label>
                <input
                  type="text"
                  id="batchNumber"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleInputChange}
                  className="agro-input"
                  placeholder="Ex: LOTE001"
                />
              </div>
            </div>
          </div>

          {/* Sustainability Information */}
          <div className="agro-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
              <Droplets className="w-5 h-5 mr-2 text-green-600" />
              Informações de Sustentabilidade
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="waterUsage" className="block text-sm font-medium text-foreground mb-2">
                  Uso de Água
                </label>
                <input
                  type="text"
                  id="waterUsage"
                  name="waterUsage"
                  value={formData.waterUsage}
                  onChange={handleInputChange}
                  className="agro-input"
                  placeholder="Ex: 45 Litros/kg"
                />
              </div>

              <div>
                <label htmlFor="harvestDate" className="block text-sm font-medium text-foreground mb-2">
                  Data da Colheita
                </label>
                <input
                  type="date"
                  id="harvestDate"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleInputChange}
                  className="agro-input"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="environmentalImpact" className="block text-sm font-medium text-foreground mb-2">
                  Impacto Ambiental
                </label>
                <input
                  type="text"
                  id="environmentalImpact"
                  name="environmentalImpact"
                  value={formData.environmentalImpact}
                  onChange={handleInputChange}
                  className="agro-input"
                  placeholder="Ex: Baixo impacto, agricultura sustentável"
                />
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div className="agro-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Certificações e Qualidade
            </h2>
            
            <div>
              <label htmlFor="certifications" className="block text-sm font-medium text-foreground mb-2">
                Certificações (separadas por vírgula)
              </label>
              <input
                type="text"
                id="certifications"
                name="certifications"
                value={formData.certifications}
                onChange={handleInputChange}
                className="agro-input"
                placeholder="Ex: Orgânico, Fair Trade, ISO 14001"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Separe múltiplas certificações com vírgulas
              </p>
            </div>
          </div>

          {/* Image Upload */}
          <div className="agro-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2 text-purple-600" />
              Imagem do Produto
            </h2>
            
            <ImageUpload
              onImageUpload={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
              currentImage={formData.imageUrl}
              placeholder="Clique para adicionar uma imagem do produto"
            />
          </div>

          {/* Description */}
          <div className="agro-card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-600" />
              Descrição Adicional
            </h2>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                Descrição do Produto
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="agro-input resize-none"
                placeholder="Descreva características especiais, métodos de cultivo, etc."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="agro-button-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
                  Cadastrando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Cadastrar Produto
                </>
              )}
            </button>
          </div>
        </form>

        {/* Success Message */}
        {!loading && formData.qrCodeId && (
          <div className="mt-8 agro-card p-6 bg-green-50 border-green-200">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-semibold text-green-800">Próximos Passos</h3>
                <p className="text-green-700 text-sm mt-1">
                  Após cadastrar, você poderá gerar o QR Code físico para colar no produto.
                  O código <strong>{formData.qrCodeId}</strong> será usado para rastreamento.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AddProductPage;
