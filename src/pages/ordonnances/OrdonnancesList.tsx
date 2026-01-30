import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Search, Eye, FileDown, X, Pill, User, Calendar, Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Ordonnance {
  id: string;
  patientId: string;
  patientNom: string;
  medecinId: string;
  medecinNom: string;
  date: string;
  medicaments: {
    nom: string;
    dosage: string;
    posologie: string;
    duree: string;
    quantite: number;
  }[];
  notes?: string;
}

export function OrdonnancesList() {
  const { patients, getMedecins } = useData();
  const { user } = useAuth();
  const [ordonnances, setOrdonnances] = useState<Ordonnance[]>(() => {
    const stored = localStorage.getItem('hospital_ordonnances');
    return stored ? JSON.parse(stored) : [];
  });
  
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrdonnance, setSelectedOrdonnance] = useState<Ordonnance | null>(null);
  
  const medecins = getMedecins();
  
  const [formData, setFormData] = useState({
    patientId: '',
    patientNom: '',
    medecinId: user?.role === 'medecin' ? '1' : '',
    medecinNom: user?.role === 'medecin' ? user.nom : '',
    medicaments: [{ nom: '', dosage: '', posologie: '', duree: '', quantite: 1 }],
    notes: ''
  });
  
  const filteredOrdonnances = ordonnances.filter(o =>
    o.patientNom.toLowerCase().includes(search.toLowerCase()) ||
    o.medecinNom.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const saveOrdonnances = (data: Ordonnance[]) => {
    setOrdonnances(data);
    localStorage.setItem('hospital_ordonnances', JSON.stringify(data));
  };
  
  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const patientId = e.target.value;
    const patient = patients.find(p => p.id === patientId);
    setFormData(prev => ({
      ...prev,
      patientId,
      patientNom: patient ? `${patient.nom} ${patient.prenom}` : ''
    }));
  };
  
  const handleMedecinChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const medecinId = e.target.value;
    const medecin = medecins.find(m => m.id === medecinId);
    setFormData(prev => ({
      ...prev,
      medecinId,
      medecinNom: medecin ? `Dr. ${medecin.nom} ${medecin.prenom}` : ''
    }));
  };
  
  const addMedicament = () => {
    setFormData(prev => ({
      ...prev,
      medicaments: [...prev.medicaments, { nom: '', dosage: '', posologie: '', duree: '', quantite: 1 }]
    }));
  };
  
  const removeMedicament = (index: number) => {
    if (formData.medicaments.length > 1) {
      setFormData(prev => ({
        ...prev,
        medicaments: prev.medicaments.filter((_, i) => i !== index)
      }));
    }
  };
  
  const updateMedicament = (index: number, field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      medicaments: prev.medicaments.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newOrdonnance: Ordonnance = {
      id: Date.now().toString(),
      patientId: formData.patientId,
      patientNom: formData.patientNom,
      medecinId: formData.medecinId,
      medecinNom: formData.medecinNom,
      date: new Date().toISOString().split('T')[0],
      medicaments: formData.medicaments,
      notes: formData.notes
    };
    
    saveOrdonnances([...ordonnances, newOrdonnance]);
    setShowAddModal(false);
    setFormData({
      patientId: '',
      patientNom: '',
      medecinId: '',
      medecinNom: '',
      medicaments: [{ nom: '', dosage: '', posologie: '', duree: '', quantite: 1 }],
      notes: ''
    });
  };
  
  const exportOrdonnancePDF = (ordonnance: Ordonnance) => {
    const doc = new jsPDF();
    
    // En-tête
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ORDONNANCE MÉDICALE', 105, 18, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('HospiGest - Centre Hospitalier', 105, 30, { align: 'center' });
    
    // Date
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Date: ${new Date(ordonnance.date).toLocaleDateString('fr-FR')}`, 160, 50);
    
    // Patient
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient:', 20, 55);
    doc.setFont('helvetica', 'normal');
    doc.text(ordonnance.patientNom, 50, 55);
    
    // Médecin
    doc.setFont('helvetica', 'bold');
    doc.text('Prescripteur:', 20, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(ordonnance.medecinNom, 60, 65);
    
    // Ligne de séparation
    doc.setDrawColor(30, 64, 175);
    doc.setLineWidth(0.5);
    doc.line(20, 75, 190, 75);
    
    // Médicaments
    let y = 85;
    doc.setFontSize(11);
    
    ordonnance.medicaments.forEach((med, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${med.nom} ${med.dosage}`, 20, y);
      y += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Posologie: ${med.posologie}`, 25, y);
      y += 6;
      doc.text(`Durée: ${med.duree} - Quantité: ${med.quantite}`, 25, y);
      y += 10;
    });
    
    // Notes
    if (ordonnance.notes) {
      y += 5;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.text('Notes: ' + ordonnance.notes, 20, y);
    }
    
    // Signature
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Signature du médecin:', 130, 260);
    doc.line(130, 280, 190, 280);
    
    // Pied de page
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Ordonnance valable 3 mois - Ne pas renouveler sans avis médical', 105, 290, { align: 'center' });
    
    doc.save(`ordonnance_${ordonnance.id}.pdf`);
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Pill className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Ordonnances</h1>
            <p className="text-gray-500">{ordonnances.length} ordonnances</p>
          </div>
        </div>
        {(user?.role === 'admin' || user?.role === 'medecin') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nouvelle ordonnance
          </button>
        )}
      </div>
      
      {/* Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par patient ou médecin..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black"
        />
      </div>
      
      {/* Liste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {filteredOrdonnances.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune ordonnance</p>
          </div>
        ) : (
          filteredOrdonnances.map((ordonnance) => (
            <div
              key={ordonnance.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{ordonnance.patientNom}</p>
                    <p className="text-sm text-gray-500">{ordonnance.medecinNom}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(ordonnance.date).toLocaleDateString('fr-FR')}
                    </div>
                    <p className="text-sm text-gray-500">
                      {ordonnance.medicaments.length} médicament(s)
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedOrdonnance(ordonnance);
                        setShowDetailModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Voir"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => exportOrdonnancePDF(ordonnance)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title="Télécharger PDF"
                    >
                      <FileDown className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Modal Ajout */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-800">Nouvelle Ordonnance</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient *</label>
                  <select
                    value={formData.patientId}
                    onChange={handlePatientChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    required
                  >
                    <option value="">Sélectionner</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.nom} {p.prenom}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Médecin prescripteur *</label>
                  <select
                    value={formData.medecinId}
                    onChange={handleMedecinChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                    required
                  >
                    <option value="">Sélectionner</option>
                    {medecins.map(m => (
                      <option key={m.id} value={m.id}>Dr. {m.nom} {m.prenom}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Médicaments</label>
                  <button
                    type="button"
                    onClick={addMedicament}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Ajouter
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.medicaments.map((med, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Médicament {index + 1}</span>
                        {formData.medicaments.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicament(index)}
                            className="text-red-500 hover:text-red-600 text-sm"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Nom du médicament"
                          value={med.nom}
                          onChange={(e) => updateMedicament(index, 'nom', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-black"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Dosage (ex: 500mg)"
                          value={med.dosage}
                          onChange={(e) => updateMedicament(index, 'dosage', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-black"
                          required
                        />
                      </div>
                      
                      <input
                        type="text"
                        placeholder="Posologie (ex: 1 comprimé 3x/jour)"
                        value={med.posologie}
                        onChange={(e) => updateMedicament(index, 'posologie', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                        required
                      />
                      
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          placeholder="Durée (ex: 7 jours)"
                          value={med.duree}
                          onChange={(e) => updateMedicament(index, 'duree', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-black"
                          required
                        />
                        <input
                          type="number"
                          placeholder="Quantité"
                          value={med.quantite}
                          onChange={(e) => updateMedicament(index, 'quantite', parseInt(e.target.value) || 1)}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-black"
                          min="1"
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(p => ({ ...p, notes: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="Notes ou recommandations..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  Créer l'ordonnance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal Détail */}
      {showDetailModal && selectedOrdonnance && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-gray-800">Détails de l'ordonnance</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Patient</p>
                  <p className="font-medium text-gray-800">{selectedOrdonnance.patientNom}</p>
                </div>
                <div>
                  <p className="text-gray-500">Prescripteur</p>
                  <p className="font-medium text-gray-800">{selectedOrdonnance.medecinNom}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">
                    {new Date(selectedOrdonnance.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Médicaments prescrits</h4>
                <div className="space-y-3">
                  {selectedOrdonnance.medicaments.map((med, index) => (
                    <div key={index} className="bg-purple-50 rounded-lg p-3">
                      <p className="font-medium text-purple-800">{med.nom} {med.dosage}</p>
                      <p className="text-sm text-purple-600">{med.posologie}</p>
                      <p className="text-sm text-purple-600">Durée: {med.duree} - Qté: {med.quantite}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedOrdonnance.notes && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-500">Notes:</p>
                  <p className="text-gray-700">{selectedOrdonnance.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    exportOrdonnancePDF(selectedOrdonnance);
                    setShowDetailModal(false);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Printer className="w-4 h-4" />
                  Imprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
