import React, { useCallback } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadAreaProps {
  onFilesSelected: (files: FileList) => void;
  isUploading?: boolean;
  jobId?: string;
}

const UploadArea: React.FC<UploadAreaProps> = ({ 
  onFilesSelected, 
  isUploading = false,
  jobId
}) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  };

  const sendToWebhook = async (files: FileList, jobId: string) => {
    const formData = new FormData();
    
    // Adicionar todos os arquivos ao FormData
    Array.from(files).forEach((file, index) => {
      formData.append(`curriculo_${index}`, file);
    });
    
    // Adicionar ID da vaga
    formData.append('job_id', jobId);
    
    try {
      const response = await fetch('https://webhook.focoserv.com.br/webhook/recrutamento', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Erro ao enviar currículos para análise');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro no webhook:', error);
      throw error;
    }
  };

  return (
    <div 
      className={`bg-white p-8 rounded-lg shadow-sm border-2 border-dashed text-center mb-8 transition-colors ${
        isUploading 
          ? 'border-indigo-300 bg-indigo-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <UploadCloud 
        className={`mx-auto ${isUploading ? 'text-indigo-400' : 'text-gray-400'}`} 
        size={48} 
      />
      <h4 className="mt-4 text-lg font-semibold text-gray-700">
        {isUploading ? 'Processando currículos...' : 'Arraste e solte os currículos aqui'}
      </h4>
      {!isUploading && (
        <>
          <p className="text-gray-500">ou</p>
          <label className="mt-4 inline-block">
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.doc"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading}
            />
            <span className="px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold rounded-md hover:bg-indigo-100 transition-colors cursor-pointer">
              Selecione os arquivos
            </span>
          </label>
          <p className="mt-2 text-xs text-gray-500">Formatos suportados: PDF, DOCX</p>
          <p className="mt-1 text-xs text-indigo-600">
            Os currículos serão enviados automaticamente para análise da IA
          </p>
        </>
      )}
    </div>
  );
};

export default UploadArea;