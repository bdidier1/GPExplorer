# SAE_S3-S4

Système de gestion événementielle pour le GP Explorer - Projet SAE S3-S4 BUT Informatique

### Membres:
- LAFAY Mehdi
- DIDIER Baptiste
- LORENZINI Thomas
- DUARTE Antoine
- BELEY Gauthier

## 🚀 Installation et lancement

### Prérequis
- Node.js version 20.19.0+ ou 22.12.0+ ([télécharger ici](https://nodejs.org/))
- npm (inclus avec Node.js)

### Installation
Depuis la racine du dépôt, installez toutes les dépendances :
```bash
cd SAE_S3-S4
npm run install:all
```

## 🗄️ Base de données (si vous récupérez l'archive)

Le backend utilise PostgreSQL.

### Option A (recommandée) : démarrage rapide avec Docker

1. Démarrer PostgreSQL en une commande :
```bash
docker run --name gp-explorer-db -e POSTGRES_DB=gp_explorer -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:16
```
2. Copier le fichier d'environnement (depuis `SAE_S3-S4/`) :
```bash
cd SAE_S3-S4
cp api/config/.env.example api/config/.env
```
3. Initialiser la base avec les données du projet (depuis `SAE_S3-S4/api/`) :
```bash
cd SAE_S3-S4/api
npm run seed
```

### Option B : PostgreSQL local (sans Docker)

1. Installer PostgreSQL et créer une base `gp_explorer`.
2. Copier `api/config/.env.example` vers `api/config/.env`.
3. Adapter les variables `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` dans `api/config/.env`.
4. Exécuter la seed (depuis `SAE_S3-S4/api/`) :
```bash
cd SAE_S3-S4/api
npm run seed
```

### Important

- La commande `npm run seed` recrée entièrement la base (reset total des données).
- Si vous voulez conserver des données existantes, ne lancez pas la seed.

### Lancement du site

Ordre recommandé de lancement: **seed**, puis **front**, puis **back**.

#### 1) Lancer la seed API
```bash
cd SAE_S3-S4/api
npm run seed
```

#### 2) Lancer le frontend
```bash
cd SAE_S3-S4/client
npm run dev
```

Le frontend est généralement disponible sur [http://localhost:5173](http://localhost:5173). Si le port est déjà utilisé, Vite passe automatiquement au port suivant.

#### 3) Lancer le backend
```bash
cd SAE_S3-S4/api
npm run dev
```

L'API (avec swagger) est disponible sur [http://localhost:3001](http://localhost:3001).

## 🔑 Comptes de test

Pour tester les différents rôles de l'application :

| Rôle | Identifiant | Mot de passe |
| :--- | :--- | :--- |
| **Administrateur** | `admin` | `admin2024` |
| **Prestataire (Playseat)** | `playseat` | `playseat2024` |
| **Utilisateur** | `user` | `user123` |

## 🏗️ Structure du projet

- **`/api`** - Backend Node.js / Express
- **`/client`** - Frontend Vue.js 3
- **`/rapports`** - Documentation et rapports LaTeX

## 🛠️ Technologies utilisées

- **Backend**: Node.js, Express, Sequelize, SQLite/PostgreSQL
- **Frontend**: Vue.js 3, Vite, Pinia, Vue Router
- **Documentation**: LaTeX
