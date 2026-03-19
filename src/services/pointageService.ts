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

export interface Stagiaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  photo?: string;
  promotion: string;
  telephone?: string;
  date_debut?: string;
  date_fin?: string;
  statut_aujourdhui: 'present' | 'retard' | 'absent' | 'justifie';
  heure_arrivee?: string;
  total_retards: number;
  total_absences: number;
  moyenne_presence: number;
}

export interface PointageFilters {
  date_debut?: string;
  date_fin?: string;
  statut?: string;
  user_id?: number;
  limit?: number;
  page?: number;
}

class PointageService {
  /**
   * Récupérer la liste des stagiaires du coach connecté
   */
  async getStagiaires(): Promise<Stagiaire[]> {
    try {
      console.log('📡 Appel API: GET /coach/stagiaires');
      const response = await api.get('/coach/stagiaires');
      console.log('✅ Réponse reçue:', response);

      // Vérifier différents formats de réponse possibles
      let stagiaires: Stagiaire[] = [];

      // Format 1: Réponse directe avec un tableau
      if (Array.isArray(response.data)) {
        console.log('Format: tableau direct');
        stagiaires = response.data;
      }
      // Format 2: Réponse avec propriété 'data' contenant un tableau
      else if (response.data?.data && Array.isArray(response.data.data)) {
        console.log('Format: { data: [...] }');
        stagiaires = response.data.data;
      }
      // Format 3: Réponse avec propriété 'stagiaires' contenant un tableau
      else if (response.data?.stagiaires && Array.isArray(response.data.stagiaires)) {
        console.log('Format: { stagiaires: [...] }');
        stagiaires = response.data.stagiaires;
      }
      // Format 4: Réponse avec propriété 'users' contenant un tableau
      else if (response.data?.users && Array.isArray(response.data.users)) {
        console.log('Format: { users: [...] }');
        stagiaires = response.data.users;
      }
      // Format 5: Objet avec des propriétés
      else if (response.data && typeof response.data === 'object') {
        // Chercher la première propriété qui est un tableau
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(`Format: { ${key}: [...] }`);
            stagiaires = response.data[key];
            break;
          }
        }
      }

      // Si toujours pas de stagiaires, vérifier si c'est une erreur
      if (stagiaires.length === 0) {
        console.warn('⚠️ Aucun stagiaire trouvé dans la réponse:', response.data);
        
        // Vérifier si c'est une erreur
        if (response.data?.message) {
          throw new Error(response.data.message);
        }
      }

      // Formater les données pour s'assurer que tous les champs sont présents
      const formattedStagiaires = stagiaires.map((s: any) => ({
        id: s.id || 0,
        nom: s.nom || '',
        prenom: s.prenom || '',
        email: s.email || '',
        photo: s.photo || null,
        promotion: s.promotion || '',
        telephone: s.telephone || null,
        date_debut: s.date_debut || null,
        date_fin: s.date_fin || null,
        statut_aujourdhui: s.statut_aujourdhui || 'absent',
        heure_arrivee: s.heure_arrivee || null,
        total_retards: s.total_retards || 0,
        total_absences: s.total_absences || 0,
        moyenne_presence: s.moyenne_presence || 0,
      }));

      console.log(`📊 ${formattedStagiaires.length} stagiaires chargés`);
      return formattedStagiaires;
      
    } catch (error: any) {
      console.error('❌ Erreur dans getStagiaires:', error);
      
      // Gérer les différentes erreurs
      if (error.response) {
        // Erreur de l'API (4xx, 5xx)
        console.error('Réponse erreur:', error.response.data);
        throw new Error(error.response.data?.message || 'Erreur lors du chargement des stagiaires');
      } else if (error.request) {
        // Pas de réponse du serveur
        console.error('Pas de réponse du serveur');
        throw new Error('Impossible de contacter le serveur');
      } else {
        // Autre erreur
        throw error;
      }
    }
  }

  /**
   * Récupérer les pointages avec filtres optionnels
   */
  async getPointages(filters?: PointageFilters) {
    try {
      console.log('📡 Appel API: GET /coach/pointages avec filtres:', filters);
      const response = await api.get('/coach/pointages', { params: filters });
      
      // Gérer différents formats de réponse
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data?.pointages && Array.isArray(response.data.pointages)) {
        return response.data.pointages;
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Erreur dans getPointages:', error);
      throw error;
    }
  }

  /**
   * Récupérer les pointages par date
   */
  async getPointagesByDate(date: string) {
    try {
      console.log(`📡 Appel API: GET /coach/pointages/date/${date}`);
      const response = await api.get(`/coach/pointages/date/${date}`);
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('❌ Erreur dans getPointagesByDate:', error);
      throw error;
    }
  }

  /**
   * Récupérer les pointages d'un stagiaire spécifique
   */
  async getPointagesByStagiaire(stagiaireId: number, filters?: PointageFilters) {
    try {
      console.log(`📡 Appel API: GET /coach/stagiaires/${stagiaireId}/pointages`, filters);
      const response = await api.get(`/coach/stagiaires/${stagiaireId}/pointages`, {
        params: filters
      });
      
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data?.pointages && Array.isArray(response.data.pointages)) {
        return response.data.pointages;
      }
      
      return [];
    } catch (error) {
      console.error('❌ Erreur dans getPointagesByStagiaire:', error);
      throw error;
    }
  }

  /**
   * Corriger un pointage
   */
  async corrigerPointage(pointageId: number, data: any) {
    try {
      console.log(`📡 Appel API: PUT /coach/pointages/${pointageId}/corriger`, data);
      const response = await api.put(`/coach/pointages/${pointageId}/corriger`, data);
      console.log('✅ Pointage corrigé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur dans corrigerPointage:', error);
      throw error;
    }
  }

  /**
   * Ajouter un justificatif à un pointage
   */
  async ajouterJustificatif(pointageId: number, file: File) {
    try {
      console.log(`📡 Appel API: POST /coach/pointages/${pointageId}/justificatif`);
      const formData = new FormData();
      formData.append('justificatif', file);
      
      const response = await api.post(`/coach/pointages/${pointageId}/justificatif`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('✅ Justificatif ajouté:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur dans ajouterJustificatif:', error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques d'un stagiaire
   */
  async getStatsStagiaire(stagiaireId: number) {
    try {
      console.log(`📡 Appel API: GET /coach/stagiaires/${stagiaireId}/stats`);
      const response = await api.get(`/coach/stagiaires/${stagiaireId}/stats`);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur dans getStatsStagiaire:', error);
      throw error;
    }
  }
}

export default new PointageService();