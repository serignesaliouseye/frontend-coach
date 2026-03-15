import api from './api';

export interface Pointage {
  id: number;
  user_id: number;
  date: string;
  heure_arrivee: string | null;
  heure_sortie: string | null;
  statut: 'present' | 'retard' | 'absent' | 'justifie';
  note: string | null;
  justificatif: string | null;
  user: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
}

export interface PointageFilters {
  date_debut?: string;
  date_fin?: string;
  statut?: string;
  user_id?: number;
}

class PointageService {
  async getStagiaires() {
    const response = await api.get('/coach/stagiaires');
    return response.data;
  }

  async getPointages(filters?: PointageFilters) {
    const response = await api.get('/coach/pointages', { params: filters });
    return response.data;
  }

  async getPointagesByDate(date: string) {
    const response = await api.get(`/coach/pointages/date/${date}`);
    return response.data;
  }

  async getPointagesByStagiaire(stagiaireId: number, filters?: PointageFilters) {
    const response = await api.get(`/coach/stagiaires/${stagiaireId}/pointages`, {
      params: filters
    });
    return response.data;
  }

  async corrigerPointage(pointageId: number, data: any) {
    const response = await api.put(`/coach/pointages/${pointageId}/corriger`, data);
    return response.data;
  }

  async ajouterJustificatif(pointageId: number, file: File) {
    const formData = new FormData();
    formData.append('justificatif', file);
    
    const response = await api.post(`/coach/pointages/${pointageId}/justificatif`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
}

export default new PointageService();