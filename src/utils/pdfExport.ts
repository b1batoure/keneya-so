import { jsPDF } from 'jspdf';
import { Patient, Personnel, RendezVous, Facture } from '@/types';

// PDF Export utilities

// Configuration du PDF avec header
const setupPDF = (title: string): jsPDF => {
  const doc = new jsPDF();
  
  // En-tête bleu
  doc.setFillColor(30, 64, 175);
  doc.rect(0, 0, 210, 35, 'F');
  
  // Titre HospiGest
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('keneya-so', 14, 18);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Systeme de Gestion Hospitaliere', 14, 28);
  
  // Titre du document
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 50);
  
  // Date d'exportation
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  doc.text('Exporte le: ' + dateStr, 14, 58);
  
  return doc;
};

// Calculer l'âge
const calculateAge = (dateNaissance: string): number => {
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Ajouter une ligne de tableau
const drawTableRow = (doc: jsPDF, y: number, cells: string[], widths: number[], isHeader: boolean = false): number => {
  const startX = 14;
  let x = startX;
  
  if (isHeader) {
    doc.setFillColor(30, 64, 175);
    doc.rect(startX, y - 5, widths.reduce((a, b) => a + b, 0), 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
  } else {
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
  }
  
  doc.setFontSize(8);
  
  cells.forEach((cell, i) => {
    const truncated = cell.length > Math.floor(widths[i] / 2.5) 
      ? cell.substring(0, Math.floor(widths[i] / 2.5) - 2) + '..' 
      : cell;
    doc.text(truncated, x + 2, y);
    x += widths[i];
  });
  
  return y + 8;
};

// Ajouter pied de page
const addFooter = (doc: jsPDF): void => {
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      'Page ' + i + ' sur ' + pageCount + ' - keneya-so ' + new Date().getFullYear(),
      105,
      290,
      { align: 'center' }
    );
  }
};

// Export liste des patients
export const exportPatientsPDF = (patients: Patient[]): void => {
  try {
    const doc = setupPDF('Liste des Patients');
    
    const widths = [30, 50, 25, 20, 30, 27];
    let y = 70;
    
    // Header
    y = drawTableRow(doc, y, ['N Dossier', 'Nom complet', 'Sexe', 'Age', 'Telephone', 'Consult.'], widths, true);
    
    // Lignes alternées
    patients.forEach((p, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        y = drawTableRow(doc, y, ['N Dossier', 'Nom complet', 'Sexe', 'Age', 'Telephone', 'Consult.'], widths, true);
      }
      
      // Fond alterné
      if (index % 2 === 0) {
        doc.setFillColor(245, 247, 250);
        doc.rect(14, y - 5, widths.reduce((a, b) => a + b, 0), 8, 'F');
      }
      
      y = drawTableRow(doc, y, [
        p.numeroDossier,
        p.nom + ' ' + p.prenom,
        p.sexe === 'M' ? 'Masculin' : 'Feminin',
        calculateAge(p.dateNaissance) + ' ans',
        p.telephone,
        p.consultations.length.toString()
      ], widths);
    });
    
    // Stats
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text('Total: ' + patients.length + ' patients', 14, y);
    
    addFooter(doc);
    doc.save('patients_liste.pdf');
  } catch (error) {
    console.error('Erreur export PDF:', error);
    alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
  }
};

