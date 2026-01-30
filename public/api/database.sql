-- HospiGest - Structure de la base de données MySQL
-- Version 1.0

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------
-- Table: utilisateurs
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `utilisateurs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nom` VARCHAR(100) NOT NULL,
  `role` ENUM('admin', 'medecin', 'agent') NOT NULL DEFAULT 'agent',
  `actif` TINYINT(1) DEFAULT 1,
  `dernier_connexion` DATETIME NULL,
  `token_reset` VARCHAR(100) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Utilisateurs par défaut
INSERT INTO `utilisateurs` (`email`, `password`, `nom`, `role`) VALUES
('admin@hospital.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrateur', 'admin'),
('medecin@hospital.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Martin', 'medecin'),
('agent@hospital.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Agent Dupont', 'agent');

-- --------------------------------------------------------
-- Table: patients
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `patients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `numero_dossier` VARCHAR(50) NOT NULL UNIQUE,
  `nom` VARCHAR(100) NOT NULL,
  `prenom` VARCHAR(100) NOT NULL,
  `sexe` ENUM('M', 'F') NOT NULL,
  `date_naissance` DATE NOT NULL,
  `telephone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(255) NULL,
  `adresse` TEXT NOT NULL,
  `ville` VARCHAR(100) NULL,
  `code_postal` VARCHAR(10) NULL,
  `groupe_sanguin` VARCHAR(5) NULL,
  `allergies` TEXT NULL,
  `antecedents` TEXT NULL,
  `contact_urgence_nom` VARCHAR(100) NULL,
  `contact_urgence_tel` VARCHAR(20) NULL,
  `assurance_nom` VARCHAR(100) NULL,
  `assurance_numero` VARCHAR(50) NULL,
  `date_admission` DATE NOT NULL,
  `statut` ENUM('actif', 'inactif', 'archive') DEFAULT 'actif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: personnel
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `personnel` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `utilisateur_id` INT NULL,
  `nom` VARCHAR(100) NOT NULL,
  `prenom` VARCHAR(100) NOT NULL,
  `type` ENUM('medecin', 'infirmier', 'agent', 'laborantin', 'pharmacien') NOT NULL,
  `specialite` VARCHAR(100) NULL,
  `telephone` VARCHAR(20) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `adresse` TEXT NULL,
  `date_naissance` DATE NULL,
  `date_embauche` DATE NOT NULL,
  `numero_ordre` VARCHAR(50) NULL COMMENT 'Numéro ordre des médecins',
  `statut` ENUM('actif', 'conge', 'inactif') DEFAULT 'actif',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: consultations
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `consultations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `medecin_id` INT NOT NULL,
  `date_consultation` DATETIME NOT NULL,
  `motif` TEXT NULL,
  `diagnostic` TEXT NOT NULL,
  `traitement` TEXT NOT NULL,
  `notes` TEXT NULL,
  `tension_arterielle` VARCHAR(20) NULL,
  `temperature` DECIMAL(4,1) NULL,
  `poids` DECIMAL(5,2) NULL,
  `taille` DECIMAL(5,2) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`medecin_id`) REFERENCES `personnel`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: rendez_vous
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `rendez_vous` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `medecin_id` INT NOT NULL,
  `date_rdv` DATE NOT NULL,
  `heure_debut` TIME NOT NULL,
  `heure_fin` TIME NULL,
  `motif` TEXT NOT NULL,
  `statut` ENUM('planifie', 'confirme', 'en_cours', 'termine', 'annule', 'absent') DEFAULT 'planifie',
  `notes` TEXT NULL,
  `rappel_envoye` TINYINT(1) DEFAULT 0,
  `created_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`medecin_id`) REFERENCES `personnel`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`created_by`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: planning
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `planning` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `personnel_id` INT NOT NULL,
  `jour_semaine` ENUM('lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche') NOT NULL,
  `heure_debut` TIME NOT NULL,
  `heure_fin` TIME NOT NULL,
  `type` ENUM('travail', 'garde', 'astreinte') DEFAULT 'travail',
  `salle_id` INT NULL,
  `actif` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`personnel_id`) REFERENCES `personnel`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: salles
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `salles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `numero` VARCHAR(20) NOT NULL UNIQUE,
  `type` ENUM('consultation', 'operation', 'urgence', 'hospitalisation', 'laboratoire', 'radiologie') NOT NULL,
  `capacite` INT DEFAULT 1,
  `etage` INT NOT NULL,
  `batiment` VARCHAR(50) NULL,
  `equipements` JSON NULL,
  `statut` ENUM('disponible', 'occupee', 'maintenance', 'fermee') DEFAULT 'disponible',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: lits
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `lits` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `numero` VARCHAR(20) NOT NULL UNIQUE,
  `salle_id` INT NOT NULL,
  `patient_id` INT NULL,
  `statut` ENUM('libre', 'occupe', 'reserve', 'maintenance') DEFAULT 'libre',
  `date_entree` DATETIME NULL,
  `date_sortie_prevue` DATE NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`salle_id`) REFERENCES `salles`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: factures
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `factures` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `numero` VARCHAR(50) NOT NULL UNIQUE,
  `patient_id` INT NOT NULL,
  `date_facture` DATE NOT NULL,
  `date_echeance` DATE NULL,
  `total_ht` DECIMAL(10,2) NOT NULL,
  `tva` DECIMAL(5,2) DEFAULT 0,
  `total_ttc` DECIMAL(10,2) NOT NULL,
  `statut` ENUM('brouillon', 'en_attente', 'payee', 'partielle', 'annulee', 'remboursee') DEFAULT 'brouillon',
  `mode_paiement` ENUM('especes', 'carte', 'cheque', 'virement', 'assurance') NULL,
  `date_paiement` DATETIME NULL,
  `reference_paiement` VARCHAR(100) NULL,
  `notes` TEXT NULL,
  `created_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`created_by`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: facture_lignes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `facture_lignes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `facture_id` INT NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `quantite` INT NOT NULL DEFAULT 1,
  `prix_unitaire` DECIMAL(10,2) NOT NULL,
  `tva` DECIMAL(5,2) DEFAULT 0,
  `total` DECIMAL(10,2) NOT NULL,
  `type` ENUM('consultation', 'acte', 'medicament', 'hospitalisation', 'laboratoire', 'autre') DEFAULT 'autre',
  `reference_id` INT NULL COMMENT 'ID de la consultation, médicament, etc.',
  FOREIGN KEY (`facture_id`) REFERENCES `factures`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: medicaments
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `medicaments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nom` VARCHAR(255) NOT NULL,
  `dci` VARCHAR(255) NULL COMMENT 'Dénomination Commune Internationale',
  `categorie` VARCHAR(100) NOT NULL,
  `dosage` VARCHAR(50) NOT NULL,
  `forme` ENUM('comprime', 'gelule', 'sirop', 'injection', 'pommade', 'gouttes', 'suppositoire', 'autre') NOT NULL,
  `conditionnement` VARCHAR(100) NULL,
  `quantite_stock` INT NOT NULL DEFAULT 0,
  `seuil_alerte` INT DEFAULT 50,
  `prix_achat` DECIMAL(10,2) NULL,
  `prix_vente` DECIMAL(10,2) NOT NULL,
  `date_expiration` DATE NOT NULL,
  `lot` VARCHAR(50) NULL,
  `fournisseur` VARCHAR(100) NULL,
  `emplacement` VARCHAR(50) NULL COMMENT 'Emplacement dans la pharmacie',
  `ordonnance_obligatoire` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: ordonnances
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ordonnances` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `consultation_id` INT NOT NULL,
  `patient_id` INT NOT NULL,
  `medecin_id` INT NOT NULL,
  `date_ordonnance` DATE NOT NULL,
  `duree_validite` INT DEFAULT 30 COMMENT 'En jours',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`consultation_id`) REFERENCES `consultations`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`medecin_id`) REFERENCES `personnel`(`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: ordonnance_lignes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ordonnance_lignes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ordonnance_id` INT NOT NULL,
  `medicament_id` INT NULL,
  `nom_medicament` VARCHAR(255) NOT NULL,
  `dosage` VARCHAR(100) NOT NULL,
  `posologie` TEXT NOT NULL,
  `duree` VARCHAR(50) NOT NULL,
  `quantite` INT NOT NULL,
  `notes` TEXT NULL,
  FOREIGN KEY (`ordonnance_id`) REFERENCES `ordonnances`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`medicament_id`) REFERENCES `medicaments`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: examens
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `examens` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `consultation_id` INT NULL,
  `type` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `date_prescription` DATETIME NOT NULL,
  `date_prelevement` DATETIME NULL,
  `date_resultat` DATETIME NULL,
  `statut` ENUM('prescrit', 'en_attente', 'en_cours', 'termine', 'annule') DEFAULT 'prescrit',
  `resultat` TEXT NULL,
  `fichier_resultat` VARCHAR(255) NULL,
  `valeurs_reference` JSON NULL,
  `medecin_prescripteur_id` INT NOT NULL,
  `laborantin_id` INT NULL,
  `priorite` ENUM('normal', 'urgent', 'tres_urgent') DEFAULT 'normal',
  `notes` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`consultation_id`) REFERENCES `consultations`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`medecin_prescripteur_id`) REFERENCES `personnel`(`id`) ON DELETE RESTRICT,
  FOREIGN KEY (`laborantin_id`) REFERENCES `personnel`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: urgences
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `urgences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NULL,
  `patient_nom` VARCHAR(200) NOT NULL,
  `date_arrivee` DATETIME NOT NULL,
  `motif` TEXT NOT NULL,
  `niveau` TINYINT NOT NULL COMMENT '1=critique, 5=mineur',
  `statut` ENUM('en_attente', 'triage', 'en_cours', 'observation', 'hospitalise', 'transfere', 'sorti', 'deces') DEFAULT 'en_attente',
  `medecin_id` INT NULL,
  `salle_id` INT NULL,
  `lit_id` INT NULL,
  `observations` TEXT NULL,
  `constantes` JSON NULL COMMENT 'tension, pouls, température, etc.',
  `heure_prise_en_charge` DATETIME NULL,
  `heure_sortie` DATETIME NULL,
  `destination_sortie` VARCHAR(100) NULL,
  `created_by` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`medecin_id`) REFERENCES `personnel`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`salle_id`) REFERENCES `salles`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`lit_id`) REFERENCES `lits`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`created_by`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: messages
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `expediteur_id` INT NOT NULL,
  `destinataire_id` INT NOT NULL,
  `sujet` VARCHAR(255) NOT NULL,
  `contenu` TEXT NOT NULL,
  `date_envoi` DATETIME NOT NULL,
  `date_lecture` DATETIME NULL,
  `lu` TINYINT(1) DEFAULT 0,
  `urgent` TINYINT(1) DEFAULT 0,
  `archive_expediteur` TINYINT(1) DEFAULT 0,
  `archive_destinataire` TINYINT(1) DEFAULT 0,
  `reponse_a` INT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`expediteur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`destinataire_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reponse_a`) REFERENCES `messages`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: notifications
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `utilisateur_id` INT NOT NULL,
  `type` ENUM('info', 'warning', 'success', 'error', 'urgent') NOT NULL DEFAULT 'info',
  `titre` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `lien` VARCHAR(255) NULL,
  `entite_type` VARCHAR(50) NULL COMMENT 'patient, rdv, urgence, etc.',
  `entite_id` INT NULL,
  `lu` TINYINT(1) DEFAULT 0,
  `date_lecture` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE,
  INDEX `idx_notifications_user_lu` (`utilisateur_id`, `lu`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: logs_activite
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `logs_activite` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `utilisateur_id` INT NULL,
  `action` VARCHAR(100) NOT NULL,
  `entite_type` VARCHAR(50) NOT NULL,
  `entite_id` INT NULL,
  `details` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE SET NULL,
  INDEX `idx_logs_date` (`created_at`),
  INDEX `idx_logs_user` (`utilisateur_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: sessions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` VARCHAR(128) PRIMARY KEY,
  `utilisateur_id` INT NOT NULL,
  `token` VARCHAR(255) NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `derniere_activite` DATETIME NOT NULL,
  `expire_at` DATETIME NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs`(`id`) ON DELETE CASCADE,
  INDEX `idx_sessions_token` (`token`),
  INDEX `idx_sessions_expire` (`expire_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: parametres
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `parametres` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cle` VARCHAR(100) NOT NULL UNIQUE,
  `valeur` TEXT NOT NULL,
  `type` ENUM('string', 'int', 'float', 'boolean', 'json') DEFAULT 'string',
  `description` TEXT NULL,
  `modifiable` TINYINT(1) DEFAULT 1,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Paramètres par défaut
INSERT INTO `parametres` (`cle`, `valeur`, `type`, `description`) VALUES
('nom_hopital', 'HospiGest', 'string', 'Nom de l''établissement'),
('adresse_hopital', '123 Avenue de la Santé', 'string', 'Adresse de l''établissement'),
('telephone_hopital', '01 23 45 67 89', 'string', 'Téléphone principal'),
('email_hopital', 'contact@hospigest.com', 'string', 'Email de contact'),
('devise', 'EUR', 'string', 'Devise pour la facturation'),
('tva_defaut', '20', 'float', 'TVA par défaut en %'),
('duree_rdv_defaut', '30', 'int', 'Durée par défaut d''un RDV en minutes'),
('rappel_rdv_heures', '24', 'int', 'Heures avant RDV pour rappel'),
('notifications_email', 'true', 'boolean', 'Activer les notifications par email');

SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------------------------------
-- Vues utiles
-- --------------------------------------------------------

-- Vue: Résumé des patients du jour
CREATE OR REPLACE VIEW `vue_rdv_aujourdhui` AS
SELECT 
  rv.id,
  rv.date_rdv,
  rv.heure_debut,
  rv.statut,
  rv.motif,
  p.numero_dossier,
  CONCAT(p.nom, ' ', p.prenom) AS patient_nom,
  CONCAT('Dr. ', per.nom, ' ', per.prenom) AS medecin_nom,
  per.specialite
FROM rendez_vous rv
JOIN patients p ON rv.patient_id = p.id
JOIN personnel per ON rv.medecin_id = per.id
WHERE rv.date_rdv = CURDATE()
ORDER BY rv.heure_debut;

-- Vue: Lits disponibles
CREATE OR REPLACE VIEW `vue_lits_disponibles` AS
SELECT 
  l.id,
  l.numero,
  s.numero AS salle_numero,
  s.type AS salle_type,
  s.etage
FROM lits l
JOIN salles s ON l.salle_id = s.id
WHERE l.statut = 'libre'
ORDER BY s.etage, s.numero, l.numero;

-- Vue: Médicaments en alerte stock
CREATE OR REPLACE VIEW `vue_medicaments_alerte` AS
SELECT 
  id,
  nom,
  categorie,
  quantite_stock,
  seuil_alerte,
  date_expiration,
  DATEDIFF(date_expiration, CURDATE()) AS jours_avant_expiration
FROM medicaments
WHERE quantite_stock <= seuil_alerte 
   OR date_expiration <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)
ORDER BY quantite_stock ASC, date_expiration ASC;

-- Vue: Statistiques quotidiennes
CREATE OR REPLACE VIEW `vue_stats_jour` AS
SELECT
  CURDATE() AS date_stats,
  (SELECT COUNT(*) FROM rendez_vous WHERE date_rdv = CURDATE()) AS rdv_total,
  (SELECT COUNT(*) FROM rendez_vous WHERE date_rdv = CURDATE() AND statut = 'termine') AS rdv_termines,
  (SELECT COUNT(*) FROM urgences WHERE DATE(date_arrivee) = CURDATE()) AS urgences_jour,
  (SELECT COUNT(*) FROM urgences WHERE statut IN ('en_attente', 'en_cours')) AS urgences_actives,
  (SELECT COUNT(*) FROM patients WHERE DATE(created_at) = CURDATE()) AS nouveaux_patients,
  (SELECT COUNT(*) FROM factures WHERE date_facture = CURDATE()) AS factures_jour,
  (SELECT COALESCE(SUM(total_ttc), 0) FROM factures WHERE date_paiement = CURDATE() AND statut = 'payee') AS encaissements_jour;
