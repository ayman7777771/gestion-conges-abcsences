Plateforme complète de gestion des demandes de congés avec système de validation hiérarchique et gestion des soldes.
---

## Installation

### Prérequis
- PHP >= 8.1
- Node.js >= 16 (for React + Vite)
- MySQL 5.7+
- Composer

### Backend (Laravel)

```bash
cd gestion-conges-backEnd
composer install
```

### Frontend (React + Vite)
```bash
cd gestion-conges-frontend
npm install
```

---

## Configuration

### 1. Création de la base de données
```sql
CREATE DATABASE gestion_conges_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Configuration du fichier `.env` (Backend)
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_conges_db
DB_USERNAME=root
DB_PASSWORD=

API_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173

```

### 3. Initialisation du projet
```bash
cd gestion-conges-backEnd
php artisan key:generate
php artisan migrate --seed
php artisan cache:clear
php artisan config:cache
```

### Comptes de test
```
Admin:
  Email: admin@test.com
  Password: password

Manager:
  Email: ena.oconner@example.net
  Password: password

Employee:
  Email: kiarra.kohler@example.com
  Password: password
```
---

## ▶ Lancement

### Backend (Laravel API)
```bash
cd gestion-conges-backEnd
php artisan serve
```
Accès : `http://127.0.0.1:8000`

### Frontend (React)
```bash
cd gestion-conges-frontend
npm run dev
```
Accès : `http://localhost:5173`

---

## Note Importante
- Les demandes de congé des Managers et Admin sont approuvées automatiquement pour déduire les soldes directement.