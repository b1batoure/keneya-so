<?php
/**
 * keneya-so - API Authentification
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($action) {
    case 'login':
        if ($method !== 'POST') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        login();
        break;
        
    case 'register':
        if ($method !== 'POST') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        register();
        break;
        
    case 'logout':
        if ($method !== 'POST') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        logout();
        break;
        
    case 'me':
        if ($method !== 'GET') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        me();
        break;
        
    case 'change-password':
        if ($method !== 'POST') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        changePassword();
        break;
        
    default:
        jsonResponse(['error' => 'Action non trouvée'], 404);
}

function login() {
    $input = getInput();
    
    $errors = validateRequired($input, ['email', 'password']);
    if (!empty($errors)) {
        jsonResponse(['error' => implode(', ', $errors)], 400);
    }
    
    $db = getDB();
    $stmt = $db->prepare('SELECT * FROM utilisateurs WHERE email = ? AND actif = 1');
    $stmt->execute([$input['email']]);
    $user = $stmt->fetch();
    
    if (!$user || !password_verify($input['password'], $user['password'])) {
        jsonResponse(['error' => 'Email ou mot de passe incorrect'], 401);
    }
    
    // Mettre à jour la dernière connexion
    $stmt = $db->prepare('UPDATE utilisateurs SET dernier_connexion = NOW() WHERE id = ?');
    $stmt->execute([$user['id']]);
    
    // Générer le token
    $token = generateToken($user['id']);
    
    // Créer la session
    $sessionId = bin2hex(random_bytes(32));
    $stmt = $db->prepare('
        INSERT INTO sessions (id, utilisateur_id, token, ip_address, user_agent, derniere_activite, expire_at)
        VALUES (?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 24 HOUR))
    ');
    $stmt->execute([
        $sessionId,
        $user['id'],
        $token,
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);
    
    logActivity($user['id'], 'login', 'utilisateur', $user['id']);
    
    jsonResponse([
        'success' => true,
        'token' => $token,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'nom' => $user['nom'],
            'role' => $user['role']
        ]
    ]);
}

function register() {
    $input = getInput();
    
    $errors = validateRequired($input, ['email', 'password', 'nom']);
    if (!empty($errors)) {
        jsonResponse(['error' => implode(', ', $errors)], 400);
    }
    
    // Valider l'email
    if (!filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        jsonResponse(['error' => 'Email invalide'], 400);
    }
    
    // Valider le mot de passe
    if (strlen($input['password']) < 6) {
        jsonResponse(['error' => 'Le mot de passe doit contenir au moins 6 caractères'], 400);
    }
    
    $db = getDB();
    
    // Vérifier si l'email existe déjà
    $stmt = $db->prepare('SELECT id FROM utilisateurs WHERE email = ?');
    $stmt->execute([$input['email']]);
    if ($stmt->fetch()) {
        jsonResponse(['error' => 'Cet email est déjà utilisé'], 400);
    }
    
    // Créer l'utilisateur
    $hashedPassword = password_hash($input['password'], PASSWORD_DEFAULT);
    $role = $input['role'] ?? 'agent';
    
    // Seul un admin peut créer d'autres admins
    if ($role === 'admin') {
        $currentUser = getAuthUser();
        if (!$currentUser || $currentUser['role'] !== 'admin') {
            $role = 'agent';
        }
    }
    
    $stmt = $db->prepare('
        INSERT INTO utilisateurs (email, password, nom, role)
        VALUES (?, ?, ?, ?)
    ');
    $stmt->execute([$input['email'], $hashedPassword, $input['nom'], $role]);
    $userId = $db->lastInsertId();
    
    logActivity($userId, 'register', 'utilisateur', $userId);
    
    // Notifier les admins
    notifyRole('admin', 'info', 'Nouvel utilisateur', "L'utilisateur {$input['nom']} s'est inscrit", '/utilisateurs');
    
    jsonResponse([
        'success' => true,
        'message' => 'Compte créé avec succès',
        'user_id' => $userId
    ], 201);
}

function logout() {
    $user = getAuthUser();
    if ($user) {
        $db = getDB();
        $stmt = $db->prepare('DELETE FROM sessions WHERE utilisateur_id = ?');
        $stmt->execute([$user['id']]);
        
        logActivity($user['id'], 'logout', 'utilisateur', $user['id']);
    }
    
    jsonResponse(['success' => true, 'message' => 'Déconnexion réussie']);
}

function me() {
    $user = requireAuth();
    jsonResponse([
        'id' => $user['id'],
        'email' => $user['email'],
        'nom' => $user['nom'],
        'role' => $user['role']
    ]);
}

function changePassword() {
    $user = requireAuth();
    $input = getInput();
    
    $errors = validateRequired($input, ['current_password', 'new_password']);
    if (!empty($errors)) {
        jsonResponse(['error' => implode(', ', $errors)], 400);
    }
    
    if (strlen($input['new_password']) < 6) {
        jsonResponse(['error' => 'Le nouveau mot de passe doit contenir au moins 6 caractères'], 400);
    }
    
    $db = getDB();
    $stmt = $db->prepare('SELECT password FROM utilisateurs WHERE id = ?');
    $stmt->execute([$user['id']]);
    $userData = $stmt->fetch();
    
    if (!password_verify($input['current_password'], $userData['password'])) {
        jsonResponse(['error' => 'Mot de passe actuel incorrect'], 400);
    }
    
    $hashedPassword = password_hash($input['new_password'], PASSWORD_DEFAULT);
    $stmt = $db->prepare('UPDATE utilisateurs SET password = ? WHERE id = ?');
    $stmt->execute([$hashedPassword, $user['id']]);
    
    logActivity($user['id'], 'change_password', 'utilisateur', $user['id']);
    
    jsonResponse(['success' => true, 'message' => 'Mot de passe modifié avec succès']);
}
