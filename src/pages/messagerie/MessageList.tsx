import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, X, Mail, MailOpen, Send, AlertCircle, Trash2, Reply } from 'lucide-react';

export function MessageList() {
  const { messages, addMessage, markMessageAsRead, deleteMessage } = useData();
  const { user, users } = useAuth();
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<typeof messages[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  const [formData, setFormData] = useState({
    destinataireId: '',
    destinataireNom: '',
    sujet: '',
    contenu: '',
    urgent: false
  });

  const currentUserId = user?.id || '1';
  
  const receivedMessages = messages
    .filter(m => m.destinataireId === currentUserId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const sentMessages = messages
    .filter(m => m.expediteurId === currentUserId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const unreadCount = receivedMessages.filter(m => !m.lu).length;

  const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    const selectedUser = users.find(u => u.id === userId);
    setFormData(prev => ({
      ...prev,
      destinataireId: userId,
      destinataireNom: selectedUser?.nom || ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMessage({
      expediteurId: currentUserId,
      expediteurNom: user?.nom || 'Utilisateur',
      ...formData
    });
    setShowComposeModal(false);
    setFormData({
      destinataireId: '',
      destinataireNom: '',
      sujet: '',
      contenu: '',
      urgent: false
    });
  };

  const openMessage = (message: typeof messages[0]) => {
    setSelectedMessage(message);
    setShowDetailModal(true);
    if (!message.lu && message.destinataireId === currentUserId) {
      markMessageAsRead(message.id);
    }
  };

  const handleReply = () => {
    if (selectedMessage) {
      setFormData({
        destinataireId: selectedMessage.expediteurId,
        destinataireNom: selectedMessage.expediteurNom,
        sujet: `RE: ${selectedMessage.sujet}`,
        contenu: '',
        urgent: false
      });
      setShowDetailModal(false);
      setShowComposeModal(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce message ?')) {
      deleteMessage(id);
      if (showDetailModal) {
        setShowDetailModal(false);
        setSelectedMessage(null);
      }
    }
  };

  const displayMessages = activeTab === 'received' ? receivedMessages : sentMessages;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center relative">
            <Mail className="w-6 h-6 text-blue-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Messagerie</h1>
            <p className="text-gray-500">{unreadCount} message(s) non lu(s)</p>
          </div>
        </div>
        <button
          onClick={() => setShowComposeModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau message
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('received')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'received'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Reçus ({receivedMessages.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'sent'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Envoyés ({sentMessages.length})
        </button>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {displayMessages.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun message</p>
          </div>
        ) : (
          displayMessages.map((message) => (
            <div
              key={message.id}
              onClick={() => openMessage(message)}
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                !message.lu && activeTab === 'received' ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  !message.lu && activeTab === 'received' ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  {!message.lu && activeTab === 'received' ? (
                    <Mail className="w-5 h-5 text-blue-600" />
                  ) : (
                    <MailOpen className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`font-medium truncate ${!message.lu && activeTab === 'received' ? 'text-gray-900' : 'text-gray-700'}`}>
                      {activeTab === 'received' ? message.expediteurNom : `À: ${message.destinataireNom}`}
                    </p>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {new Date(message.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    {message.urgent && (
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    )}
                    <p className={`text-sm truncate ${!message.lu && activeTab === 'received' ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
                      {message.sujet}
                    </p>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {message.contenu}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                Nouveau message
              </h3>
              <button
                onClick={() => setShowComposeModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destinataire *</label>
                <select
                  value={formData.destinataireId}
                  onChange={handleUserChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  required
                >
                  <option value="">Sélectionner</option>
                  {users.filter(u => u.id !== currentUserId).map(u => (
                    <option key={u.id} value={u.id}>{u.nom} ({u.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sujet *</label>
                <input
                  type="text"
                  value={formData.sujet}
                  onChange={(e) => setFormData(p => ({ ...p, sujet: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="Objet du message"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  value={formData.contenu}
                  onChange={(e) => setFormData(p => ({ ...p, contenu: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                  placeholder="Écrivez votre message..."
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="urgent"
                  checked={formData.urgent}
                  onChange={(e) => setFormData(p => ({ ...p, urgent: e.target.checked }))}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded"
                />
                <label htmlFor="urgent" className="text-sm text-gray-700 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Marquer comme urgent
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedMessage && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {selectedMessage.urgent && (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedMessage.sujet}
                </h3>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div>
                  <p className="text-gray-500">De:</p>
                  <p className="font-medium text-gray-800">{selectedMessage.expediteurNom}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">Le:</p>
                  <p className="text-gray-800">
                    {new Date(selectedMessage.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.contenu}</p>
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="inline-flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Fermer
                  </button>
                  {selectedMessage.expediteurId !== currentUserId && (
                    <button
                      onClick={handleReply}
                      className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      <Reply className="w-4 h-4" />
                      Répondre
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
