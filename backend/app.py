from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import uuid



# CONFIGURATION


app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

DATABASE = os.path.join(BASE_DIR, "database.db")
AUDIO_FOLDER = os.path.join(BASE_DIR, "audio")



# INITIALISATION DE LA BASE DE DONNÉES


def init_database():

    connection = sqlite3.connect(DATABASE)

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

    connection.commit()
    connection.close()



# ROUTE TEST


@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "MusicEmotion Backend fonctionne !"
    })



# API : LISTE DES AUDIOS


@app.route("/api/audios", methods=["GET"])
def get_audios():

    if not os.path.exists(AUDIO_FOLDER):

        return jsonify({
            "error": "Le dossier audio n'existe pas."
        }), 404


    files = []

    for filename in sorted(os.listdir(AUDIO_FOLDER)):

        if filename.lower().endswith(".wav"):

            name_without_extension = os.path.splitext(filename)[0]

            # Exemple :
            # andalusian.00000
            parts = name_without_extension.split(".")

            try:
                number = int(parts[-1]) + 1
            except ValueError:
                continue

            files.append({
                "id": name_without_extension,
                "file": filename,
                "number": number,
                "url": f"/api/audio/{filename}"
            })


    return jsonify(files)



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

    data = request.get_json()

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


    
    # Génération ID participant
   

    participant_id = "P" + str(uuid.uuid4())[:8].upper()


    
    # Enregistrement
    

    connection = sqlite3.connect(DATABASE)

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
        int(data["age"]),
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

    data = request.get_json()

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

        if field not in data:

            return jsonify({
                "error": f"Le champ '{field}' est obligatoire."
            }), 400


    # Connexion DB
    

    connection = sqlite3.connect(DATABASE)

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


    
    # Enregistrer annotation
    

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
            attention_element
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data["participant_id"],
        data["audio_id"],
        int(data["audio_number"]),
        int(data["valence"]),
        int(data["arousal"]),
        data["emotion"],
        data["cultural_nostalgia"],
        data["preferred_time"],
        data["tempo_mizan"],
        data["attention_element"]
    ))


    connection.commit()

    annotation_id = cursor.lastrowid

    connection.close()


    return jsonify({
        "message": "Annotation enregistrée.",
        "annotation_id": annotation_id
    }), 201



# LANCEMENT DU SERVEUR


if __name__ == "__main__":

    init_database()

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )