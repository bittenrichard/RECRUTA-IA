import React, { useState, useMemo } from 'react';
import StatCard from './StatCard';
import RecentScreenings from './RecentScreenings';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { JobPosting } from '../../screening/types';
import { PageKey } from '../../../shared/types';
import ApprovedCandidatesModal from './ApprovedCandidatesModal';
import { Candidate } from '../../results/types';

interface DashboardPageProps {
  jobs: JobPosting[];
  candidates: Candidate[];
  onViewResults: (job: JobPosting) => void;
  onDeleteJob: (jobId: number) => void;
  onNavigate: (page: PageKey) => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  jobs,
  candidates,
  onViewResults,
  onDeleteJob,
  onNavigate,
}) => {
  const { stats } = useDashboardStats(jobs, candidates);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isApprovedModalOpen, setIsApprovedModalOpen] = useState(false);
  
  // A lógica para candidatos aprovados agora filtra a lista que já temos
  const approvedCandidates = useMemo(() => {
    return candidates.filter(c => c.score && c.score >= 90);
  }, [candidates]);


  const filteredJobs = useMemo(() => {
    const jobsWithStats = jobs.map(job => {
        const jobCandidates = candidates.filter(c => c.vaga.some(v => v.id === job.id));
        const candidateCount = jobCandidates.length;
        let averageScore = 0;
        if (candidateCount > 0) {
            const totalScore = jobCandidates.reduce((acc, curr) => acc + (curr.score || 0), 0);
            averageScore = Math.round(totalScore / candidateCount);
        }
        return { ...job, candidateCount, averageScore };
    });

    if (!searchTerm) return jobsWithStats;
    return jobsWithStats.filter(job =>
      job.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [jobs, candidates, searchTerm]);

  const statsData = [
    { title: 'Vagas Ativas', value: stats.activeJobs, iconName: 'briefcase', iconColor: 'text-indigo-600', iconBg: 'bg-indigo-100' },
    { title: 'Candidatos Triados', value: stats.totalCandidates, iconName: 'users', iconColor: 'text-green-600', iconBg: 'bg-green-100' },
    { title: 'Score de Compatibilidade', value: `${stats.averageScore}%`, iconName: 'check', iconColor: 'text-blue-600', iconBg: 'bg-blue-100' },
    { title: 'Aprovados (>90%)', value: stats.approvedCandidates, iconName: 'award', iconColor: 'text-amber-600', iconBg: 'bg-amber-100', onClick: () => setIsApprovedModalOpen(true) }
  ];

  return (
    <>
      <div className="fade-in">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {statsData.map((stat, index) => <StatCard key={index} {...stat} />)}
        </div>
        <RecentScreenings
          jobs={filteredJobs}
          onViewResults={onViewResults}
          onDeleteJob={onDeleteJob}
          onNewScreening={() => onNavigate('new-screening')}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </div>
      
      {isApprovedModalOpen && (
        <ApprovedCandidatesModal 
          candidates={approvedCandidates}
          isLoading={false} // Não há mais carregamento aqui
          onClose={() => setIsApprovedModalOpen(false)} 
        />
      )}
    </>
  );
};

export default DashboardPage;