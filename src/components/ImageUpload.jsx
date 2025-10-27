import React, { useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import toast from 'react-hot-toast';

const ImageUpload = ({ 
  onImageUpload, 
  currentImage, 
  placeholder = "Clique para fazer upload de uma imagem",
  className = ""
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);

    try {
      // Criar referência única no Storage
      const imageRef = ref(storage, `images/${Date.now()}-${file.name}`);
      
      // Fazer upload
      const snapshot = await uploadBytes(imageRef, file);
      
      // Obter URL de download
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setPreview(downloadURL);
      onImageUpload(downloadURL);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    onImageUpload(null);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload"
        disabled={uploading}
      />
      
      <label
        htmlFor="image-upload"
        className={`cursor-pointer block border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          preview 
            ? 'border-green-300 bg-green-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                removeImage();
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
            )}
            <p className="text-sm text-gray-600">
              {uploading ? 'Enviando...' : placeholder}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              PNG, JPG, GIF até 5MB
            </p>
          </div>
        )}
      </label>
    </div>
  );
};

export default ImageUpload;