// Export dossier patient individuel
export const exportPatientDossierPDF = (patient: Patient): void => {
  try {
    const doc = setupPDF('Dossier Patient - ' + patient.numeroDossier);
    
    // Informations personnelles
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Informations Personnelles', 14, 70);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    
    let y = 80;
    const info = [
      ['Nom complet:', patient.nom + ' ' + patient.prenom],
      ['N Dossier:', patient.numeroDossier],
      ['Sexe:', patient.sexe === 'M' ? 'Masculin' : 'Feminin'],
      ['Age:', calculateAge(patient.dateNaissance) + ' ans'],
      ['Date de naissance:', new Date(patient.dateNaissance).toLocaleDateString('fr-FR')],
      ['Telephone:', patient.telephone],
      ['Adresse:', patient.adresse],
      ['Date admission:', new Date(patient.dateAdmission).toLocaleDateString('fr-FR')]
    ];
    
    if (patient.groupeSanguin) {
      info.push(['Groupe sanguin:', patient.groupeSanguin]);
    }
    if (patient.allergies) {
      info.push(['Allergies:', patient.allergies]);
    }
    
    info.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 60, y);
      y += 7;
    });
    
    // Historique des consultations
    y += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Historique des Consultations (' + patient.consultations.length + ')', 14, y);
    
    y += 10;
    
    if (patient.consultations.length === 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Aucune consultation enregistree', 14, y);
    } else {
      patient.consultations.forEach((c, index) => {
        if (y > 260) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFillColor(245, 247, 250);
        doc.rect(14, y - 4, 182, 28, 'F');
        
        doc.setFontSize(9);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text((index + 1) + '. ' + new Date(c.date).toLocaleDateString('fr-FR') + ' - ' + c.medecinNom, 16, y);
        
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text('Diagnostic: ' + c.diagnostic, 16, y);
        y += 5;
        doc.text('Traitement: ' + c.traitement, 16, y);
        if (c.notes) {
          y += 5;
          doc.text('Notes: ' + c.notes, 16, y);
        }
        y += 12;
      });
    }
    
    addFooter(doc);
    doc.save('dossier_patient_' + patient.numeroDossier + '.pdf');
  } catch (error) {
    console.error('Erreur export PDF:', error);
    alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
  }
};

// Export liste du personnel
export const exportPersonnelPDF = (personnel: Personnel[]): void => {
  try {
    const doc = setupPDF('Liste du Personnel');
    
    const widths = [45, 25, 30, 45, 30, 22];
    let y = 70;
    
    // Header
    y = drawTableRow(doc, y, ['Nom', 'Type', 'Specialite', 'Email', 'Tel', 'Embauche'], widths, true);
    
    personnel.forEach((p, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        y = drawTableRow(doc, y, ['Nom', 'Type', 'Specialite', 'Email', 'Tel', 'Embauche'], widths, true);
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(245, 247, 250);
        doc.rect(14, y - 5, widths.reduce((a, b) => a + b, 0), 8, 'F');
      }
      
      const typeLabels: Record<string, string> = {
        medecin: 'Medecin',
        infirmier: 'Infirmier',
        agent: 'Agent'
      };
      
      y = drawTableRow(doc, y, [
        (p.type === 'medecin' ? 'Dr. ' : '') + p.nom + ' ' + p.prenom,
        typeLabels[p.type] || p.type,
        p.specialite || '-',
        p.email,
        p.telephone,
        new Date(p.dateEmbauche).toLocaleDateString('fr-FR')
      ], widths);
    });
    
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text('Total: ' + personnel.length + ' membres', 14, y);
    
    addFooter(doc);
    doc.save('personnel_liste.pdf');
  } catch (error) {
    console.error('Erreur export PDF:', error);
    alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
  }
};

// Export liste des rendez-vous
export const exportRendezVousPDF = (rendezVous: RendezVous[]): void => {
  try {
    const doc = setupPDF('Liste des Rendez-vous');
    
    const widths = [25, 15, 40, 40, 45, 22];
    let y = 70;
    
    y = drawTableRow(doc, y, ['Date', 'Heure', 'Patient', 'Medecin', 'Motif', 'Statut'], widths, true);
    
    const sorted = [...rendezVous].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    sorted.forEach((r, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        y = drawTableRow(doc, y, ['Date', 'Heure', 'Patient', 'Medecin', 'Motif', 'Statut'], widths, true);
      }
      
      if (index % 2 === 0) {
        doc.setFillColor(245, 247, 250);
        doc.rect(14, y - 5, widths.reduce((a, b) => a + b, 0), 8, 'F');
      }
      
      const statutLabels: Record<string, string> = {
        planifie: 'Planifie',
        termine: 'Termine',
        annule: 'Annule'
      };
      
      y = drawTableRow(doc, y, [
        new Date(r.date).toLocaleDateString('fr-FR'),
        r.heure,
        r.patientNom,
        r.medecinNom,
        r.motif,
        statutLabels[r.statut] || r.statut
      ], widths);
    });
    
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.text('Total: ' + rendezVous.length + ' rendez-vous', 14, y);
    
    addFooter(doc);
    doc.save('rendez_vous_liste.pdf');
  } catch (error) {
    console.error('Erreur export PDF:', error);
    alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
  }
};

