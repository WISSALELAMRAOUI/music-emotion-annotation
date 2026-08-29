from flask import Flask, jsonify, request, send_from_directory, Response
from flask_cors import CORS
import sqlite3
import os
import io
import csv
import hmac
import uuid



# CONFIGURATION


app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PORT = int(os.environ.get("PORT", "5000"))

DATABASE = os.environ.get("DATABASE_PATH") or os.path.join(BASE_DIR, "database.db")
AUDIO_FOLDER = os.environ.get("AUDIO_FOLDER") or os.path.join(BASE_DIR, "audio")
os.makedirs(AUDIO_FOLDER, exist_ok=True)

# Jeton protégeant l'export des données.
# Sans jeton configuré, l'export est désactivé.
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "")

# Échelles valence / arousal : 1 à 9
SCALE_MIN = 1
SCALE_MAX = 9



# CONNEXION BASE DE DONNÉES


def get_connection():

    connection = sqlite3.connect(DATABASE)

    connection.row_factory = sqlite3.Row

    connection.execute("PRAGMA foreign_keys = ON")

    return connection



# INITIALISATION DE LA BASE DE DONNÉES


def init_database():

    connection = get_connection()

    cursor = connection.cursor()


    # TABLE PARTICIPANTS

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            participant_id TEXT UNIQUE NOT NULL,
            age INTEGER NOT NULL,
            gender TEXT NOT NULL,
            music_familiarity TEXT NOT NULL,
            cultural_familiarity TEXT NOT NULL
        )
    """)


    # TABLE ANNOTATIONS

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS annotations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            participant_id TEXT NOT NULL,

            audio_id TEXT NOT NULL,
            audio_number INTEGER NOT NULL,

            valence INTEGER NOT NULL,
            arousal INTEGER NOT NULL,

            emotion TEXT NOT NULL,
            cultural_nostalgia TEXT NOT NULL,
            preferred_time TEXT NOT NULL,
            tempo_mizan TEXT NOT NULL,
            attention_element TEXT NOT NULL,

            FOREIGN KEY (participant_id)
                REFERENCES participants(participant_id)
        )
    """)


    # Colonne ajoutée après coup : date de l'annotation.
    # ALTER TABLE échoue si la colonne existe déjà.

    existing_columns = [
        row["name"]
        for row in cursor.execute("PRAGMA table_info(annotations)")
    ]

    if "created_at" not in existing_columns:

        cursor.execute("""
            ALTER TABLE annotations
            ADD COLUMN created_at TEXT
        """)


    # Un participant n'annote chaque extrait qu'une seule fois.
    # Une réponse renvoyée deux fois met à jour la précédente.

    cursor.execute("""
        CREATE UNIQUE INDEX IF NOT EXISTS
            idx_annotation_unique
        ON annotations (participant_id, audio_id)
    """)


    connection.commit()
    connection.close()


init_database()



# ROUTE TEST


@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "MusicEmotion Backend fonctionne !",
        "audios": len(list_audio_files()),
        "export": "/api/export/annotations.csv"
    })



# API : LISTE DES AUDIOS


def list_audio_files():
    """
    Retourne les extraits présents dans le dossier audio.

    Le numéro affiché suit l'ordre alphabétique des fichiers,
    ce qui fonctionne quel que soit leur nom.
    """

    if not os.path.isdir(AUDIO_FOLDER):
        return []


    files = []

    wav_files = sorted(
        filename
        for filename in os.listdir(AUDIO_FOLDER)
        if filename.lower().endswith(".wav")
    )


    for position, filename in enumerate(wav_files, start=1):

        name_without_extension = os.path.splitext(filename)[0]

        files.append({
            "id": name_without_extension,
            "file": filename,
            "number": position,
            "url": f"/api/audio/{filename}"
        })


    return files


@app.route("/api/audios", methods=["GET"])
def get_audios():

    if not os.path.isdir(AUDIO_FOLDER):

        return jsonify({
            "error": "Le dossier audio n'existe pas."
        }), 404


    return jsonify(list_audio_files())



# API : SERVIR UN AUDIO


@app.route("/api/audio/<path:filename>", methods=["GET"])
def get_audio(filename):

    return send_from_directory(
        AUDIO_FOLDER,
        filename
    )



# API : CRÉER UN PARTICIPANT


