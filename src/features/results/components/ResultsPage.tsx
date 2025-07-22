import React, { useState } from 'react';
import UploadArea from './UploadArea';
import CandidateTable from './CandidateTable';
import { useCandidates } from '../hooks/useCandidates';
import { JobPosting } from '../../screening/types';
import { Candidate } from '../types';
import { sendCurriculumsToWebhook } from '../../../shared/services/webhookService';
import CandidateDetailModal from './CandidateDetailModal';
import { baserow } from '../../../shared/services/baserowClient';
import { useAuth } from '../../auth/hooks/useAuth';

const CANDIDATOS_TABLE_ID = '702'; // ID da tabela Candidatos

interface ResultsPageProps {
  selectedJob: JobPosting | null;
  onDataSynced: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ selectedJob, onDataSynced }) => {
  const { profile } = useAuth();
  const { candidates, isLoading, error: candidatesError, refetchCandidates } = useCandidates(selectedJob?.id);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const handleFilesSelected = async (files: FileList) => {
    if (!selectedJob || !profile) {
      setUploadError('Vaga ou usuário não identificado. Não é possível enviar os currículos.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const result = await sendCurriculumsToWebhook(files, selectedJob.id.toString());

      if (!result.success || !result.candidates) {
        throw new Error(result.message || 'A análise da IA falhou.');
      }
      
      const newCandidatos = result.candidates.map(c => ({
        nome: c.name,
        score: c.score,
        resumo_ia: c.summary,
        telefone: c.Telefone || null,
        vaga: [selectedJob.id],
        usuario: [profile.id],
      }));
      
      for (const candidato of newCandidatos) {
        await baserow.post(CANDIDATOS_TABLE_ID, candidato);
      }
      
      await refetchCandidates();
      onDataSynced();

    } catch (error) {
      console.error('Erro no processo de upload e salvamento:', error);
      setUploadError(error instanceof Error ? error.message : 'Erro ao processar currículos. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };
  
  const handleCloseDetailModal = () => {
    setSelectedCandidate(null);
  };

  if (!selectedJob) {
      return (
        <div className="text-center p-10">
            <h3 className="text-xl font-semibold">Nenhuma vaga selecionada</h3>
            <p className="text-gray-500 mt-2">Volte ao dashboard para selecionar uma vaga e ver os resultados.</p>
        </div>
      );
  }

  return (
    <>
      <div className="fade-in">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold">
            Resultados: {selectedJob?.titulo || 'Vaga não selecionada'}
          </h3>
          <p className="text-gray-600">
            Envie os currículos para iniciar a análise da IA.
          </p>
        </div>

        {(uploadError || candidatesError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{uploadError || candidatesError}</p>
          </div>
        )}

        <UploadArea
          onFilesSelected={handleFilesSelected}
          isUploading={isUploading}
        />
        
        <CandidateTable
          candidates={candidates}
          onViewDetails={handleViewDetails}
          isLoading={isLoading}
        />
      </div>

      {selectedCandidate && (
        <CandidateDetailModal 
          candidate={selectedCandidate}
          onClose={handleCloseDetailModal}
        />
      )}
    </>
  );
};

export default ResultsPage;