# Système de Gestion des Congés - CHU Fès

## Installation
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
Créer une base de données MySQL :
```
gestion_conges_db
```
---
### 2. Configuration du fichier `.env`
Dans le dossier backend :
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gestion_conges
DB_USERNAME=root
DB_PASSWORD=
```
---
### 3. Initialisation du projet
```bash
php artisan key:generate
php artisan migrate --seed
```
---
## Comptes de test
### Administrateur
```
email: admin@test.com
password: password
```
### Manager
```
email: ena.oconner@example.net
password: password
```
### Employé
```
email: kiarra.kohler@example.com
password: password
```
---
## Lancement
### Backend (Laravel API)
```bash
php artisan serve
```
Accès : http://127.0.0.1:8000
---
### Frontend (React)
```bash
npm run dev
```
Accès : http://localhost:5173