// Export rapport statistique
export const exportDashboardPDF = (stats: {
  totalPatients: number;
  totalPersonnel: number;
  rdvAujourdhui: number;
  rdvPlanifies: number;
  rdvTermines: number;
  medecins: number;
  infirmiers: number;
  agents: number;
}): void => {
  try {
    const doc = setupPDF('Rapport Statistique');
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Vue d\'ensemble', 14, 70);
    
    let y = 85;
    doc.setFontSize(10);
    
    const data = [
      ['Total Patients', stats.totalPatients.toString()],
      ['Total Personnel', stats.totalPersonnel.toString()],
      ['Medecins', stats.medecins.toString()],
      ['Infirmiers', stats.infirmiers.toString()],
      ['Agents', stats.agents.toString()],
      ['RDV aujourd\'hui', stats.rdvAujourdhui.toString()],
      ['RDV planifies', stats.rdvPlanifies.toString()],
      ['RDV termines', stats.rdvTermines.toString()]
    ];
    
    data.forEach(([label, value], index) => {
      // Fond alterné
      if (index % 2 === 0) {
        doc.setFillColor(245, 247, 250);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(14, y - 5, 120, 10, 'F');
      
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.text(label, 18, y);
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 64, 175);
      doc.text(value, 110, y, { align: 'right' });
      
      y += 12;
    });
    
    addFooter(doc);
    doc.save('rapport_statistique.pdf');
  } catch (error) {
    console.error('Erreur export PDF:', error);
    alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
  }
};

// Export facture
export const exportFacturePDF = (facture: Facture, _patient?: Patient): void => {
  try {
    const doc = setupPDF('Facture N ' + facture.numero);
    
    let y = 70;
    
    // Infos facture
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Facture N:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.numero, 50, y);
    
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Date:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(facture.date).toLocaleDateString('fr-FR'), 50, y);
    
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Patient:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(facture.patientNom, 50, y);
    
    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Statut:', 14, y);
    doc.setFont('helvetica', 'normal');
    const statutLabel = facture.statut === 'payee' ? 'PAYEE' : facture.statut === 'annulee' ? 'ANNULEE' : 'EN ATTENTE';
    doc.text(statutLabel, 50, y);
    
    // Articles
    y += 15;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Articles', 14, y);
    
    y += 10;
    
    // Header tableau
    doc.setFillColor(30, 64, 175);
    doc.rect(14, y - 5, 182, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text('Description', 16, y);
    doc.text('Qte', 120, y);
    doc.text('Prix unit.', 140, y);
    doc.text('Total', 175, y);
    
    y += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    
    facture.items.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(245, 247, 250);
        doc.rect(14, y - 5, 182, 8, 'F');
      }
      
      doc.text(item.description.substring(0, 45), 16, y);
      doc.text(item.quantite.toString(), 120, y);
      doc.text(item.prixUnitaire.toFixed(2) + ' EUR', 140, y);
      doc.text((item.quantite * item.prixUnitaire).toFixed(2) + ' EUR', 175, y);
      y += 8;
    });
    
    // Total
    y += 5;
    doc.setFillColor(30, 64, 175);
    doc.rect(120, y - 5, 76, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL: ' + facture.total.toFixed(2) + ' EUR', 158, y + 2, { align: 'center' });
    
    if (facture.modePaiement) {
      y += 20;
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text('Mode de paiement: ' + facture.modePaiement, 14, y);
    }
    
    addFooter(doc);
    doc.save('facture_' + facture.numero + '.pdf');
  } catch (error) {
    console.error('Erreur export PDF:', error);
    alert('Erreur lors de l\'export PDF. Veuillez réessayer.');
  }
};
