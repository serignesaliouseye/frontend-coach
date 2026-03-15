import api from './api';

export interface Sanction {
  id: number;
  stagiaire_id: number;
  coach_id: number;
  niveau: 'avertissement' | 'blame' | 'suspension' | 'exclusion';
  motif: string;
  description: string;
  date_sanction: string;
  date_fin_suspension: string | null;
  stagiaire: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    promotion: string;
  };
}

class SanctionService {
  async getSanctions(stagiaireId?: number) {
    const params = stagiaireId ? { stagiaire_id: stagiaireId } : {};
    const response = await api.get('/coach/sanctions', { params });
    return response.data;
  }

  async createSanction(data: Omit<Sanction, 'id' | 'date_sanction' | 'stagiaire'>) {
    const response = await api.post('/coach/sanctions', data);
    return response.data;
  }

  async updateSanction(id: number, data: Partial<Sanction>) {
    const response = await api.put(`/coach/sanctions/${id}`, data);
    return response.data;
  }

  async deleteSanction(id: number) {
    const response = await api.delete(`/coach/sanctions/${id}`);
    return response.data;
  }
}

export default new SanctionService();