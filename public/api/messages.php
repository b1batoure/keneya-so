<?php
/**
 * HospiGest - API Messagerie
 * Communication interne entre le personnel
 */
require_once 'config.php';

$user = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
    case 'received':
        if ($method !== 'GET') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        getReceivedMessages();
        break;
        
    case 'sent':
        if ($method !== 'GET') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        getSentMessages();
        break;
        
    case 'view':
        if ($method !== 'GET') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        viewMessage();
        break;
        
    case 'send':
        if ($method !== 'POST') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        sendMessage();
        break;
        
    case 'mark-read':
        if ($method !== 'POST') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        markAsRead();
        break;
        
    case 'delete':
        if ($method !== 'DELETE') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        deleteMessage();
        break;
        
    case 'unread-count':
        if ($method !== 'GET') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        getUnreadCount();
        break;
        
    case 'users':
        if ($method !== 'GET') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        getUsers();
        break;
        
    default:
        jsonResponse(['error' => 'Action non trouvée'], 404);
}

function getReceivedMessages() {
    global $user;
    $db = getDB();
    
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(50, max(10, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    
    // Total
    $stmt = $db->prepare('SELECT COUNT(*) FROM messages WHERE destinataire_id = ? AND archive_destinataire = 0');
    $stmt->execute([$user['id']]);
    $total = $stmt->fetchColumn();
    
    // Messages
    $stmt = $db->prepare("
        SELECT m.*, u.nom as expediteur_nom, u.role as expediteur_role
        FROM messages m
        JOIN utilisateurs u ON m.expediteur_id = u.id
        WHERE m.destinataire_id = ? AND m.archive_destinataire = 0
        ORDER BY m.date_envoi DESC
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute([$user['id']]);
    $messages = $stmt->fetchAll();
    
    jsonResponse([
        'data' => $messages,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ],
        'unread_count' => getUnreadCountValue()
    ]);
}

function getSentMessages() {
    global $user;
    $db = getDB();
    
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = min(50, max(10, intval($_GET['limit'] ?? 20)));
    $offset = ($page - 1) * $limit;
    
    $stmt = $db->prepare("
        SELECT m.*, u.nom as destinataire_nom, u.role as destinataire_role
        FROM messages m
        JOIN utilisateurs u ON m.destinataire_id = u.id
        WHERE m.expediteur_id = ? AND m.archive_expediteur = 0
        ORDER BY m.date_envoi DESC
        LIMIT $limit OFFSET $offset
    ");
    $stmt->execute([$user['id']]);
    $messages = $stmt->fetchAll();
    
    jsonResponse(['data' => $messages]);
}

function viewMessage() {
    global $user;
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'ID requis'], 400);
    }
    
    $db = getDB();
    $stmt = $db->prepare('
        SELECT m.*, 
               exp.nom as expediteur_nom, exp.role as expediteur_role,
               dest.nom as destinataire_nom, dest.role as destinataire_role
        FROM messages m
        JOIN utilisateurs exp ON m.expediteur_id = exp.id
        JOIN utilisateurs dest ON m.destinataire_id = dest.id
        WHERE m.id = ? AND (m.expediteur_id = ? OR m.destinataire_id = ?)
    ');
    $stmt->execute([$id, $user['id'], $user['id']]);
    $message = $stmt->fetch();
    
    if (!$message) {
        jsonResponse(['error' => 'Message non trouvé'], 404);
    }
    
    // Marquer comme lu si c'est le destinataire
    if ($message['destinataire_id'] == $user['id'] && !$message['lu']) {
        $stmt = $db->prepare('UPDATE messages SET lu = 1, date_lecture = NOW() WHERE id = ?');
        $stmt->execute([$id]);
        $message['lu'] = 1;
    }
    
    // Récupérer le fil de discussion si c'est une réponse
    $thread = [];
    if ($message['reponse_a']) {
        $parentId = $message['reponse_a'];
        while ($parentId) {
            $stmt = $db->prepare('
                SELECT m.*, exp.nom as expediteur_nom
                FROM messages m
                JOIN utilisateurs exp ON m.expediteur_id = exp.id
                WHERE m.id = ?
            ');
            $stmt->execute([$parentId]);
            $parent = $stmt->fetch();
            if ($parent) {
                array_unshift($thread, $parent);
                $parentId = $parent['reponse_a'];
            } else {
                break;
            }
        }
    }
    
    $message['thread'] = $thread;
    jsonResponse($message);
}

function sendMessage() {
    global $user;
    $input = getInput();
    
    $errors = validateRequired($input, ['destinataire_id', 'sujet', 'contenu']);
    if (!empty($errors)) {
        jsonResponse(['error' => implode(', ', $errors)], 400);
    }
    
    $db = getDB();
    
    // Vérifier que le destinataire existe
    $stmt = $db->prepare('SELECT id, nom FROM utilisateurs WHERE id = ? AND actif = 1');
    $stmt->execute([$input['destinataire_id']]);
    $destinataire = $stmt->fetch();
    
    if (!$destinataire) {
        jsonResponse(['error' => 'Destinataire non trouvé'], 404);
    }
    
    // Créer le message
    $stmt = $db->prepare('
        INSERT INTO messages (expediteur_id, destinataire_id, sujet, contenu, date_envoi, urgent, reponse_a)
        VALUES (?, ?, ?, ?, NOW(), ?, ?)
    ');
    $stmt->execute([
        $user['id'],
        $input['destinataire_id'],
        $input['sujet'],
        $input['contenu'],
        $input['urgent'] ?? 0,
        $input['reponse_a'] ?? null
    ]);
    
    $messageId = $db->lastInsertId();
    
    // Créer une notification pour le destinataire
    $type = $input['urgent'] ? 'urgent' : 'info';
    $titre = $input['urgent'] ? 'Message urgent' : 'Nouveau message';
    createNotification(
        $input['destinataire_id'],
        $type,
        $titre,
        "De {$user['nom']}: {$input['sujet']}",
        "/messagerie?id=$messageId",
        'message',
        $messageId
    );
    
    logActivity($user['id'], 'send_message', 'message', $messageId);
    
    jsonResponse([
        'success' => true,
        'message' => 'Message envoyé',
        'message_id' => $messageId
    ], 201);
}

function markAsRead() {
    global $user;
    $input = getInput();
    
    if (!isset($input['id'])) {
        jsonResponse(['error' => 'ID requis'], 400);
    }
    
    $db = getDB();
    $stmt = $db->prepare('UPDATE messages SET lu = 1, date_lecture = NOW() WHERE id = ? AND destinataire_id = ?');
    $stmt->execute([$input['id'], $user['id']]);
    
    jsonResponse(['success' => true]);
}

function deleteMessage() {
    global $user;
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'ID requis'], 400);
    }
    
    $db = getDB();
    
    // Vérifier le message
    $stmt = $db->prepare('SELECT expediteur_id, destinataire_id FROM messages WHERE id = ?');
    $stmt->execute([$id]);
    $message = $stmt->fetch();
    
    if (!$message) {
        jsonResponse(['error' => 'Message non trouvé'], 404);
    }
    
    // Archiver selon le rôle
    if ($message['expediteur_id'] == $user['id']) {
        $stmt = $db->prepare('UPDATE messages SET archive_expediteur = 1 WHERE id = ?');
    } elseif ($message['destinataire_id'] == $user['id']) {
        $stmt = $db->prepare('UPDATE messages SET archive_destinataire = 1 WHERE id = ?');
    } else {
        jsonResponse(['error' => 'Non autorisé'], 403);
    }
    
    $stmt->execute([$id]);
    jsonResponse(['success' => true]);
}

function getUnreadCount() {
    jsonResponse(['count' => getUnreadCountValue()]);
}

function getUnreadCountValue() {
    global $user;
    $db = getDB();
    
    $stmt = $db->prepare('SELECT COUNT(*) FROM messages WHERE destinataire_id = ? AND lu = 0 AND archive_destinataire = 0');
    $stmt->execute([$user['id']]);
    return $stmt->fetchColumn();
}

function getUsers() {
    global $user;
    $db = getDB();
    
    $stmt = $db->prepare('SELECT id, nom, role FROM utilisateurs WHERE id != ? AND actif = 1 ORDER BY nom');
    $stmt->execute([$user['id']]);
    
    jsonResponse(['data' => $stmt->fetchAll()]);
}
