import React from 'react';
import { Candidate } from '../types';
import { MessageCircle, Eye } from 'lucide-react';

// Reutilizando a função que já criamos para formatar o telefone
const formatPhoneNumberForWhatsApp = (phone: string | null): string | null => {
  if (!phone) return null;
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length === 11) return `55${digitsOnly}`;
  if (digitsOnly.length === 13) return digitsOnly;
  return null; 
};

interface CandidateTableProps {
  candidates: Candidate[];
  onViewDetails: (candidate: Candidate) => void;
  isLoading?: boolean;
}

const CandidateTable: React.FC<CandidateTableProps> = ({ 
  candidates, 
  onViewDetails,
  isLoading = false 
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    // ... (código de loading continua o mesmo)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Histórico de Candidatos Analisados</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-gray-500 uppercase border-b">
              <th className="px-4 py-3">Candidato</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Resumo da IA</th>
              <th className="px-4 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => {
              const whatsappNumber = formatPhoneNumberForWhatsApp(candidate.TELEFONE);
              return (
                <tr key={candidate.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{candidate.NOME}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className={`font-bold mr-2 ${getScoreColor(candidate.SCORE || 0)}`}>
                        {candidate.SCORE || 0}%
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getScoreBarColor(candidate.SCORE || 0)}`}
                          style={{ width: `${candidate.SCORE || 0}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-sm">
                    {candidate['RESUMO IA']}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center space-x-2">
                       {/* BOTÃO VER DETALHES */}
                       <button 
                        onClick={() => onViewDetails(candidate)}
                        className="p-2 text-gray-500 hover:bg-gray-200 hover:text-indigo-600 rounded-full transition-colors"
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {/* BOTÃO WHATSAPP */}
                      <a
                        href={whatsappNumber ? `https://wa.me/${whatsappNumber}` : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => !whatsappNumber && e.preventDefault()}
                        className={`p-2 rounded-full transition-colors ${
                          !whatsappNumber 
                            ? 'text-gray-300 cursor-not-allowed' 
                            : 'text-gray-500 hover:bg-green-100 hover:text-green-600'
                        }`}
                        title={whatsappNumber ? 'Chamar no WhatsApp' : 'Telefone não disponível'}
                      >
                        <MessageCircle size={18} />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CandidateTable;
