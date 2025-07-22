import { useMemo } from 'react';
import { JobPosting } from '../../screening/types';
import { Candidate } from '../../results/types';

export interface DashboardStats {
  activeJobs: number;
  totalCandidates: number;
  averageScore: number;
  approvedCandidates: number;
}

// O hook agora apenas calcula, não busca mais dados.
export const useDashboardStats = (jobs: JobPosting[], candidates: Candidate[]) => {
  const stats: DashboardStats = useMemo(() => {
    const activeJobs = jobs.length;
    const totalCandidates = candidates.length;

    const approvedCandidates = candidates.filter(
      (c) => c.score && c.score >= 90
    ).length;

    let averageScore = 0;
    if (totalCandidates > 0) {
      const totalScore = candidates.reduce((acc, curr) => acc + (curr.score || 0), 0);
      averageScore = Math.round(totalScore / totalCandidates);
    }

    return {
      activeJobs,
      totalCandidates,
      averageScore,
      approvedCandidates,
    };
  }, [jobs, candidates]);

  // Como o cálculo é instantâneo, não precisamos mais de isLoading ou error aqui.
  return { stats };
};