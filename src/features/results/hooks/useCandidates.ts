import { useState, useEffect, useCallback } from 'react';
import { Candidate } from '../types';
import { baserow } from '../../../shared/services/baserowClient';

const CANDIDATOS_TABLE_ID = '702'; // ID da tabela Candidatos

export const useCandidates = (jobId?: number) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCandidates = useCallback(async () => {
    if (!jobId) {
      setCandidates([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = `?filter__field_vaga__contains=${jobId}&sorts=-data_triagem`;
      const { results } = await baserow.get(CANDIDATOS_TABLE_ID, params);

      setCandidates(results || []);
    } catch (err: any) {
      console.error('Erro ao buscar candidatos no Baserow:', err);
      setError('Não foi possível carregar o histórico de candidatos.');
    } finally {
      setIsLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  return {
    candidates,
    isLoading,
    error,
    refetchCandidates: fetchCandidates,
  };
};