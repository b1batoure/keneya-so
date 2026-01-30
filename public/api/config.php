<?php
/**
 * HospiGest - Configuration
 */

// Mode debug (mettre à false en production)
define('DEBUG', true);

// Configuration de la base de données
define('DB_HOST', 'localhost');
define('DB_NAME', 'hospigest');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Configuration JWT
define('JWT_SECRET', 'votre_cle_secrete_tres_longue_et_complexe_ici');
define('JWT_EXPIRE', 86400); // 24 heures

// Configuration de l'application
define('APP_NAME', 'HospiGest');
define('APP_URL', 'http://localhost');
define('API_URL', APP_URL . '/api');

// Configuration email (pour les notifications)
define('MAIL_HOST', 'smtp.example.com');
define('MAIL_PORT', 587);
define('MAIL_USER', 'noreply@hospigest.com');
define('MAIL_PASS', 'password');
define('MAIL_FROM', 'noreply@hospigest.com');
define('MAIL_FROM_NAME', 'HospiGest');

// Timezone
date_default_timezone_set('Europe/Paris');

// Headers CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

// Gestion des requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Connexion PDO
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            if (DEBUG) {
                die(json_encode(['error' => 'Erreur de connexion: ' . $e->getMessage()]));
            }
            die(json_encode(['error' => 'Erreur de connexion à la base de données']));
        }
    }
    return $pdo;
}

// Fonctions utilitaires
function jsonResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}

function getInput() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

function validateRequired($data, $fields) {
    $errors = [];
    foreach ($fields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Le champ '$field' est requis";
        }
    }
    return $errors;
}

// Génération de token JWT simple
function generateToken($userId) {
    $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
    $payload = base64_encode(json_encode([
        'user_id' => $userId,
        'iat' => time(),
        'exp' => time() + JWT_EXPIRE
    ]));
    $signature = hash_hmac('sha256', "$header.$payload", JWT_SECRET, true);
    $signature = base64_encode($signature);
    return "$header.$payload.$signature";
}

function verifyToken($token) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    
    list($header, $payload, $signature) = $parts;
    $validSignature = base64_encode(hash_hmac('sha256', "$header.$payload", JWT_SECRET, true));
    
    if ($signature !== $validSignature) return false;
    
    $data = json_decode(base64_decode($payload), true);
    if ($data['exp'] < time()) return false;
    
    return $data;
}

function getAuthUser() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
        $token = $matches[1];
        $data = verifyToken($token);
        if ($data) {
            $db = getDB();
            $stmt = $db->prepare('SELECT id, email, nom, role FROM utilisateurs WHERE id = ?');
            $stmt->execute([$data['user_id']]);
            return $stmt->fetch();
        }
    }
    return null;
}

function requireAuth($roles = []) {
    $user = getAuthUser();
    if (!$user) {
        jsonResponse(['error' => 'Non authentifié'], 401);
    }
    if (!empty($roles) && !in_array($user['role'], $roles)) {
        jsonResponse(['error' => 'Accès non autorisé'], 403);
    }
    return $user;
}

// Logging
function logActivity($userId, $action, $entityType, $entityId = null, $details = null) {
    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO logs_activite (utilisateur_id, action, entite_type, entite_id, details, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $userId,
        $action,
        $entityType,
        $entityId,
        $details ? json_encode($details) : null,
        $_SERVER['REMOTE_ADDR'] ?? null,
        $_SERVER['HTTP_USER_AGENT'] ?? null
    ]);
}

// Créer une notification
function createNotification($userId, $type, $titre, $message, $lien = null, $entityType = null, $entityId = null) {
    $db = getDB();
    $stmt = $db->prepare('
        INSERT INTO notifications (utilisateur_id, type, titre, message, lien, entite_type, entite_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([$userId, $type, $titre, $message, $lien, $entityType, $entityId]);
    return $db->lastInsertId();
}

// Notifier tous les utilisateurs d'un rôle
function notifyRole($role, $type, $titre, $message, $lien = null) {
    $db = getDB();
    $stmt = $db->prepare('SELECT id FROM utilisateurs WHERE role = ? AND actif = 1');
    $stmt->execute([$role]);
    $users = $stmt->fetchAll();
    
    foreach ($users as $user) {
        createNotification($user['id'], $type, $titre, $message, $lien);
    }
}
