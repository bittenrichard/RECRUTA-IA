import React, { useEffect, useCallback, useState } from 'react';
import { useAuth } from './features/auth/hooks/useAuth';
import { useNavigation } from './shared/hooks/useNavigation';
import LoginPage from './features/auth/components/LoginPage';
import SignUpPage from './features/auth/components/SignUpPage';
import MainLayout from './shared/components/Layout/MainLayout';
import DashboardPage from './features/dashboard/components/DashboardPage';
import NewScreeningPage from './features/screening/components/NewScreeningPage';
import ResultsPage from './features/results/components/ResultsPage';
import SettingsPage from './features/settings/components/SettingsPage';
import { LoginCredentials, SignUpCredentials } from './features/auth/types';
import { JobPosting } from './features/screening/types';
import { Candidate } from './features/results/types';
import { baserow } from './shared/services/baserowClient';

const VAGAS_TABLE_ID = '701';
const CANDIDATOS_TABLE_ID = '702';

function App() {
  const { 
    profile, 
    isAuthenticated, 
    isLoading: isAuthLoading, 
    error: authError,
    signIn, 
    signOut,
    signUp 
  } = useAuth();

  const { currentPage, navigateTo } = useNavigation(isAuthenticated ? 'dashboard' : 'login');
  
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);

  const fetchAllData = useCallback(async () => {
    if (!profile) return;
    setIsDataLoading(true);
    try {
      const params = `?filter__field_usuario__contains=${profile.id}&sorts=-criado_em`;
      const jobsPromise = baserow.get(VAGAS_TABLE_ID, params);
      const candidatesPromise = baserow.get(CANDIDATOS_TABLE_ID, params);

      const [jobsResult, candidatesResult] = await Promise.all([jobsPromise, candidatesPromise]);
      
      setJobs(jobsResult.results || []);
      setCandidates(candidatesResult.results || []);

    } catch (error) {
      console.error("Erro ao buscar dados do Baserow:", error);
    } finally {
      setIsDataLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    if (isAuthenticated && profile) {
      fetchAllData();
    }
  }, [isAuthenticated, profile, fetchAllData]);


  const handleLogin = async (credentials: LoginCredentials) => {
    await signIn(credentials);
  };
  
  const handleSignUp = async (credentials: SignUpCredentials) => {
    await signUp(credentials);
    alert('Cadastro realizado com sucesso! Agora você pode fazer login.');
    navigateTo('login');
  };

  const handleLogout = () => {
    signOut();
    navigateTo('login');
  };

  const handleViewResults = (job: JobPosting) => {
    setSelectedJobId(job.id);
    navigateTo('results');
  };

  const handleJobCreated = (newJob: JobPosting) => {
    setJobs(prev => [newJob, ...prev]);
    setSelectedJobId(newJob.id);
    navigateTo('results');
  };

  const handleDeleteJob = async (jobId: number) => {
      const jobToDelete = jobs.find(job => job.id === jobId);
      if (jobToDelete && window.confirm(`Tem certeza que deseja excluir a triagem "${jobToDelete.titulo}"?`)) {
          try {
              await baserow.delete(VAGAS_TABLE_ID, jobId);
              fetchAllData();
          } catch (error) {
              console.error("Erro ao deletar vaga:", error);
              alert("Não foi possível excluir a vaga.");
          }
      }
  };

  if (isAuthLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Verificando sessão...</div>;
  }
  
  if (!isAuthenticated) {
    return (
      <div className="font-inter antialiased">
        {currentPage === 'signup' ? (
            <SignUpPage onSignUp={handleSignUp} onNavigateLogin={() => navigateTo('login')} isLoading={isAuthLoading} error={authError} />
        ) : (
            <LoginPage onLogin={handleLogin} onNavigateSignUp={() => navigateTo('signup')} isLoading={isAuthLoading} error={authError} />
        )}
      </div>
    );
  }

  if (!profile || isDataLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100">Carregando seus dados...</div>;
  }
  
  const selectedJob = jobs.find(job => job.id === selectedJobId) || null;

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage jobs={jobs} candidates={candidates} onViewResults={handleViewResults} onDeleteJob={handleDeleteJob} onNavigate={navigateTo} />;
      case 'new-screening':
        return <NewScreeningPage onJobCreated={handleJobCreated} onCancel={() => navigateTo('dashboard')} />;
      case 'results':
        return <ResultsPage selectedJob={selectedJob} onDataSynced={fetchAllData} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage jobs={jobs} candidates={candidates} onViewResults={handleViewResults} onDeleteJob={handleDeleteJob} onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="font-inter antialiased">
      <MainLayout currentPage={currentPage} user={profile} onNavigate={navigateTo} onLogout={handleLogout}>
        {renderContent()}
      </MainLayout>
    </div>
  );
}

export default App;