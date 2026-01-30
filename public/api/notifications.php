<?php
/**
 * HospiGest - API Notifications (temps réel)
 */
require_once 'config.php';

$user = requireAuth();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'list';

switch ($action) {
    case 'list':
        if ($method !== 'GET') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        getNotifications();
        break;
        
    case 'unread-count':
        if ($method !== 'GET') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        getUnreadCount();
        break;
        
    case 'mark-read':
        if ($method !== 'POST') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        markAsRead();
        break;
        
    case 'mark-all-read':
        if ($method !== 'POST') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        markAllAsRead();
        break;
        
    case 'delete':
        if ($method !== 'DELETE') jsonResponse(['error' => 'Méthode non autorisée'], 405);
        deleteNotification();
        break;
        
    case 'stream':
        // Server-Sent Events pour temps réel
        streamNotifications();
        break;
        
    default:
        jsonResponse(['error' => 'Action non trouvée'], 404);
}

function getNotifications() {
    global $user;
    $db = getDB();
    
    $limit = min(50, max(10, intval($_GET['limit'] ?? 20)));
    $unreadOnly = isset($_GET['unread_only']) && $_GET['unread_only'] === 'true';
    
    $where = 'utilisateur_id = ?';
    $params = [$user['id']];
    
    if ($unreadOnly) {
        $where .= ' AND lu = 0';
    }
    
    $stmt = $db->prepare("
        SELECT * FROM notifications 
        WHERE $where
        ORDER BY created_at DESC
        LIMIT $limit
    ");
    $stmt->execute($params);
    $notifications = $stmt->fetchAll();
    
    jsonResponse([
        'data' => $notifications,
        'unread_count' => getUnreadCountValue()
    ]);
}

function getUnreadCount() {
    jsonResponse(['count' => getUnreadCountValue()]);
}

function getUnreadCountValue() {
    global $user;
    $db = getDB();
    
    $stmt = $db->prepare('SELECT COUNT(*) FROM notifications WHERE utilisateur_id = ? AND lu = 0');
    $stmt->execute([$user['id']]);
    return $stmt->fetchColumn();
}

function markAsRead() {
    global $user;
    $input = getInput();
    
    if (!isset($input['id'])) {
        jsonResponse(['error' => 'ID requis'], 400);
    }
    
    $db = getDB();
    $stmt = $db->prepare('UPDATE notifications SET lu = 1, date_lecture = NOW() WHERE id = ? AND utilisateur_id = ?');
    $stmt->execute([$input['id'], $user['id']]);
    
    jsonResponse(['success' => true]);
}

function markAllAsRead() {
    global $user;
    $db = getDB();
    
    $stmt = $db->prepare('UPDATE notifications SET lu = 1, date_lecture = NOW() WHERE utilisateur_id = ? AND lu = 0');
    $stmt->execute([$user['id']]);
    
    jsonResponse(['success' => true, 'updated' => $stmt->rowCount()]);
}

function deleteNotification() {
    global $user;
    $id = $_GET['id'] ?? null;
    
    if (!$id) {
        jsonResponse(['error' => 'ID requis'], 400);
    }
    
    $db = getDB();
    $stmt = $db->prepare('DELETE FROM notifications WHERE id = ? AND utilisateur_id = ?');
    $stmt->execute([$id, $user['id']]);
    
    jsonResponse(['success' => true]);
}

/**
 * Server-Sent Events pour les notifications en temps réel
 * Usage: EventSource('/api/notifications.php?action=stream')
 */
function streamNotifications() {
    global $user;
    
    // Désactiver le buffering
    @ini_set('output_buffering', 'off');
    @ini_set('zlib.output_compression', false);
    
    // Headers SSE
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no'); // Pour nginx
    
    $db = getDB();
    $lastId = 0;
    $maxTime = 30; // Timeout après 30 secondes
    $startTime = time();
    
    // Garder la connexion ouverte
    while (true) {
        // Vérifier le timeout
        if (time() - $startTime > $maxTime) {
            echo "event: timeout\n";
            echo "data: {\"message\": \"reconnect\"}\n\n";
            break;
        }
        
        // Vérifier les nouvelles notifications
        $stmt = $db->prepare('
            SELECT * FROM notifications 
            WHERE utilisateur_id = ? AND id > ?
            ORDER BY created_at DESC
            LIMIT 10
        ');
        $stmt->execute([$user['id'], $lastId]);
        $notifications = $stmt->fetchAll();
        
        if (!empty($notifications)) {
            foreach ($notifications as $notif) {
                echo "event: notification\n";
                echo "data: " . json_encode($notif) . "\n\n";
                
                if ($notif['id'] > $lastId) {
                    $lastId = $notif['id'];
                }
            }
        }
        
        // Envoyer un heartbeat
        echo "event: heartbeat\n";
        echo "data: " . json_encode(['time' => time(), 'unread' => getUnreadCountValue()]) . "\n\n";
        
        // Flush le buffer
        if (ob_get_level() > 0) {
            ob_flush();
        }
        flush();
        
        // Attendre 2 secondes
        sleep(2);
        
        // Vérifier si le client est toujours connecté
        if (connection_aborted()) {
            break;
        }
    }
}
