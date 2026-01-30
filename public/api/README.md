# HospiGest - Backend PHP/MySQL

## Configuration du serveur

### Prérequis
- PHP 7.4+ ou 8.x
- MySQL 5.7+ ou MariaDB
- Apache ou Nginx avec mod_rewrite

### Installation

1. Créez une base de données MySQL:
```sql
CREATE DATABASE hospigest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Importez le fichier `database.sql` dans votre base de données

3. Configurez le fichier `config.php` avec vos identifiants

4. Configurez votre serveur web pour pointer vers le dossier `api`

### Structure des fichiers API
```
api/
├── config.php          # Configuration base de données
├── index.php           # Router principal
├── auth.php            # Authentification
├── patients.php        # CRUD Patients
├── personnel.php       # CRUD Personnel
├── rendez-vous.php     # CRUD Rendez-vous
├── factures.php        # CRUD Factures
├── messages.php        # Messagerie
├── notifications.php   # Notifications temps réel
└── database.sql        # Structure BDD
```

### Endpoints API

#### Authentification
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/logout

#### Patients
- GET /api/patients
- POST /api/patients
- PUT /api/patients/{id}
- DELETE /api/patients/{id}

#### Personnel
- GET /api/personnel
- POST /api/personnel
- PUT /api/personnel/{id}
- DELETE /api/personnel/{id}

#### Rendez-vous
- GET /api/rendez-vous
- POST /api/rendez-vous
- PUT /api/rendez-vous/{id}
- DELETE /api/rendez-vous/{id}

#### Notifications (temps réel)
- GET /api/notifications (polling)
- WebSocket: ws://server/ws/notifications

### Communication temps réel

Pour les notifications en temps réel, vous pouvez utiliser:

1. **Polling** (simple): Requêtes périodiques toutes les 30 secondes
2. **Server-Sent Events (SSE)**: Connexion persistante unidirectionnelle
3. **WebSockets**: Communication bidirectionnelle complète

Exemple d'implémentation avec SSE:
```php
<?php
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');

while (true) {
    $notifications = getNewNotifications($userId);
    if ($notifications) {
        echo "data: " . json_encode($notifications) . "\n\n";
        ob_flush();
        flush();
    }
    sleep(2);
}
```

### Sécurité
- Utilisez HTTPS en production
- Validez toutes les entrées utilisateur
- Utilisez des tokens JWT pour l'authentification
- Hashage des mots de passe avec password_hash()
