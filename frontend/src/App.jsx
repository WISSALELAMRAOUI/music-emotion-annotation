import { useState } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("welcome");

  if (page === "welcome") {
    return (
      <div className="app">
        {/* HEADER */}
        <header className="header">
          <div className="logo">
            <div className="logo-icon">♫</div>
            <div>
              <div className="logo-title">MusicEmotion</div>
              <div className="logo-subtitle">Étude de perception musicale</div>
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
              <span>à travers la musique</span>
            </h1>

            <p className="hero-description">
              Nous vous invitons à découvrir plusieurs extraits de
              musique andalouse marocaine et à partager votre ressenti
              émotionnel après chaque écoute.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() => setPage("participant")}
              >
                Commencer l'étude
                <span>→</span>
              </button>

              <div className="duration">
                <span className="clock-icon">◷</span>
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
                <span>♪</span>
                <span className="music-status">MUSIC</span>
              </div>

              <div className="waveform">
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
                <i></i>
              </div>

              <div className="music-time">
                <span>00:00</span>
                <span>00:30</span>
              </div>

              <div className="play-button">▶</div>
            </div>
          </div>
        </main>

        {/* FEATURES */}
        <section className="features">

          <div className="feature-card">
            <div className="feature-icon">🎧</div>
            <div>
              <h3>Écoutez</h3>
              <p>
                Écoutez attentivement chaque extrait musical
                de 30 secondes.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💭</div>
            <div>
              <h3>Ressentez</h3>
              <p>
                Indiquez les émotions et sensations que
                la musique provoque chez vous.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <div>
              <h3>Participez</h3>
              <p>
                Vos réponses contribueront à notre étude
                sur les émotions musicales.
              </p>
            </div>
          </div>

        </section>

        {/* FOOTER */}
        <footer className="footer">
          <span> Vos réponses sont utilisées uniquement à des fins de recherche.</span>
        </footer>
      </div>
    );
  }

  if (page === "participant") {
    return (
      <div className="app">
        <main className="participant-page">

          <div className="step-indicator">
            <span className="step active">1</span>
            <span className="line"></span>
            <span className="step">2</span>
            <span className="line"></span>
            <span className="step">3</span>
          </div>

          <div className="participant-card">

            <div className="participant-icon">
              👤
            </div>

            <div className="small-label center">
              AVANT DE COMMENCER
            </div>

            <h1>Quelques informations</h1>

            <p className="participant-description">
              Ces informations nous permettront de mieux comprendre
              les résultats de l'étude. Vos réponses resteront
              confidentielles.
            </p>

            <div className="form-group">
              <label>Âge</label>
              <input
                type="number"
                placeholder="Ex. 25"
              />
            </div>

            <div className="form-group">
              <label>Genre</label>

              <select>
                <option value="">Sélectionnez une réponse</option>
                <option value="femme">Femme</option>
                <option value="homme">Homme</option>
                <option value="autre">Autre</option>
                <option value="non_precise">
                  Je préfère ne pas préciser
                </option>
              </select>
            </div>

            <div className="form-group">
              <label>
                Familiarité avec la musique andalouse marocaine
              </label>

              <select>
                <option value="">
                  Sélectionnez une réponse
                </option>
                <option value="pas_du_tout">Pas du tout</option>
                <option value="peu">Peu</option>
                <option value="moyenne">Moyenne</option>
                <option value="beaucoup">Beaucoup</option>
                <option value="tres">Très familière</option>
              </select>
            </div>

            <button
              className="primary-button full"
              onClick={() => setPage("audio")}
            >
              Continuer
              <span>→</span>
            </button>

          </div>

        </main>
      </div>
    );
  }

  if (page === "audio") {
    return (
      <div className="app">
        <main className="participant-page">
          <div className="audio-card">
            <div className="small-label center">
              PRÊT À COMMENCER ?
            </div>

            <h1>Extrait 1 / 100</h1>

            <p>
              Vous allez maintenant écouter le premier extrait
              musical.
            </p>

            <button className="primary-button">
              Écouter l'extrait
              <span>▶</span>
            </button>
          </div>
        </main>
      </div>
    );
  }

  return null;
}

export default App;