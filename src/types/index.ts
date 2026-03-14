export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'coach' | 'stagiaire';
  telephone?: string;
  photo?: string;
  promotion?: string;
  date_debut?: string;
  date_fin?: string;
  est_actif: boolean;
}

export interface Stagiaire {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  photo?: string;
  promotion: string;
  statut_aujourdhui: 'present' | 'retard' | 'absent' | 'justifie';
  heure_arrivee?: string;
  total_retards: number;
}

export interface Pointage {
  id: number;
  user_id: number;
  date: string;
  heure_arrivee?: string;
  heure_sortie?: string;
  statut: 'present' | 'retard' | 'absent' | 'justifie';
  note?: string;
  justificatif?: string;
}

export interface Sanction {
  id: number;
  stagiaire_id: number;
  coach_id: number;
  niveau: 'avertissement' | 'blame' | 'suspension' | 'exclusion';
  motif: string;
  description: string;
  date_sanction: string;
  date_fin_suspension?: string;
  est_lue: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  role: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}