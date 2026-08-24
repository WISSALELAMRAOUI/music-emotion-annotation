import { useState } from "react";
import "./App.css";

/* =========================================================
   CONFIGURATION DES AUDIOS
   ========================================================= */

const AUDIO_FILES = Array.from({ length: 100 }, (_, index) => {
  const number = String(index).padStart(5, "0");

  return {
    id: `andalusian.${number}`,
    file: `/audio/andalusian.${number}.wav`,
    number: index + 1,
  };
});


/* =========================================================
   APP
   ========================================================= */

function App() {

  /* -------------------------------------------------------
     NAVIGATION
  ------------------------------------------------------- */

  const [page, setPage] = useState("welcome");

  /* -------------------------------------------------------
     INFORMATIONS PARTICIPANT
  ------------------------------------------------------- */

  const [participant, setParticipant] = useState({
    age: "",
    gender: "",
    musicFamiliarity: "",
    culturalFamiliarity: "",
  });


  /* -------------------------------------------------------
     AUDIO ACTUEL
  ------------------------------------------------------- */

  const [currentAudio, setCurrentAudio] = useState(0);


  /* -------------------------------------------------------
     ANNOTATION
  ------------------------------------------------------- */

  const [annotation, setAnnotation] = useState({
    valence: null,
    arousal: null,
    emotion: "",
    nostalgia: "",
    moment: "",
    tempo: "",
    attention: "",
  });


  /* -------------------------------------------------------
     RESULTATS
  ------------------------------------------------------- */

  const [annotations, setAnnotations] = useState([]);


  /* =======================================================
     FONCTIONS
  ======================================================= */

  const updateParticipant = (field, value) => {
    setParticipant((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  const updateAnnotation = (field, value) => {
    setAnnotation((previous) => ({
      ...previous,
      [field]: value,
    }));
  };


  const isParticipantComplete =
    participant.age !== "" &&
    participant.gender !== "" &&
    participant.musicFamiliarity !== "" &&
    participant.culturalFamiliarity !== "";


  const isAnnotationComplete =
    annotation.valence !== null &&
    annotation.arousal !== null &&
    annotation.emotion !== "" &&
    annotation.nostalgia !== "" &&
    annotation.moment !== "" &&
    annotation.tempo !== "" &&
    annotation.attention !== "";


  /* -------------------------------------------------------
     VALIDATION D'UNE ANNOTATION
  ------------------------------------------------------- */

  const validateAnnotation = () => {

    if (!isAnnotationComplete) {
      return;
    }

    const audio = AUDIO_FILES[currentAudio];

    const result = {
      participant_id: "P001",

      /* Informations participant */
      age: Number(participant.age),
      gender: participant.gender,
      music_familiarity: participant.musicFamiliarity,
      cultural_familiarity: participant.culturalFamiliarity,

      /* Identification de l'extrait */
      audio_id: audio.id,
      audio_number: audio.number,

      /* Variables émotionnelles */
      valence: annotation.valence,
      arousal: annotation.arousal,

      /* Autres annotations */
      emotion: annotation.emotion,
      cultural_nostalgia: annotation.nostalgia,
      preferred_time: annotation.moment,
      tempo_mizan: annotation.tempo,
      attention_element: annotation.attention,
    };


    /* Ajouter l'annotation au dataset local */

    setAnnotations((previous) => [
      ...previous,
      result,
    ]);


    console.log("ANNOTATION ENREGISTRÉE :", result);


    /* ---------------------------------------------------
       AUDIO SUIVANT
    --------------------------------------------------- */

    if (currentAudio < AUDIO_FILES.length - 1) {

      setCurrentAudio((previous) => previous + 1);

      /* Réinitialiser uniquement les réponses de l'audio */

      setAnnotation({
        valence: null,
        arousal: null,
        emotion: "",
        nostalgia: "",
        moment: "",
        tempo: "",
        attention: "",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } else {

      /* Tous les audios sont terminés */

      setPage("finished");
    }
  };


  /* =======================================================
     PAGE ACCUEIL
  ======================================================= */

  if (page === "welcome") {

    return (
      <div className="app">

        {/* HEADER */}

        <header className="header">

          <div className="logo">

            <div className="logo-icon">
              ♫
            </div>

            <div>

              <div className="logo-title">
                MusicEmotion
              </div>

              <div className="logo-subtitle">
                Étude de perception musicale
              </div>

            </div>

          </div>


          <div className="research-badge">
            Étude de recherche
          </div>

        </header>


        {/* HERO */}

        <main className="hero">

          <div className="hero-content">

            <div className="small-label">

              <span></span>

              ÉTUDE SUR LA PERCEPTION ÉMOTIONNELLE

            </div>


            <h1>

              Explorez vos émotions

              <br />

              <span>
                à travers la musique
              </span>

            </h1>


            <p className="hero-description">

              Nous vous invitons à découvrir plusieurs extraits
              de musique andalouse marocaine et à partager votre
              ressenti émotionnel après chaque écoute.

            </p>


            <div className="hero-actions">

              <button
                className="primary-button"
                onClick={() => setPage("participant")}
              >

                Commencer l'étude

                <span>
                  →
                </span>

              </button>


              <div className="duration">

                <span className="clock-icon">
                  ◷
                </span>

                Environ 20–30 minutes

              </div>

            </div>

          </div>


          {/* VISUAL */}

          <div className="music-visual">

            <div className="circle circle-1"></div>

            <div className="circle circle-2"></div>

            <div className="circle circle-3"></div>


            <div className="music-card">

              <div className="music-card-top">

                <span>
                  ♪
                </span>

                <span className="music-status">
                  MUSIC
                </span>

              </div>


              <div className="waveform">

                {[...Array(15)].map((_, index) => (
                  <i key={index}></i>
                ))}

              </div>


              <div className="music-time">

                <span>
                  00:00
                </span>

                <span>
                  00:30
                </span>

              </div>


              <div className="play-button">
                ▶
              </div>

            </div>

          </div>

        </main>


        {/* FEATURES */}

        <section className="features">

          <div className="feature-card">

            <div className="feature-icon">
              🎧
            </div>

            <div>

              <h3>
                Écoutez
              </h3>

              <p>
                Écoutez attentivement chaque extrait musical
                de 30 secondes.
              </p>

            </div>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              💭
            </div>

            <div>

              <h3>
                Ressentez
              </h3>

              <p>
                Indiquez les émotions et sensations que
                la musique provoque chez vous.
              </p>

            </div>

          </div>


          <div className="feature-card">

            <div className="feature-icon">
              📊
            </div>

            <div>

              <h3>
                Participez
              </h3>

              <p>
                Vos réponses contribueront à notre étude
                sur les émotions musicales.
              </p>

            </div>

          </div>

        </section>


        <footer className="footer">

          Vos réponses sont utilisées uniquement
          à des fins de recherche.

        </footer>

      </div>
    );
  }


  /* =======================================================
     PAGE INFORMATIONS PARTICIPANT
  ======================================================= */

  if (page === "participant") {

    return (

      <div className="app">

        <main className="participant-page">

          <div className="step-indicator">

            <span className="step active">
              1
            </span>

            <span className="line"></span>

            <span className="step">
              2
            </span>

            <span className="line"></span>

            <span className="step">
              3
            </span>

          </div>


          <div className="participant-card">

            <div className="participant-icon">
              👤
            </div>


            <div className="small-label center">

              AVANT DE COMMENCER

            </div>


            <h1>
              Quelques informations
            </h1>


            <p className="participant-description">

              Ces informations nous permettront de mieux comprendre
              les résultats de l'étude. Vos réponses resteront
              confidentielles.

            </p>


            {/* ÂGE */}

            <div className="form-group">

              <label>
                Âge
              </label>

              <input
                type="number"
                min="1"
                max="120"
                value={participant.age}
                placeholder="Ex. 25"
                onChange={(e) =>
                  updateParticipant("age", e.target.value)
                }
              />

            </div>


            {/* GENRE */}

            <div className="form-group">

              <label>
                Genre
              </label>

              <select
                value={participant.gender}
                onChange={(e) =>
                  updateParticipant("gender", e.target.value)
                }
              >

                <option value="">
                  Sélectionnez une réponse
                </option>

                <option value="femme">
                  Femme
                </option>

                <option value="homme">
                  Homme
                </option>

                <option value="autre">
                  Autre
                </option>

                <option value="non_precise">
                  Je préfère ne pas préciser
                </option>

              </select>

            </div>


            {/* FAMILIARITÉ MUSIQUE */}

            <div className="form-group">

              <label>
                Familiarité avec la musique andalouse marocaine
              </label>

              <select
                value={participant.musicFamiliarity}
                onChange={(e) =>
                  updateParticipant(
                    "musicFamiliarity",
                    e.target.value
                  )
                }
              >

                <option value="">
                  Sélectionnez une réponse
                </option>

                <option value="pas_du_tout">
                  Pas du tout
                </option>

                <option value="peu">
                  Peu
                </option>

                <option value="moyenne">
                  Moyenne
                </option>

                <option value="beaucoup">
                  Beaucoup
                </option>

                <option value="tres">
                  Très familière
                </option>

              </select>

            </div>


            {/* CULTURE MAROCAINE */}

            <div className="form-group">

              <label>
                Êtes-vous familier avec la culture marocaine
                et ses traditions musicales ?
              </label>

              <select
                value={participant.culturalFamiliarity}
                onChange={(e) =>
                  updateParticipant(
                    "culturalFamiliarity",
                    e.target.value
                  )
                }
              >

                <option value="">
                  Sélectionnez une réponse
                </option>

                <option value="origine">
                  Oui, c'est ma culture d'origine
                </option>

                <option value="bien_connue">
                  Je la connais bien (expatrié/passionné)
                </option>

                <option value="decouverte">
                  Non, je la découvre
                </option>

              </select>

            </div>


            <button
              className="primary-button full"
              disabled={!isParticipantComplete}
              onClick={() => setPage("audio")}
            >

              Continuer

              <span>
                →
              </span>

            </button>

          </div>

        </main>

      </div>
    );
  }


  /* =======================================================
     PAGE ANNOTATION AUDIO
  ======================================================= */

  if (page === "audio") {

    const audio = AUDIO_FILES[currentAudio];

    const progress =
      ((currentAudio + 1) / AUDIO_FILES.length) * 100;


    return (

      <div className="app">

        <main className="annotation-page">


          {/* PROGRESSION */}

          <div className="annotation-progress">

            <div className="progress-text">

              Extrait{" "}

              <strong>
                {audio.number}
              </strong>

              {" "} / {AUDIO_FILES.length}

            </div>


            <div className="progress-bar">

              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`
                }}
              ></div>

            </div>

          </div>


          {/* AUDIO */}

          <section className="audio-section">

            <div className="small-label center">

              🎵 ÉCOUTE MUSICALE

            </div>


            <h1>

              Extrait musical{" "}

              {String(audio.number).padStart(2, "0")}

            </h1>


            <p className="audio-instruction">

              Écoutez attentivement l'extrait avant de répondre
              aux questions ci-dessous.

            </p>


            <div className="audio-player">

              <div className="audio-icon">
                ♪
              </div>


              <div className="audio-info">

                <div className="audio-title">

                  Musique Andalouse Marocaine

                </div>

                <div className="audio-subtitle">

                  Extrait de 30 secondes

                </div>

              </div>


              <audio
                controls
                src={audio.file}
              >

                Votre navigateur ne supporte pas
                la lecture audio.

              </audio>

            </div>


            <p className="relisten-message">

              ↻ Vous pouvez réécouter l'extrait autant
              de fois que nécessaire.

            </p>

          </section>


          {/* QUESTIONS */}

          <section className="annotation-section">


            <div className="annotation-header">

              <div className="small-label">

                <span></span>

                VOTRE RESSENTI

              </div>


              <h2>
                Comment ressentez-vous cet extrait ?
              </h2>


              <p>

                Il n'y a pas de bonne ou de mauvaise réponse.
                Sélectionnez simplement les réponses qui
                correspondent le mieux à votre ressenti.

              </p>

            </div>


            {/* =================================================
                QUESTION 01 : VALENCE
            ================================================= */}

            <div className="question-card">

              <div className="question-number">
                01
              </div>


              <div className="question-content">

                <h3>
                  Quelle est la tonalité émotionnelle
                  de cet extrait ?
                </h3>


                <p className="question-help">

                  1 correspond à une sensation très négative,
                  5 à une sensation neutre et 9 à une sensation
                  très positive.

                </p>


                <div className="scale-labels">

                  <span>
                    Très négative
                  </span>

                  <span>
                    Neutre
                  </span>

                  <span>
                    Très positive
                  </span>

                </div>


                <div className="scale">

                  {[1,2,3,4,5,6,7,8,9].map((number) => (

                    <button
                      key={number}
                      type="button"
                      className={
                        annotation.valence === number
                          ? "scale-button selected"
                          : "scale-button"
                      }
                      onClick={() =>
                        updateAnnotation(
                          "valence",
                          number
                        )
                      }
                    >

                      {number}

                    </button>

                  ))}

                </div>

              </div>

            </div>


            {/* =================================================
                QUESTION 02 : AROUSAL
            ================================================= */}

            <div className="question-card">

              <div className="question-number">
                02
              </div>


              <div className="question-content">

                <h3>
                  Quel est le niveau d'activation émotionnelle ?
                </h3>


                <p className="question-help">

                  Indiquez si la musique vous semble plutôt
                  calme ou énergique.

                </p>


                <div className="scale-labels">

                  <span>
                    Très calme
                  </span>

                  <span>
                    Moyen
                  </span>

                  <span>
                    Très énergique
                  </span>

                </div>


                <div className="scale">

                  {[1,2,3,4,5,6,7,8,9].map((number) => (

                    <button
                      key={number}
                      type="button"
                      className={
                        annotation.arousal === number
                          ? "scale-button selected"
                          : "scale-button"
                      }
                      onClick={() =>
                        updateAnnotation(
                          "arousal",
                          number
                        )
                      }
                    >

                      {number}

                    </button>

                  ))}

                </div>

              </div>

            </div>


            {/* =================================================
                QUESTION 03 : EMOTION
            ================================================= */}

            <div className="question-card">

              <div className="question-number">
                03
              </div>


              <div className="question-content">

                <h3>
                  Quelle émotion principale ressentez-vous ?
                </h3>


                <p className="question-help">

                  Sélectionnez l'émotion qui correspond
                  le mieux à votre ressenti.

                </p>


                <div className="choice-grid">

                  {[
                    ["joie", "😊", "Joie"],
                    ["tristesse", "😔", "Tristesse"],
                    ["serenite", "😌", "Sérénité"],
                    ["nostalgie", "🕰️", "Nostalgie"],
                    ["melancolie", "🌧️", "Mélancolie"],
                    ["excitation", "⚡", "Excitation"],
                    ["mixte", "🎭", "Émotion mixte"],
                  ].map(([value, icon, label]) => (

                    <button
                      key={value}
                      type="button"
                      className={
                        annotation.emotion === value
                          ? "choice-button selected"
                          : "choice-button"
                      }
                      onClick={() =>
                        updateAnnotation(
                          "emotion",
                          value
                        )
                      }
                    >

                      <span className="choice-icon">
                        {icon}
                      </span>

                      <span>
                        {label}
                      </span>

                    </button>

                  ))}

                </div>

              </div>

            </div>


            {/* =================================================
                QUESTION 04 : NOSTALGIE CULTURELLE
            ================================================= */}

            <div className="question-card">

              <div className="question-number">
                04
              </div>


              <div className="question-content">

                <h3>
                  Pensez-vous que cet extrait possède
                  un fort pouvoir de familiarité ou de
                  nostalgie culturelle ?
                </h3>


                <p className="question-help">

                  Cette musique vous évoque-t-elle une
                  culture familière ou des souvenirs anciens ?

                </p>


                <div className="choice-grid four">

                  {[
                    ["tres_faible", "Très faible"],
                    ["faible", "Faible"],
                    ["modere", "Modéré"],
                    ["tres_fort", "Très fort"],
                  ].map(([value, label]) => (

                    <button
                      key={value}
                      type="button"
                      className={
                        annotation.nostalgia === value
                          ? "choice-button selected"
                          : "choice-button"
                      }
                      onClick={() =>
                        updateAnnotation(
                          "nostalgia",
                          value
                        )
                      }
                    >

                      {label}

                    </button>

                  ))}

                </div>

              </div>

            </div>


            {/* =================================================
                QUESTION 05 : MOMENT
            ================================================= */}

            <div className="question-card">

              <div className="question-number">
                05
              </div>


              <div className="question-content">

                <h3>
                  À quel moment de la journée ce morceau
                  serait-il le plus adapté pour vous ?
                </h3>


                <div className="choice-grid three">

                  <button
                    type="button"
                    className={
                      annotation.moment === "matin"
                        ? "choice-button selected"
                        : "choice-button"
                    }
                    onClick={() =>
                      updateAnnotation(
                        "moment",
                        "matin"
                      )
                    }
                  >

                    <span className="choice-icon">
                      🌅
                    </span>

                    <strong>
                      Le matin
                    </strong>

                    <small>
                      Pour stimuler le réveil
                      et l'activité cognitive
                    </small>

                  </button>


                  <button
                    type="button"
                    className={
                      annotation.moment === "apres_midi"
                        ? "choice-button selected"
                        : "choice-button"
                    }
                    onClick={() =>
                      updateAnnotation(
                        "moment",
                        "apres_midi"
                      )
                    }
                  >

                    <span className="choice-icon">
                      ☀️
                    </span>

                    <strong>
                      L'après-midi
                    </strong>

                    <small>
                      Pour accompagner des activités
                      ou une thérapie
                    </small>

                  </button>


                  <button
                    type="button"
                    className={
                      annotation.moment === "soir"
                        ? "choice-button selected"
                        : "choice-button"
                    }
                    onClick={() =>
                      updateAnnotation(
                        "moment",
                        "soir"
                      )
                    }
                  >

                    <span className="choice-icon">
                      🌙
                    </span>

                    <strong>
                      Le soir
                    </strong>

                    <small>
                      Pour apaiser et favoriser
                      le repos
                    </small>

                  </button>

                </div>

              </div>

            </div>


            {/* =================================================
                QUESTION 06 : MIZAN
            ================================================= */}

            <div className="question-card">

              <div className="question-number">
                06
              </div>


              <div className="question-content">

                <h3>
                  Comment qualifiez-vous la vitesse
                  (le Mîzân) de cet extrait ?
                </h3>


                <div className="choice-grid three">

                  {[
                    [
                      "tres_lent",
                      "Très lent",
                      "Moussa'a"
                    ],
                    [
                      "modere",
                      "Modéré",
                      ""
                    ],
                    [
                      "tres_rapide",
                      "Très rapide / Soutenu",
                      "Insirâf"
                    ],
                  ].map(([value, label, subtitle]) => (

                    <button
                      key={value}
                      type="button"
                      className={
                        annotation.tempo === value
                          ? "choice-button selected"
                          : "choice-button"
                      }
                      onClick={() =>
                        updateAnnotation(
                          "tempo",
                          value
                        )
                      }
                    >

                      <strong>
                        {label}
                      </strong>

                      {subtitle && (
                        <small>
                          {subtitle}
                        </small>
                      )}

                    </button>

                  ))}

                </div>

              </div>

            </div>


            {/* =================================================
                QUESTION 07 : ELEMENT SONORE
            ================================================= */}

            <div className="question-card">

              <div className="question-number">
                07
              </div>


              <div className="question-content">

                <h3>
                  Quel élément sonore attire le plus
                  votre attention ?
                </h3>


                <div className="choice-grid three">

                  {[
                    [
                      "cordes",
                      "🎻",
                      "Les cordes",
                      "Violon / Rebab / Oud"
                    ],
                    [
                      "percussions",
                      "🥁",
                      "Les percussions",
                      "Darbouka / Tar"
                    ],
                    [
                      "voix",
                      "🎤",
                      "La voix humaine",
                      ""
                    ],
                  ].map(
                    ([value, icon, label, subtitle]) => (

                      <button
                        key={value}
                        type="button"
                        className={
                          annotation.attention === value
                            ? "choice-button selected"
                            : "choice-button"
                        }
                        onClick={() =>
                          updateAnnotation(
                            "attention",
                            value
                          )
                        }
                      >

                        <span className="choice-icon">
                          {icon}
                        </span>

                        <strong>
                          {label}
                        </strong>

                        {subtitle && (
                          <small>
                            {subtitle}
                          </small>
                        )}

                      </button>

                    )
                  )}

                </div>

              </div>

            </div>


            {/* =================================================
                VALIDATION
            ================================================= */}

            <button
              className="primary-button annotation-button full"
              disabled={!isAnnotationComplete}
              onClick={validateAnnotation}
            >

              {currentAudio === AUDIO_FILES.length - 1
                ? "Terminer l'étude"
                : "Valider et passer à l'extrait suivant"
              }

              <span>
                →
              </span>

            </button>


            {!isAnnotationComplete && (

              <p className="selection-message">

                Veuillez répondre à toutes les questions
                avant de continuer.

              </p>

            )}


            {isAnnotationComplete && (

              <p className="selection-message">

                ✓ Toutes vos réponses sont sélectionnées.

              </p>

            )}

          </section>

        </main>

      </div>
    );
  }


  /* =======================================================
     PAGE FIN
  ======================================================= */

  if (page === "finished") {

    return (

      <div className="app">

        <main className="participant-page">

          <div className="participant-card">

            <div className="participant-icon">
              ✓
            </div>


            <div className="small-label center">
              ÉTUDE TERMINÉE
            </div>


            <h1>
              Merci pour votre participation !
            </h1>


            <p className="participant-description">

              Vous avez terminé l'annotation des
              {AUDIO_FILES.length} extraits musicaux.

              <br /><br />

              Vos réponses ont été enregistrées
              pour notre étude sur la perception
              émotionnelle de la musique.

            </p>

          </div>

        </main>

      </div>

    );
  }


  return null;
}


export default App;