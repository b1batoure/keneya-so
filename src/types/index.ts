export type UserRole = 'admin' | 'medecin' | 'agent';

export interface User {
  id: string;
  email: string;
  password: string;
  nom: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  numeroDossier: string;
  nom: string;
  prenom: string;
  sexe: 'M' | 'F';
  dateNaissance: string;
  telephone: string;
  adresse: string;
  dateAdmission: string;
  groupeSanguin?: string;
  allergies?: string;
  consultations: Consultation[];
}

export interface Consultation {
  id: string;
  date: string;
  medecinId: string;
  medecinNom: string;
  diagnostic: string;
  traitement: string;
  notes: string;
}

export interface Personnel {
  id: string;
  nom: string;
  prenom: string;
  type: 'medecin' | 'infirmier' | 'agent';
  specialite?: string;
  telephone: string;
  email: string;
  dateEmbauche: string;
}

export interface Planning {
  id: string;
  personnelId: string;
  personnelNom: string;
  jour: string;
  heureDebut: string;
  heureFin: string;
}

export interface RendezVous {
  id: string;
  patientId: string;
  patientNom: string;
  medecinId: string;
  medecinNom: string;
  date: string;
  heure: string;
  motif: string;
  statut: 'planifie' | 'termine' | 'annule';
}

// Nouvelles interfaces pour les fonctionnalités ajoutées

export interface Salle {
  id: string;
  numero: string;
  type: 'consultation' | 'operation' | 'urgence' | 'hospitalisation';
  capacite: number;
  etage: number;
  equipements: string[];
  statut: 'disponible' | 'occupee' | 'maintenance';
}

export interface Lit {
  id: string;
  numero: string;
  salleId: string;
  salleNumero: string;
  statut: 'libre' | 'occupe' | 'reserve' | 'maintenance';
  patientId?: string;
  patientNom?: string;
  dateEntree?: string;
  dateSortiePrevue?: string;
}

export interface Facture {
  id: string;
  numero: string;
  patientId: string;
  patientNom: string;
  date: string;
  items: FactureItem[];
  total: number;
  statut: 'en_attente' | 'payee' | 'annulee';
  modePaiement?: 'especes' | 'carte' | 'virement' | 'assurance';
  datePaiement?: string;
}

export interface FactureItem {
  id: string;
  description: string;
  quantite: number;
  prixUnitaire: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  titre: string;
  message: string;
  date: string;
  lu: boolean;
  lien?: string;
}

// Pharmacie / Médicaments
export interface Medicament {
  id: string;
  nom: string;
  categorie: string;
  dosage: string;
  forme: 'comprime' | 'sirop' | 'injection' | 'pommade' | 'gouttes' | 'autre';
  quantiteStock: number;
  seuilAlerte: number;
  prixUnitaire: number;
  dateExpiration: string;
  fournisseur: string;
}

// Laboratoire
export interface Examen {
  id: string;
  patientId: string;
  patientNom: string;
  type: string;
  description: string;
  datePrelevement: string;
  dateResultat?: string;
  statut: 'en_attente' | 'en_cours' | 'termine';
  resultat?: string;
  medecinPrescripteur: string;
  laborantin?: string;
  fichierResultat?: string;
}

// Messagerie interne
export interface Message {
  id: string;
  expediteurId: string;
  expediteurNom: string;
  destinataireId: string;
  destinataireNom: string;
  sujet: string;
  contenu: string;
  date: string;
  lu: boolean;
  urgent: boolean;
}

// Urgences
export interface Urgence {
  id: string;
  patientId?: string;
  patientNom: string;
  dateArrivee: string;
  heureArrivee: string;
  motif: string;
  niveau: 1 | 2 | 3 | 4 | 5; // 1 = critique, 5 = mineur
  statut: 'en_attente' | 'en_cours' | 'transfere' | 'sorti';
  medecinId?: string;
  medecinNom?: string;
  observations: string;
}
