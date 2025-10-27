import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { QrCode, Camera, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import toast from 'react-hot-toast';

const ScanPage = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Simular escaneamento de QR Code (em produção, usar biblioteca real)
  const simulateQRScan = () => {
    setIsScanning(true);
    setError(null);
    
    // Simular delay de escaneamento
    setTimeout(() => {
      // Dados simulados para demonstração
      const mockQRData = 'TRC12345';
      handleQRCodeScanned(mockQRData);
    }, 2000);
  };

  const handleQRCodeScanned = async (qrData) => {
    setLoading(true);
    setIsScanning(false);
    
    try {
      // Buscar produto no Firestore usando o ID do QR Code
      const productRef = doc(db, 'products', qrData);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        const productData = productSnap.data();
        setScannedData({
          id: qrData,
          ...productData
        });
        toast.success('Produto encontrado!');
      } else {
        setError('Produto não encontrado no sistema');
        toast.error('Produto não encontrado');
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      setError('Erro ao buscar informações do produto');
      toast.error('Erro ao buscar produto');
    } finally {
      setLoading(false);
    }
  };

  const resetScan = () => {
    setScannedData(null);
    setError(null);
    setIsScanning(false);
  };

  const goToProductDetails = () => {
    if (scannedData) {
      navigate(`/product/${scannedData.id}`);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Escanear QR Code
          </h1>
          <p className="text-muted-foreground">
            Aponte a câmera para o código QR do produto para rastrear sua origem
          </p>
        </div>

        {/* Scanner Area */}
        <div className="agro-card p-8">
          {!isScanning && !scannedData && !loading && !error && (
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-muted rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Pronto para Escanear
              </h3>
              <p className="text-muted-foreground mb-6">
                Clique no botão abaixo para iniciar o escaneamento do QR Code
              </p>
              <button
                onClick={simulateQRScan}
                className="agro-button-primary px-8 py-3 text-lg"
              >
                <Camera className="w-5 h-5 mr-2 inline" />
                Iniciar Escaneamento
              </button>
            </div>
          )}

          {isScanning && (
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-green-100 rounded-lg flex items-center justify-center animate-pulse">
                <Loader className="w-16 h-16 text-green-600 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Escaneando...
              </h3>
              <p className="text-muted-foreground mb-6">
                Aponte a câmera para o código QR do produto
              </p>
              <div className="w-64 h-64 mx-auto border-4 border-green-500 border-dashed rounded-lg flex items-center justify-center">
                <QrCode className="w-16 h-16 text-green-500" />
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <Loader className="w-16 h-16 text-blue-600 animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Buscando Informações...
              </h3>
              <p className="text-muted-foreground">
                Verificando dados do produto no sistema
              </p>
            </div>
          )}

          {error && (
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-16 h-16 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Erro no Escaneamento
              </h3>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <button
                onClick={resetScan}
                className="agro-button-secondary px-6 py-2"
              >
                Tentar Novamente
              </button>
            </div>
          )}

          {scannedData && (
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">
                Produto Encontrado!
              </h3>
              <div className="agro-card p-6 mb-6 text-left">
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  {scannedData.name || 'Produto Desconhecido'}
                </h4>
                <p className="text-muted-foreground mb-2">
                  <strong>Origem:</strong> {scannedData.origin || 'Não informado'}
                </p>
                <p className="text-muted-foreground mb-2">
                  <strong>Uso de Água:</strong> {scannedData.waterUsage || 'Não informado'}
                </p>
                <p className="text-muted-foreground">
                  <strong>ID do QR:</strong> {scannedData.id}
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={goToProductDetails}
                  className="agro-button-primary px-6 py-2"
                >
                  Ver Detalhes Completos
                </button>
                <button
                  onClick={resetScan}
                  className="agro-button-secondary px-6 py-2"
                >
                  Escanear Outro
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 agro-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Como Funciona o Rastreamento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-foreground font-bold">1</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Escaneie o QR Code</h4>
              <p className="text-sm text-muted-foreground">
                Use a câmera para escanear o código QR do produto
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-foreground font-bold">2</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Veja as Informações</h4>
              <p className="text-sm text-muted-foreground">
                Acesse dados sobre origem, sustentabilidade e certificações
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary-foreground font-bold">3</span>
              </div>
              <h4 className="font-semibold text-foreground mb-2">Avalie o Produto</h4>
              <p className="text-sm text-muted-foreground">
                Deixe sua avaliação e ajude outros consumidores
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ScanPage;
