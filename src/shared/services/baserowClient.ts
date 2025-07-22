const BASE_URL = 'https://dados.focoserv.com.br/api/database/rows/table';
// --- SUA NOVA CHAVE DE API INSERIDA AQUI ---
const API_KEY = 'anGucsRrFCKrOmUYHapVYsr5U3FVK85o';

// Esta é a nossa interface genérica para a API do Baserow.
// Ela nos ajuda a fazer chamadas de forma segura e padronizada.
const apiRequest = async (
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  tableId: string,
  path: string = '',
  body?: Record<string, any>
) => {
  const url = `${BASE_URL}/${tableId}/${path}?user_field_names=true`;

  const headers = {
    'Authorization': `Token ${API_KEY}`,
    'Content-Type': 'application/json',
  };

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Erro na API do Baserow:', errorData);
      throw new Error(`Erro na comunicação com o banco de dados (Status: ${response.status})`);
    }

    if (method === 'DELETE') {
      return { success: true };
    }

    return await response.json();

  } catch (error) {
    console.error('Falha na requisição para o Baserow:', error);
    throw error;
  }
};

// Funções específicas para cada tipo de operação, para facilitar o uso no resto do código.
export const baserow = {
  get: (tableId: string, params: string = '') => 
    apiRequest('GET', tableId, params),

  post: (tableId: string, data: Record<string, any>) => 
    apiRequest('POST', tableId, '', data),

  patch: (tableId: string, rowId: number, data: Record<string, any>) => 
    apiRequest('PATCH', tableId, `${rowId}/`, data),

  delete: (tableId: string, rowId: number) => 
    apiRequest('DELETE', tableId, `${rowId}/`),
};