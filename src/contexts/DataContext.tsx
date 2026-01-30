import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Patient, Personnel, RendezVous, Planning, Consultation, Salle, Lit, Facture, Notification, Medicament, Examen, Message, Urgence } from '@/types';

interface DataContextType {
  patients: Patient[];
  personnel: Personnel[];
  rendezVous: RendezVous[];
  planning: Planning[];
  salles: Salle[];
  lits: Lit[];
  factures: Facture[];
  notifications: Notification[];
  medicaments: Medicament[];
  examens: Examen[];
  messages: Message[];
  urgences: Urgence[];
  addPatient: (patient: Omit<Patient, 'id' | 'numeroDossier' | 'consultations'>) => void;
  updatePatient: (id: string, patient: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  addConsultation: (patientId: string, consultation: Omit<Consultation, 'id'>) => void;
  addPersonnel: (personnel: Omit<Personnel, 'id'>) => void;
  deletePersonnel: (id: string) => void;
  addRendezVous: (rdv: Omit<RendezVous, 'id'>) => void;
  updateRendezVous: (id: string, rdv: Partial<RendezVous>) => void;
  deleteRendezVous: (id: string) => void;
  addPlanning: (plan: Omit<Planning, 'id'>) => void;
  deletePlanning: (id: string) => void;
  getMedecins: () => Personnel[];
  addSalle: (salle: Omit<Salle, 'id'>) => void;
  updateSalle: (id: string, salle: Partial<Salle>) => void;
  deleteSalle: (id: string) => void;
  addLit: (lit: Omit<Lit, 'id'>) => void;
  updateLit: (id: string, lit: Partial<Lit>) => void;
  deleteLit: (id: string) => void;
  assignerLit: (litId: string, patientId: string, patientNom: string, dateSortiePrevue: string) => void;
  libererLit: (litId: string) => void;
  addFacture: (facture: Omit<Facture, 'id' | 'numero'>) => void;
  updateFacture: (id: string, facture: Partial<Facture>) => void;
  deleteFacture: (id: string) => void;
  payerFacture: (id: string, modePaiement: Facture['modePaiement']) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'lu'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;
  getUnreadNotificationsCount: () => number;
  // Pharmacie
  addMedicament: (med: Omit<Medicament, 'id'>) => void;
  updateMedicament: (id: string, med: Partial<Medicament>) => void;
  deleteMedicament: (id: string) => void;
  // Examens
  addExamen: (exam: Omit<Examen, 'id'>) => void;
  updateExamen: (id: string, exam: Partial<Examen>) => void;
  deleteExamen: (id: string) => void;
  // Messages
  addMessage: (msg: Omit<Message, 'id' | 'date' | 'lu'>) => void;
  markMessageAsRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  getUnreadMessagesCount: (userId: string) => number;
  // Urgences
  addUrgence: (urgence: Omit<Urgence, 'id'>) => void;
  updateUrgence: (id: string, urgence: Partial<Urgence>) => void;
  deleteUrgence: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultPatients: Patient[] = [
  {
    id: '1',
    numeroDossier: 'DOS-2024-001',
    nom: 'Diallo',
    prenom: 'Amadou',
    sexe: 'M',
    dateNaissance: '1985-03-15',
    telephone: '0612345678',
    adresse: '123 Rue de Paris',
    dateAdmission: '2024-01-15',
    groupeSanguin: 'A+',
    allergies: 'Pénicilline',
    consultations: [
      { id: '1', date: '2024-01-15', medecinId: '1', medecinNom: 'Dr. Martin Jean', diagnostic: 'Grippe saisonnière', traitement: 'Paracétamol 1g x3/jour', notes: 'Repos recommandé' }
    ]
  },
  {
    id: '2',
    numeroDossier: 'DOS-2024-002',
    nom: 'Koné',
    prenom: 'Fatou',
    sexe: 'F',
    dateNaissance: '1990-07-22',
    telephone: '0698765432',
    adresse: '45 Avenue Centrale',
    dateAdmission: '2024-02-20',
    groupeSanguin: 'O-',
    consultations: []
  },
  {
    id: '3',
    numeroDossier: 'DOS-2024-003',
    nom: 'Traoré',
    prenom: 'Ibrahim',
    sexe: 'M',
    dateNaissance: '1978-11-08',
    telephone: '0655443322',
    adresse: '78 Boulevard Nord',
    dateAdmission: '2024-03-10',
    groupeSanguin: 'B+',
    consultations: []
  },
];

const defaultPersonnel: Personnel[] = [
  { id: '1', nom: 'Martin', prenom: 'Jean', type: 'medecin', specialite: 'Cardiologie', telephone: '0611111111', email: 'j.martin@hospital.com', dateEmbauche: '2020-01-15' },
  { id: '2', nom: 'Dubois', prenom: 'Marie', type: 'medecin', specialite: 'Pédiatrie', telephone: '0622222222', email: 'm.dubois@hospital.com', dateEmbauche: '2019-06-01' },
  { id: '3', nom: 'Bernard', prenom: 'Sophie', type: 'infirmier', telephone: '0633333333', email: 's.bernard@hospital.com', dateEmbauche: '2021-03-20' },
  { id: '4', nom: 'Petit', prenom: 'Lucas', type: 'agent', telephone: '0644444444', email: 'l.petit@hospital.com', dateEmbauche: '2022-09-01' },
];

const today = new Date().toISOString().split('T')[0];

const defaultRendezVous: RendezVous[] = [
  { id: '1', patientId: '1', patientNom: 'Diallo Amadou', medecinId: '1', medecinNom: 'Dr. Martin Jean', date: today, heure: '09:00', motif: 'Consultation de suivi', statut: 'planifie' },
  { id: '2', patientId: '2', patientNom: 'Koné Fatou', medecinId: '2', medecinNom: 'Dr. Dubois Marie', date: today, heure: '10:30', motif: 'Bilan annuel', statut: 'planifie' },
  { id: '3', patientId: '3', patientNom: 'Traoré Ibrahim', medecinId: '1', medecinNom: 'Dr. Martin Jean', date: today, heure: '14:00', motif: 'Douleurs thoraciques', statut: 'planifie' },
];

const defaultPlanning: Planning[] = [
  { id: '1', personnelId: '1', personnelNom: 'Dr. Martin Jean', jour: 'Lundi', heureDebut: '08:00', heureFin: '16:00' },
  { id: '2', personnelId: '1', personnelNom: 'Dr. Martin Jean', jour: 'Mercredi', heureDebut: '08:00', heureFin: '16:00' },
  { id: '3', personnelId: '2', personnelNom: 'Dr. Dubois Marie', jour: 'Mardi', heureDebut: '09:00', heureFin: '17:00' },
  { id: '4', personnelId: '2', personnelNom: 'Dr. Dubois Marie', jour: 'Jeudi', heureDebut: '09:00', heureFin: '17:00' },
  { id: '5', personnelId: '3', personnelNom: 'Bernard Sophie', jour: 'Lundi', heureDebut: '07:00', heureFin: '15:00' },
];

const defaultSalles: Salle[] = [
  { id: '1', numero: 'A-101', type: 'consultation', capacite: 2, etage: 1, equipements: ['Échographe', 'Tensiomètre'], statut: 'disponible' },
  { id: '2', numero: 'A-102', type: 'consultation', capacite: 2, etage: 1, equipements: ['Tensiomètre', 'Stéthoscope'], statut: 'occupee' },
  { id: '3', numero: 'B-201', type: 'hospitalisation', capacite: 4, etage: 2, equipements: ['Lits médicalisés', 'Monitoring'], statut: 'disponible' },
  { id: '4', numero: 'B-202', type: 'hospitalisation', capacite: 2, etage: 2, equipements: ['Lits médicalisés'], statut: 'disponible' },
  { id: '5', numero: 'C-001', type: 'urgence', capacite: 6, etage: 0, equipements: ['Défibrillateur', 'Respirateur', 'ECG'], statut: 'disponible' },
  { id: '6', numero: 'D-301', type: 'operation', capacite: 1, etage: 3, equipements: ['Table opératoire', 'Anesthésie', 'Monitoring'], statut: 'maintenance' },
];

const defaultLits: Lit[] = [
  { id: '1', numero: 'L-201-1', salleId: '3', salleNumero: 'B-201', statut: 'libre' },
  { id: '2', numero: 'L-201-2', salleId: '3', salleNumero: 'B-201', statut: 'occupe', patientId: '1', patientNom: 'Diallo Amadou', dateEntree: '2024-01-15', dateSortiePrevue: '2024-01-20' },
  { id: '3', numero: 'L-201-3', salleId: '3', salleNumero: 'B-201', statut: 'libre' },
  { id: '4', numero: 'L-201-4', salleId: '3', salleNumero: 'B-201', statut: 'reserve' },
  { id: '5', numero: 'L-202-1', salleId: '4', salleNumero: 'B-202', statut: 'libre' },
  { id: '6', numero: 'L-202-2', salleId: '4', salleNumero: 'B-202', statut: 'maintenance' },
];

const defaultFactures: Facture[] = [
  {
    id: '1',
    numero: 'FAC-2024-001',
    patientId: '1',
    patientNom: 'Diallo Amadou',
    date: '2024-01-15',
    items: [
      { id: '1', description: 'Consultation générale', quantite: 1, prixUnitaire: 50 },
      { id: '2', description: 'Radiographie thoracique', quantite: 1, prixUnitaire: 80 },
      { id: '3', description: 'Analyses sanguines', quantite: 1, prixUnitaire: 45 }
    ],
    total: 175,
    statut: 'payee',
    modePaiement: 'carte',
    datePaiement: '2024-01-15'
  },
  {
    id: '2',
    numero: 'FAC-2024-002',
    patientId: '2',
    patientNom: 'Koné Fatou',
    date: '2024-02-20',
    items: [
      { id: '1', description: 'Consultation spécialisée', quantite: 1, prixUnitaire: 75 },
      { id: '2', description: 'ECG', quantite: 1, prixUnitaire: 60 }
    ],
    total: 135,
    statut: 'en_attente'
  },
];

const defaultNotifications: Notification[] = [
  { id: '1', type: 'info', titre: 'Nouveau patient', message: 'Un nouveau patient a été enregistré', date: today, lu: false },
  { id: '2', type: 'warning', titre: 'Rendez-vous en attente', message: '3 rendez-vous sont prévus pour aujourd\'hui', date: today, lu: false },
  { id: '3', type: 'success', titre: 'Paiement reçu', message: 'Facture FAC-2024-001 payée avec succès', date: today, lu: true },
];

const defaultMedicaments: Medicament[] = [
  { id: '1', nom: 'Paracétamol 500mg', categorie: 'Analgésique', dosage: '500mg', forme: 'comprime', quantiteStock: 500, seuilAlerte: 100, prixUnitaire: 0.15, dateExpiration: '2025-12-31', fournisseur: 'Pharma Plus' },
  { id: '2', nom: 'Amoxicilline 1g', categorie: 'Antibiotique', dosage: '1g', forme: 'comprime', quantiteStock: 200, seuilAlerte: 50, prixUnitaire: 0.85, dateExpiration: '2025-06-30', fournisseur: 'MediStock' },
  { id: '3', nom: 'Ibuprofène 400mg', categorie: 'Anti-inflammatoire', dosage: '400mg', forme: 'comprime', quantiteStock: 300, seuilAlerte: 80, prixUnitaire: 0.25, dateExpiration: '2025-09-15', fournisseur: 'Pharma Plus' },
  { id: '4', nom: 'Doliprane Sirop', categorie: 'Analgésique', dosage: '2.4%', forme: 'sirop', quantiteStock: 50, seuilAlerte: 20, prixUnitaire: 4.50, dateExpiration: '2025-03-20', fournisseur: 'MediStock' },
];

const defaultExamens: Examen[] = [
  { id: '1', patientId: '1', patientNom: 'Diallo Amadou', type: 'Analyse sanguine', description: 'NFS complète + Glycémie', datePrelevement: today, statut: 'en_cours', medecinPrescripteur: 'Dr. Martin Jean', laborantin: 'Dupont Pierre' },
  { id: '2', patientId: '2', patientNom: 'Koné Fatou', type: 'Radiographie', description: 'Radio thoracique face et profil', datePrelevement: today, statut: 'termine', dateResultat: today, resultat: 'RAS - Pas d\'anomalie détectée', medecinPrescripteur: 'Dr. Dubois Marie' },
];

const defaultMessages: Message[] = [
  { id: '1', expediteurId: '1', expediteurNom: 'Admin', destinataireId: '2', destinataireNom: 'Dr. Martin', sujet: 'Réunion du personnel', contenu: 'Une réunion est prévue demain à 10h en salle de conférence.', date: today, lu: false, urgent: false },
];

const defaultUrgences: Urgence[] = [
  { id: '1', patientNom: 'Patient Inconnu', dateArrivee: today, heureArrivee: '08:30', motif: 'Douleur thoracique intense', niveau: 2, statut: 'en_cours', medecinNom: 'Dr. Martin Jean', observations: 'ECG en cours' },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [planning, setPlanning] = useState<Planning[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [lits, setLits] = useState<Lit[]>([]);
  const [factures, setFactures] = useState<Facture[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [examens, setExamens] = useState<Examen[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [urgences, setUrgences] = useState<Urgence[]>([]);

  useEffect(() => {
    const loadData = (key: string, defaultData: unknown) => {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultData;
    };

    setPatients(loadData('hospital_patients', defaultPatients));
    setPersonnel(loadData('hospital_personnel', defaultPersonnel));
    setRendezVous(loadData('hospital_rdv', defaultRendezVous));
    setPlanning(loadData('hospital_planning', defaultPlanning));
    setSalles(loadData('hospital_salles', defaultSalles));
    setLits(loadData('hospital_lits', defaultLits));
    setFactures(loadData('hospital_factures', defaultFactures));
    setNotifications(loadData('hospital_notifications', defaultNotifications));
    setMedicaments(loadData('hospital_medicaments', defaultMedicaments));
    setExamens(loadData('hospital_examens', defaultExamens));
    setMessages(loadData('hospital_messages', defaultMessages));
    setUrgences(loadData('hospital_urgences', defaultUrgences));
  }, []);

  const saveData = <T,>(key: string, data: T, setter: React.Dispatch<React.SetStateAction<T>>) => {
    setter(data);
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Patient functions
  const addPatient = (patient: Omit<Patient, 'id' | 'numeroDossier' | 'consultations'>) => {
    const id = Date.now().toString();
    const numeroDossier = `DOS-${new Date().getFullYear()}-${String(patients.length + 1).padStart(3, '0')}`;
    const newPatient: Patient = { ...patient, id, numeroDossier, consultations: [] };
    saveData('hospital_patients', [...patients, newPatient], setPatients);
    addNotification({ type: 'info', titre: 'Nouveau patient', message: `${patient.nom} ${patient.prenom} a été enregistré` });
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    const updated = patients.map(p => p.id === id ? { ...p, ...updates } : p);
    saveData('hospital_patients', updated, setPatients);
  };

  const deletePatient = (id: string) => {
    saveData('hospital_patients', patients.filter(p => p.id !== id), setPatients);
  };

  const addConsultation = (patientId: string, consultation: Omit<Consultation, 'id'>) => {
    const updated = patients.map(p => {
      if (p.id === patientId) {
        return {
          ...p,
          consultations: [...p.consultations, { ...consultation, id: Date.now().toString() }]
        };
      }
      return p;
    });
    saveData('hospital_patients', updated, setPatients);
  };

  // Personnel functions
  const addPersonnel = (newPersonnel: Omit<Personnel, 'id'>) => {
    const personnelWithId: Personnel = { ...newPersonnel, id: Date.now().toString() };
    saveData('hospital_personnel', [...personnel, personnelWithId], setPersonnel);
  };

  const deletePersonnel = (id: string) => {
    saveData('hospital_personnel', personnel.filter(p => p.id !== id), setPersonnel);
  };

  // RendezVous functions
  const addRendezVous = (rdv: Omit<RendezVous, 'id'>) => {
    const newRdv: RendezVous = { ...rdv, id: Date.now().toString() };
    saveData('hospital_rdv', [...rendezVous, newRdv], setRendezVous);
    addNotification({ type: 'info', titre: 'Nouveau RDV', message: `RDV planifié pour ${rdv.patientNom} le ${rdv.date}` });
  };

  const updateRendezVous = (id: string, updates: Partial<RendezVous>) => {
    const updated = rendezVous.map(r => r.id === id ? { ...r, ...updates } : r);
    saveData('hospital_rdv', updated, setRendezVous);
  };

  const deleteRendezVous = (id: string) => {
    saveData('hospital_rdv', rendezVous.filter(r => r.id !== id), setRendezVous);
  };

  // Planning functions
  const addPlanning = (plan: Omit<Planning, 'id'>) => {
    const newPlan: Planning = { ...plan, id: Date.now().toString() };
    saveData('hospital_planning', [...planning, newPlan], setPlanning);
  };

  const deletePlanning = (id: string) => {
    saveData('hospital_planning', planning.filter(p => p.id !== id), setPlanning);
  };

  const getMedecins = () => personnel.filter(p => p.type === 'medecin');

  // Salle functions
  const addSalle = (salle: Omit<Salle, 'id'>) => {
    const newSalle: Salle = { ...salle, id: Date.now().toString() };
    saveData('hospital_salles', [...salles, newSalle], setSalles);
  };

  const updateSalle = (id: string, updates: Partial<Salle>) => {
    const updated = salles.map(s => s.id === id ? { ...s, ...updates } : s);
    saveData('hospital_salles', updated, setSalles);
  };

  const deleteSalle = (id: string) => {
    saveData('hospital_salles', salles.filter(s => s.id !== id), setSalles);
  };

  // Lit functions
  const addLit = (lit: Omit<Lit, 'id'>) => {
    const newLit: Lit = { ...lit, id: Date.now().toString() };
    saveData('hospital_lits', [...lits, newLit], setLits);
  };

  const updateLit = (id: string, updates: Partial<Lit>) => {
    const updated = lits.map(l => l.id === id ? { ...l, ...updates } : l);
    saveData('hospital_lits', updated, setLits);
  };

  const deleteLit = (id: string) => {
    saveData('hospital_lits', lits.filter(l => l.id !== id), setLits);
  };

  const assignerLit = (litId: string, patientId: string, patientNom: string, dateSortiePrevue: string) => {
    updateLit(litId, {
      statut: 'occupe',
      patientId,
      patientNom,
      dateEntree: new Date().toISOString().split('T')[0],
      dateSortiePrevue
    });
    addNotification({ type: 'info', titre: 'Lit assigné', message: `Lit assigné à ${patientNom}` });
  };

  const libererLit = (litId: string) => {
    updateLit(litId, {
      statut: 'libre',
      patientId: undefined,
      patientNom: undefined,
      dateEntree: undefined,
      dateSortiePrevue: undefined
    });
  };

  // Facture functions
  const addFacture = (facture: Omit<Facture, 'id' | 'numero'>) => {
    const id = Date.now().toString();
    const numero = `FAC-${new Date().getFullYear()}-${String(factures.length + 1).padStart(3, '0')}`;
    const newFacture: Facture = { ...facture, id, numero };
    saveData('hospital_factures', [...factures, newFacture], setFactures);
    addNotification({ type: 'info', titre: 'Nouvelle facture', message: `Facture ${numero} créée pour ${facture.patientNom}` });
  };

  const updateFacture = (id: string, updates: Partial<Facture>) => {
    const updated = factures.map(f => f.id === id ? { ...f, ...updates } : f);
    saveData('hospital_factures', updated, setFactures);
  };

  const deleteFacture = (id: string) => {
    saveData('hospital_factures', factures.filter(f => f.id !== id), setFactures);
  };

  const payerFacture = (id: string, modePaiement: Facture['modePaiement']) => {
    const facture = factures.find(f => f.id === id);
    updateFacture(id, {
      statut: 'payee',
      modePaiement,
      datePaiement: new Date().toISOString().split('T')[0]
    });
    if (facture) {
      addNotification({ type: 'success', titre: 'Paiement reçu', message: `Facture ${facture.numero} payée` });
    }
  };

  // Notification functions
  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'lu'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      lu: false
    };
    const updated = [newNotification, ...notifications].slice(0, 50);
    saveData('hospital_notifications', updated, setNotifications);
  };

  const markNotificationAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, lu: true } : n);
    saveData('hospital_notifications', updated, setNotifications);
  };

  const markAllNotificationsAsRead = () => {
    const updated = notifications.map(n => ({ ...n, lu: true }));
    saveData('hospital_notifications', updated, setNotifications);
  };

  const deleteNotification = (id: string) => {
    saveData('hospital_notifications', notifications.filter(n => n.id !== id), setNotifications);
  };

  const getUnreadNotificationsCount = () => notifications.filter(n => !n.lu).length;

  // Medicament functions
  const addMedicament = (med: Omit<Medicament, 'id'>) => {
    const newMed: Medicament = { ...med, id: Date.now().toString() };
    saveData('hospital_medicaments', [...medicaments, newMed], setMedicaments);
  };

  const updateMedicament = (id: string, updates: Partial<Medicament>) => {
    const updated = medicaments.map(m => m.id === id ? { ...m, ...updates } : m);
    saveData('hospital_medicaments', updated, setMedicaments);
    
    const med = updated.find(m => m.id === id);
    if (med && med.quantiteStock <= med.seuilAlerte) {
      addNotification({ type: 'warning', titre: 'Stock faible', message: `Le stock de ${med.nom} est bas (${med.quantiteStock} restants)` });
    }
  };

  const deleteMedicament = (id: string) => {
    saveData('hospital_medicaments', medicaments.filter(m => m.id !== id), setMedicaments);
  };

  // Examen functions
  const addExamen = (exam: Omit<Examen, 'id'>) => {
    const newExam: Examen = { ...exam, id: Date.now().toString() };
    saveData('hospital_examens', [...examens, newExam], setExamens);
    addNotification({ type: 'info', titre: 'Nouvel examen', message: `Examen ${exam.type} prescrit pour ${exam.patientNom}` });
  };

  const updateExamen = (id: string, updates: Partial<Examen>) => {
    const updated = examens.map(e => e.id === id ? { ...e, ...updates } : e);
    saveData('hospital_examens', updated, setExamens);
    
    if (updates.statut === 'termine') {
      const exam = updated.find(e => e.id === id);
      if (exam) {
        addNotification({ type: 'success', titre: 'Résultat disponible', message: `Résultat de ${exam.type} pour ${exam.patientNom}` });
      }
    }
  };

  const deleteExamen = (id: string) => {
    saveData('hospital_examens', examens.filter(e => e.id !== id), setExamens);
  };

  // Message functions
  const addMessage = (msg: Omit<Message, 'id' | 'date' | 'lu'>) => {
    const newMsg: Message = {
      ...msg,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      lu: false
    };
    saveData('hospital_messages', [...messages, newMsg], setMessages);
    addNotification({ 
      type: msg.urgent ? 'warning' : 'info', 
      titre: msg.urgent ? 'Message urgent' : 'Nouveau message', 
      message: `De ${msg.expediteurNom}: ${msg.sujet}` 
    });
  };

  const markMessageAsRead = (id: string) => {
    const updated = messages.map(m => m.id === id ? { ...m, lu: true } : m);
    saveData('hospital_messages', updated, setMessages);
  };

  const deleteMessage = (id: string) => {
    saveData('hospital_messages', messages.filter(m => m.id !== id), setMessages);
  };

  const getUnreadMessagesCount = (userId: string) => 
    messages.filter(m => m.destinataireId === userId && !m.lu).length;

  // Urgence functions
  const addUrgence = (urgence: Omit<Urgence, 'id'>) => {
    const newUrgence: Urgence = { ...urgence, id: Date.now().toString() };
    saveData('hospital_urgences', [...urgences, newUrgence], setUrgences);
    addNotification({ 
      type: urgence.niveau <= 2 ? 'error' : 'warning', 
      titre: 'Nouvelle urgence', 
      message: `Niveau ${urgence.niveau}: ${urgence.motif}` 
    });
  };

  const updateUrgence = (id: string, updates: Partial<Urgence>) => {
    const updated = urgences.map(u => u.id === id ? { ...u, ...updates } : u);
    saveData('hospital_urgences', updated, setUrgences);
  };

  const deleteUrgence = (id: string) => {
    saveData('hospital_urgences', urgences.filter(u => u.id !== id), setUrgences);
  };

  return (
    <DataContext.Provider value={{
      patients,
      personnel,
      rendezVous,
      planning,
      salles,
      lits,
      factures,
      notifications,
      medicaments,
      examens,
      messages,
      urgences,
      addPatient,
      updatePatient,
      deletePatient,
      addConsultation,
      addPersonnel,
      deletePersonnel,
      addRendezVous,
      updateRendezVous,
      deleteRendezVous,
      addPlanning,
      deletePlanning,
      getMedecins,
      addSalle,
      updateSalle,
      deleteSalle,
      addLit,
      updateLit,
      deleteLit,
      assignerLit,
      libererLit,
      addFacture,
      updateFacture,
      deleteFacture,
      payerFacture,
      addNotification,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      getUnreadNotificationsCount,
      addMedicament,
      updateMedicament,
      deleteMedicament,
      addExamen,
      updateExamen,
      deleteExamen,
      addMessage,
      markMessageAsRead,
      deleteMessage,
      getUnreadMessagesCount,
      addUrgence,
      updateUrgence,
      deleteUrgence,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
