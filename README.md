# MusicEmotion — Étude de perception émotionnelle

Application web d'annotation permettant de collecter le ressenti émotionnel
de participants écoutant des extraits de **musique andalouse marocaine**.

Chaque participant renseigne un court profil, écoute les extraits un par un,
puis répond à 7 questions par extrait (valence, activation, émotion,
nostalgie culturelle, moment de la journée, mîzân, élément sonore).

- **Frontend** : React 19 + Vite
- **Backend** : Flask + SQLite
- **Déploiement** : Docker Compose

---

## Démarrage rapide (Docker)

```bash
# Le jeton protège le téléchargement des données collectées.
export ADMIN_TOKEN="choisissez-un-jeton-secret"

docker compose up --build
```

| Service  | URL                     |
| -------- | ----------------------- |
| Frontend | http://localhost:5173   |
| Backend  | http://localhost:5000   |

Pour arrêter : `docker compose down`

---

## Démarrage sans Docker

**Backend**

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
ADMIN_TOKEN="choisissez-un-jeton-secret" python app.py
```

**Frontend** (dans un second terminal)

```bash
cd frontend
npm install
npm run dev
```

---

## Ajouter des extraits musicaux

Déposez vos fichiers `.wav` dans **`backend/audio/`**, puis rechargez la page.

Les extraits sont numérotés selon l'ordre alphabétique des noms de fichiers.
Nommer les fichiers `andalusian.00000.wav`, `andalusian.00001.wav`, etc.
garantit donc un ordre de présentation stable.

> Les fichiers audio sont servis par l'API (`/api/audio/<fichier>`),
> et non par le frontend : c'est le dossier `backend/audio/` qui fait foi.

---

## Consulter les réponses (espace chercheur)

Une page protégée par mot de passe permet de suivre la collecte sans
passer par le terminal :

```
http://localhost:5173/#admin
```

Le mot de passe demandé est la valeur de `ADMIN_TOKEN`. La page affiche le
nombre de participants et de réponses, le tableau des annotations, et
propose le téléchargement des CSV.

Le mot de passe n'est jamais enregistré dans le navigateur : il reste en
mémoire le temps de la consultation, et il faut le ressaisir après un
rechargement de page.

---

## Récupérer les données en ligne de commande

Les exports demandent le jeton défini par `ADMIN_TOKEN`, en paramètre
d'URL ou via l'en-tête `X-Admin-Token` :

```bash
# Table prête pour l'analyse : réponses + profil du participant
curl -o annotations.csv \
  "http://localhost:5000/api/export/annotations.csv?token=$ADMIN_TOKEN"

# Participants uniquement
curl -o participants.csv \
  "http://localhost:5000/api/export/participants.csv?token=$ADMIN_TOKEN"

# Avancement de la collecte
curl "http://localhost:5000/api/stats?token=$ADMIN_TOKEN"
```

Les CSV sont encodés en UTF-8 avec BOM : les accents s'affichent
correctement à l'ouverture dans Excel.

---

## API

| Méthode | Route                          | Rôle                                    |
| ------- | ------------------------------ | --------------------------------------- |
| GET     | `/`                            | Vérifier que le serveur répond          |
| GET     | `/api/audios`                  | Liste des extraits disponibles          |
| GET     | `/api/audio/<fichier>`         | Lire un extrait                         |
| POST    | `/api/participants`            | Créer un participant, renvoie son ID    |
| POST    | `/api/annotations`             | Enregistrer une réponse                 |
| GET     | `/api/annotations`             | Réponses en JSON *(jeton requis)*       |
| GET     | `/api/stats`                   | Statistiques *(jeton requis)*           |
| GET     | `/api/export/annotations.csv`  | Export des réponses *(jeton requis)*    |
| GET     | `/api/export/participants.csv` | Export des profils *(jeton requis)*     |

Un participant qui renvoie deux fois le même extrait **met à jour** sa réponse
au lieu d'en créer une seconde : les doublons sont impossibles.

---

## Données

Base SQLite : `backend/database.db`, versionnée dans le dépôt et créée
automatiquement si elle est absente.

> Les réponses des participants sont donc suivies par Git : pensez à
> committer la base après une session de collecte pour ne rien perdre.

**participants** — `participant_id`, `age`, `gender`, `music_familiarity`,
`cultural_familiarity`

**annotations** — `participant_id`, `audio_id`, `audio_number`, `valence` (1–9),
`arousal` (1–9), `emotion`, `cultural_nostalgia`, `preferred_time`,
`tempo_mizan`, `attention_element`, `created_at`

Aucune donnée directement identifiante n'est collectée : les participants sont
désignés par un identifiant généré (`PXXXXXXXX`).

---

## Variables d'environnement

| Variable            | Défaut                  | Rôle                                        |
| ------------------- | ----------------------- | ------------------------------------------- |
| `ADMIN_TOKEN`       | *(vide)*                | Mot de passe de l'espace chercheur et des exports. Vide = consultation désactivée |
| `PORT`              | `5000`                  | Port du backend                             |
| `DATABASE_PATH`     | `backend/database.db`   | Emplacement de la base                      |
| `AUDIO_FOLDER`      | `backend/audio`         | Dossier des extraits                        |
| `VITE_BACKEND_URL`  | `http://localhost:5000` | URL du backend appelée par le navigateur    |

> `VITE_BACKEND_URL` est lue **par le navigateur du participant**. En
> déploiement, utilisez l'adresse publique du backend — jamais le nom de
> service Docker (`http://backend:5000`), que le navigateur ne peut pas résoudre.

---

## Mise en ligne

Le backend tourne ici avec le serveur de développement de Flask, suffisant
pour une collecte en local ou en salle. Pour une étude ouverte sur Internet,
servez-le derrière un serveur WSGI (`gunicorn`) et en HTTPS.
