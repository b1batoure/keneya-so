<?php
/**
 * HospiGest - API Patients
 */
require_once 'config.php';

$user = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

switch ($method) {
    case 'GET':
        if ($id) {
            getPatient($id);
        } else {
            getPatients();
        }
        break;
        
    case 'POST':
        requireAuth(['admin', 'agent']);
        createPatient();
        break;
        
    case 'PUT':
        requireAuth(['admin', 'agent']);
        if (!$id) jsonResponse(['error' => 'ID requis'], 400);
        updatePatient($id);
        break;
        
    case 'DELETE':
        requireAuth(['admin']);
        if (!$id) jsonResponse(['error' => 'ID requis'], 400);
        deletePatient($id);
        break;
        
    default:
        jsonResponse(['error' => 'Méthode non autorisée'], 405);
}

function getPatients() {
    $db = getDB();
    
    $search = $_GET['search'] ?? '';
    $statut = $_GET['statut'] ?? 'actif';
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(100, max(10, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    
    $where = ['statut = ?'];
    $params = [$statut];
    
    if ($search) {
        $where[] = '(nom LIKE ? OR prenom LIKE ? OR numero_dossier LIKE ? OR telephone LIKE ?)';
        $searchParam = "%$search%";
        $params = array_merge($params, [$searchParam, $searchParam, $searchParam, $searchParam]);
    }
    
    $whereClause = implode(' AND ', $where);
    
    // Compter le total
    $stmt = $db->prepare("SELECT COUNT(*) FROM patients WHERE $whereClause");
    $stmt->execute($params);
    $total = $stmt->fetchColumn();
    
    // Récupérer les patients
    $stmt = $db->prepare("
        SELECT p.*, 
               (SELECT COUNT(*) FROM consultations WHERE patient_id = p.id) as nb_consultations,
               (SELECT COUNT(*) FROM rendez_vous WHERE patient_id = p.id AND statut = 'planifie') as rdv_planifies
        FROM patients p
        WHERE $whereClause
        ORDER BY p.nom, p.prenom
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute($params);
    $patients = $stmt->fetchAll();
    
    jsonResponse([
        'data' => $patients,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

function getPatient($id) {
    $db = getDB();
    
    $stmt = $db->prepare('SELECT * FROM patients WHERE id = ?');
    $stmt->execute([$id]);
    $patient = $stmt->fetch();
    
    if (!$patient) {
        jsonResponse(['error' => 'Patient non trouvé'], 404);
    }
    
    // Récupérer les consultations
    $stmt = $db->prepare('
        SELECT c.*, CONCAT("Dr. ", p.nom, " ", p.prenom) as medecin_nom
        FROM consultations c
        JOIN personnel p ON c.medecin_id = p.id
        WHERE c.patient_id = ?
        ORDER BY c.date_consultation DESC
    ');
    $stmt->execute([$id]);
    $patient['consultations'] = $stmt->fetchAll();
    
    // Récupérer les rendez-vous à venir
    $stmt = $db->prepare('
        SELECT rv.*, CONCAT("Dr. ", p.nom, " ", p.prenom) as medecin_nom
        FROM rendez_vous rv
        JOIN personnel p ON rv.medecin_id = p.id
        WHERE rv.patient_id = ? AND rv.date_rdv >= CURDATE()
        ORDER BY rv.date_rdv, rv.heure_debut
    ');
    $stmt->execute([$id]);
    $patient['rendez_vous'] = $stmt->fetchAll();
    
    // Récupérer les factures
    $stmt = $db->prepare('
        SELECT * FROM factures 
        WHERE patient_id = ?
        ORDER BY date_facture DESC
        LIMIT 10
    ');
    $stmt->execute([$id]);
    $patient['factures'] = $stmt->fetchAll();
    
    jsonResponse($patient);
}

function createPatient() {
    global $user;
    $input = getInput();
    
    $errors = validateRequired($input, ['nom', 'prenom', 'sexe', 'date_naissance', 'telephone', 'adresse']);
    if (!empty($errors)) {
        jsonResponse(['error' => implode(', ', $errors)], 400);
    }
    
    $db = getDB();
    
    // Générer le numéro de dossier
    $year = date('Y');
    $stmt = $db->prepare("SELECT MAX(CAST(SUBSTRING(numero_dossier, 10) AS UNSIGNED)) as max_num FROM patients WHERE numero_dossier LIKE ?");
    $stmt->execute(["DOS-$year-%"]);
    $result = $stmt->fetch();
    $nextNum = ($result['max_num'] ?? 0) + 1;
    $numeroDossier = sprintf("DOS-%s-%03d", $year, $nextNum);
    
    $stmt = $db->prepare('
        INSERT INTO patients (numero_dossier, nom, prenom, sexe, date_naissance, telephone, email, adresse, 
                             ville, code_postal, groupe_sanguin, allergies, antecedents, 
                             contact_urgence_nom, contact_urgence_tel, assurance_nom, assurance_numero, date_admission)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $numeroDossier,
        $input['nom'],
        $input['prenom'],
        $input['sexe'],
        $input['date_naissance'],
        $input['telephone'],
        $input['email'] ?? null,
        $input['adresse'],
        $input['ville'] ?? null,
        $input['code_postal'] ?? null,
        $input['groupe_sanguin'] ?? null,
        $input['allergies'] ?? null,
        $input['antecedents'] ?? null,
        $input['contact_urgence_nom'] ?? null,
        $input['contact_urgence_tel'] ?? null,
        $input['assurance_nom'] ?? null,
        $input['assurance_numero'] ?? null,
        $input['date_admission'] ?? date('Y-m-d')
    ]);
    
    $patientId = $db->lastInsertId();
    
    logActivity($user['id'], 'create', 'patient', $patientId, ['numero_dossier' => $numeroDossier]);
    
    // Notifier
    notifyRole('medecin', 'info', 'Nouveau patient', "Patient {$input['nom']} {$input['prenom']} enregistré", "/patients/$patientId");
    
    jsonResponse([
        'success' => true,
        'message' => 'Patient créé avec succès',
        'patient_id' => $patientId,
        'numero_dossier' => $numeroDossier
    ], 201);
}

function updatePatient($id) {
    global $user;
    $input = getInput();
    
    $db = getDB();
    
    // Vérifier que le patient existe
    $stmt = $db->prepare('SELECT id FROM patients WHERE id = ?');
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        jsonResponse(['error' => 'Patient non trouvé'], 404);
    }
    
    $fields = [];
    $params = [];
    
    $allowedFields = ['nom', 'prenom', 'sexe', 'date_naissance', 'telephone', 'email', 'adresse',
                      'ville', 'code_postal', 'groupe_sanguin', 'allergies', 'antecedents',
                      'contact_urgence_nom', 'contact_urgence_tel', 'assurance_nom', 'assurance_numero', 'statut'];
    
    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            $fields[] = "$field = ?";
            $params[] = $input[$field];
        }
    }
    
    if (empty($fields)) {
        jsonResponse(['error' => 'Aucun champ à mettre à jour'], 400);
    }
    
    $params[] = $id;
    $stmt = $db->prepare('UPDATE patients SET ' . implode(', ', $fields) . ' WHERE id = ?');
    $stmt->execute($params);
    
    logActivity($user['id'], 'update', 'patient', $id, $input);
    
    jsonResponse(['success' => true, 'message' => 'Patient mis à jour']);
}

function deletePatient($id) {
    global $user;
    $db = getDB();
    
    // Vérifier que le patient existe
    $stmt = $db->prepare('SELECT numero_dossier FROM patients WHERE id = ?');
    $stmt->execute([$id]);
    $patient = $stmt->fetch();
    
    if (!$patient) {
        jsonResponse(['error' => 'Patient non trouvé'], 404);
    }
    
    // Archiver au lieu de supprimer
    $stmt = $db->prepare('UPDATE patients SET statut = "archive" WHERE id = ?');
    $stmt->execute([$id]);
    
    logActivity($user['id'], 'archive', 'patient', $id, ['numero_dossier' => $patient['numero_dossier']]);
    
    jsonResponse(['success' => true, 'message' => 'Patient archivé']);
}