@app.route("/api/participants", methods=["POST"])
def create_participant():

    data = request.get_json(silent=True)

    if not data:

        return jsonify({
            "error": "Aucune donnée reçue."
        }), 400



    # Vérification des champs

    required_fields = [
        "age",
        "gender",
        "music_familiarity",
        "cultural_familiarity"
    ]

    for field in required_fields:

        if field not in data or data[field] == "":

            return jsonify({
                "error": f"Le champ '{field}' est obligatoire."
            }), 400



    # Vérification de l'âge

    try:
        age = int(data["age"])
    except (TypeError, ValueError):

        return jsonify({
            "error": "L'âge doit être un nombre."
        }), 400


    if age < 1 or age > 120:

        return jsonify({
            "error": "L'âge doit être compris entre 1 et 120."
        }), 400



    # Génération ID participant

    participant_id = "P" + str(uuid.uuid4())[:8].upper()



    # Enregistrement

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO participants (
            participant_id,
            age,
            gender,
            music_familiarity,
            cultural_familiarity
        )
        VALUES (?, ?, ?, ?, ?)
    """, (
        participant_id,
        age,
        data["gender"],
        data["music_familiarity"],
        data["cultural_familiarity"]
    ))

    connection.commit()
    connection.close()


    return jsonify({
        "message": "Participant enregistré.",
        "participant_id": participant_id
    }), 201



# API : ENREGISTRER UNE ANNOTATION


@app.route("/api/annotations", methods=["POST"])
def create_annotation():

    data = request.get_json(silent=True)

    if not data:

        return jsonify({
            "error": "Aucune donnée reçue."
        }), 400


    required_fields = [
        "participant_id",
        "audio_id",
        "audio_number",
        "valence",
        "arousal",
        "emotion",
        "cultural_nostalgia",
        "preferred_time",
        "tempo_mizan",
        "attention_element"
    ]



    # Vérification

    for field in required_fields:

        if field not in data or data[field] in ("", None):

            return jsonify({
                "error": f"Le champ '{field}' est obligatoire."
            }), 400



    # Vérification des échelles

    try:
        valence = int(data["valence"])
        arousal = int(data["arousal"])
        audio_number = int(data["audio_number"])
    except (TypeError, ValueError):

        return jsonify({
            "error": "Valence, arousal et numéro d'extrait doivent être des nombres."
        }), 400


    for name, value in (("valence", valence), ("arousal", arousal)):

        if value < SCALE_MIN or value > SCALE_MAX:

            return jsonify({
                "error": f"Le champ '{name}' doit être compris entre {SCALE_MIN} et {SCALE_MAX}."
            }), 400



    # Connexion DB

    connection = get_connection()

    cursor = connection.cursor()



    # Vérifier participant

    cursor.execute("""
        SELECT participant_id
        FROM participants
        WHERE participant_id = ?
    """, (data["participant_id"],))

    participant = cursor.fetchone()


    if participant is None:

        connection.close()

        return jsonify({
            "error": "Participant introuvable."
        }), 404



    # Enregistrer l'annotation.
    # Si le participant renvoie le même extrait, sa réponse
    # remplace la précédente au lieu d'être dupliquée.

    cursor.execute("""
        INSERT INTO annotations (
            participant_id,
            audio_id,
            audio_number,
            valence,
            arousal,
            emotion,
            cultural_nostalgia,
            preferred_time,
            tempo_mizan,
            attention_element,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))

        ON CONFLICT (participant_id, audio_id)
        DO UPDATE SET
            audio_number      = excluded.audio_number,
            valence           = excluded.valence,
            arousal           = excluded.arousal,
            emotion           = excluded.emotion,
            cultural_nostalgia = excluded.cultural_nostalgia,
            preferred_time    = excluded.preferred_time,
            tempo_mizan       = excluded.tempo_mizan,
            attention_element = excluded.attention_element,
            created_at        = datetime('now')
    """, (
        data["participant_id"],
        data["audio_id"],
        audio_number,
        valence,
        arousal,
        data["emotion"],
        data["cultural_nostalgia"],
        data["preferred_time"],
        data["tempo_mizan"],
        data["attention_element"]
    ))


    connection.commit()

    cursor.execute("""
        SELECT id
        FROM annotations
        WHERE participant_id = ?
          AND audio_id = ?
    """, (data["participant_id"], data["audio_id"]))

    annotation_id = cursor.fetchone()["id"]

    connection.close()


    return jsonify({
        "message": "Annotation enregistrée.",
        "annotation_id": annotation_id
    }), 201



# ACCÈS ADMINISTRATEUR


def check_admin():
    """
    Renvoie None si l'accès est autorisé,
    sinon une réponse d'erreur.
    """

    if not ADMIN_TOKEN:

        return jsonify({
            "error": "Export désactivé : définissez la variable "
                     "d'environnement ADMIN_TOKEN sur le serveur."
        }), 503


    provided = (
        request.headers.get("X-Admin-Token")
        or request.args.get("token", "")
    )

    if not hmac.compare_digest(provided, ADMIN_TOKEN):

        return jsonify({
            "error": "Jeton d'administration invalide."
        }), 403


    return None



# API : STATISTIQUES


@app.route("/api/stats", methods=["GET"])
def get_stats():

    denied = check_admin()

    if denied is not None:
        return denied


    connection = get_connection()

    participants = connection.execute(
        "SELECT COUNT(*) AS total FROM participants"
    ).fetchone()["total"]

    annotations = connection.execute(
        "SELECT COUNT(*) AS total FROM annotations"
    ).fetchone()["total"]

    completed = connection.execute("""
        SELECT COUNT(*) AS total
        FROM (
            SELECT participant_id
            FROM annotations
            GROUP BY participant_id
            HAVING COUNT(*) >= ?
        )
    """, (max(len(list_audio_files()), 1),)).fetchone()["total"]

    connection.close()


    return jsonify({
        "participants": participants,
        "annotations": annotations,
        "participants_ayant_termine": completed,
        "extraits": len(list_audio_files())
    })



# API : EXPORT CSV


def build_csv(rows, columns):

    buffer = io.StringIO()

    writer = csv.writer(buffer)

    writer.writerow(columns)

    for row in rows:
        writer.writerow([row[column] for column in columns])


    # BOM UTF-8 : les accents s'affichent correctement dans Excel.
    return "﻿" + buffer.getvalue()


@app.route("/api/export/annotations.csv", methods=["GET"])
def export_annotations():

    denied = check_admin()

    if denied is not None:
        return denied


    connection = get_connection()

    rows = connection.execute("""
        SELECT
            a.id                    AS annotation_id,
            a.participant_id        AS participant_id,
            p.age                   AS age,
            p.gender                AS gender,
            p.music_familiarity     AS music_familiarity,
            p.cultural_familiarity  AS cultural_familiarity,
            a.audio_id              AS audio_id,
            a.audio_number          AS audio_number,
            a.valence               AS valence,
            a.arousal               AS arousal,
            a.emotion               AS emotion,
            a.cultural_nostalgia    AS cultural_nostalgia,
            a.preferred_time        AS preferred_time,
            a.tempo_mizan           AS tempo_mizan,
            a.attention_element     AS attention_element,
            a.created_at            AS created_at
        FROM annotations a
        LEFT JOIN participants p
            ON p.participant_id = a.participant_id
        ORDER BY a.participant_id, a.audio_number
    """).fetchall()

    connection.close()


    columns = [
        "annotation_id",
        "participant_id",
        "age",
        "gender",
        "music_familiarity",
        "cultural_familiarity",
        "audio_id",
        "audio_number",
        "valence",
        "arousal",
        "emotion",
        "cultural_nostalgia",
        "preferred_time",
        "tempo_mizan",
        "attention_element",
        "created_at"
    ]


    return Response(
        build_csv(rows, columns),
        mimetype="text/csv; charset=utf-8",
        headers={
            "Content-Disposition":
                "attachment; filename=annotations.csv"
        }
    )


@app.route("/api/export/participants.csv", methods=["GET"])
def export_participants():

    denied = check_admin()

    if denied is not None:
        return denied


    connection = get_connection()

    rows = connection.execute("""
        SELECT
            participant_id,
            age,
            gender,
            music_familiarity,
            cultural_familiarity
        FROM participants
        ORDER BY id
    """).fetchall()

    connection.close()


    columns = [
        "participant_id",
        "age",
        "gender",
        "music_familiarity",
        "cultural_familiarity"
    ]


    return Response(
        build_csv(rows, columns),
        mimetype="text/csv; charset=utf-8",
        headers={
            "Content-Disposition":
                "attachment; filename=participants.csv"
        }
    )



# GESTION DES ERREURS


@app.errorhandler(404)
def not_found(error):

    return jsonify({
        "error": "Ressource introuvable."
    }), 404


@app.errorhandler(500)
def server_error(error):

    return jsonify({
        "error": "Erreur interne du serveur."
    }), 500



# LANCEMENT DU SERVEUR


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=PORT,
        debug=False
    )
