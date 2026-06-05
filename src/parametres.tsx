import { useState } from "react"

// 🎨 Styles réutilisables
const styleLabel = { fontSize: "13px", color: "#888", marginBottom: "6px", display: "block" as const }
const styleInput = { width: "100%", padding: "12px", backgroundColor: "#2a2a2a", border: "1px solid #333", borderRadius: "8px", color: "white", fontSize: "15px", outline: "none", marginBottom: "16px" }
const styleSectionTitre = { fontSize: "16px", fontWeight: "bold" as const, color: "#ffffff", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #2a2a2a" }

// 🏅 Sports avec coefficients par défaut
const SPORTS_DEFAUT = [
  { id: "trail", label: "Trail", emoji: "🌄", coef: 0.98 },
  { id: "course", label: "Course à pied", emoji: "🏃", coef: 0.78 },
  { id: "vtt", label: "VTT", emoji: "🚵", coef: 0.76 },
  { id: "velo", label: "Vélo route", emoji: "🚴", coef: 0.70 },
]

// 🎨 Couleur coefficient
const getCouleurCoef = (coef: number) => {
  if (coef >= 0.9) return "#4CAF50"
  if (coef >= 0.75) return "#FFC107"
  return "#FF9800"
}

export default function Parametres({ onFermer }: { onFermer: () => void }) {
  const [section, setSection] = useState("profil")
  const [confirmerSuppression, setConfirmerSuppression] = useState(false)
  const [messageSauvegarde, setMessageSauvegarde] = useState("")

  // 👤 Profil
  const [pseudo, setPseudo] = useState(localStorage.getItem("pseudo") || "")
  const [age, setAge] = useState(localStorage.getItem("age") || "")
  const [poids, setPoids] = useState(localStorage.getItem("poids") || "")
  const [taille, setTaille] = useState(localStorage.getItem("taille") || "")
  const [sportPrincipal, setSportPrincipal] = useState(localStorage.getItem("sportPrincipal") || "")

  // 🎯 Objectifs
  const [objDistance, setObjDistance] = useState(localStorage.getItem("obj_distance") || "100")
  const [objSeances, setObjSeances] = useState(localStorage.getItem("obj_seances") || "12")
  const [objScore, setObjScore] = useState(localStorage.getItem("obj_score") || "75")

  // 📐 Coefficients
  const [coefficients, setCoefficients] = useState(() => {
    const saved = localStorage.getItem("coefficients")
    return saved ? JSON.parse(saved) : SPORTS_DEFAUT.reduce((acc, s) => ({ ...acc, [s.id]: s.coef }), {})
  })

  // 💾 Sauvegarder profil
  const sauvegarderProfil = () => {
    localStorage.setItem("pseudo", pseudo)
    localStorage.setItem("age", age)
    localStorage.setItem("poids", poids)
    localStorage.setItem("taille", taille)
    localStorage.setItem("sportPrincipal", sportPrincipal)
    afficherMessage("Profil sauvegardé ✓")
  }

  // 💾 Sauvegarder objectifs
  const sauvegarderObjectifs = () => {
    localStorage.setItem("obj_distance", objDistance)
    localStorage.setItem("obj_seances", objSeances)
    localStorage.setItem("obj_score", objScore)
    afficherMessage("Objectifs sauvegardés ✓")
  }

  // 💾 Sauvegarder coefficients
  const sauvegarderCoefficients = () => {
    localStorage.setItem("coefficients", JSON.stringify(coefficients))
    afficherMessage("Coefficients sauvegardés ✓")
  }

  // 🔄 Réinitialiser coefficients
  const reinitialiserCoefficients = () => {
    const defaut = SPORTS_DEFAUT.reduce((acc, s) => ({ ...acc, [s.id]: s.coef }), {})
    setCoefficients(defaut)
    localStorage.setItem("coefficients", JSON.stringify(defaut))
    afficherMessage("Coefficients réinitialisés ✓")
  }

  // 🗑️ Effacer toutes les séances
  const effacerSeances = () => {
    localStorage.removeItem("seances")
    setConfirmerSuppression(false)
    afficherMessage("Toutes les séances ont été supprimées")
  }

  // ✅ Message temporaire
  const afficherMessage = (msg: string) => {
    setMessageSauvegarde(msg)
    setTimeout(() => setMessageSauvegarde(""), 2500)
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", zIndex: 200, overflowY: "auto", padding: "20px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", backgroundColor: "#121212", borderRadius: "16px", padding: "24px" }}>

        {/* En-tête */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", color: "white" }}>⚙️ Paramètres</h2>
          <button onClick={onFermer} style={{ backgroundColor: "transparent", border: "none", color: "#888", fontSize: "24px", cursor: "pointer" }}>✕</button>
        </div>

        {/* Message sauvegarde */}
        {messageSauvegarde && (
          <div style={{ backgroundColor: "#1a3a1a", border: "1px solid #4CAF50", borderRadius: "8px", padding: "10px 16px", marginBottom: "16px", textAlign: "center" }}>
            <p style={{ color: "#4CAF50", fontSize: "13px", margin: 0 }}>{messageSauvegarde}</p>
          </div>
        )}

        {/* Onglets sections */}
        <div style={{ display: "flex", gap: "6px", marginBottom: "24px" }}>
          {[
            { id: "profil", label: "👤 Profil" },
            { id: "objectifs", label: "🎯 Objectifs" },
            { id: "coefficients", label: "📐 Coefficients" },
            { id: "donnees", label: "🗂️ Données" },
          ].map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{
              flex: 1, padding: "10px 4px", fontSize: "11px",
              backgroundColor: section === s.id ? "#1a73e8" : "#1e1e1e",
              color: section === s.id ? "white" : "#555",
              border: section === s.id ? "1px solid #1a73e8" : "1px solid #2a2a2a",
              borderRadius: "8px", cursor: "pointer"
            }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* SECTION PROFIL */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {section === "profil" && (
          <div>
            <p style={styleSectionTitre}>👤 Mon profil</p>

            <label style={styleLabel}>Pseudo</label>
            <input type="text" value={pseudo} onChange={e => setPseudo(e.target.value)}
              placeholder="Ton prénom ou pseudo" style={styleInput} />

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={styleLabel}>Âge</label>
                <input type="number" value={age} onChange={e => setAge(e.target.value)}
                  placeholder="Ex: 32" style={styleInput} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styleLabel}>Poids (kg)</label>
                <input type="number" value={poids} onChange={e => setPoids(e.target.value)}
                  placeholder="Ex: 72" style={styleInput} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ flex: 1 }}>
                <label style={styleLabel}>Taille (cm)</label>
                <input type="number" value={taille} onChange={e => setTaille(e.target.value)}
                  placeholder="Ex: 178" style={styleInput} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styleLabel}>Sport principal</label>
                <select value={sportPrincipal} onChange={e => setSportPrincipal(e.target.value)}
                  style={{ ...styleInput, cursor: "pointer" }}>
                  <option value="">Choisir...</option>
                  {SPORTS_DEFAUT.map(s => (
                    <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Note poids/taille */}
            <div style={{ backgroundColor: "#1a2a3a", border: "1px solid #1a73e8", borderRadius: "8px", padding: "12px", marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "#aaa", lineHeight: "1.6", margin: 0 }}>
                ℹ️ Le poids et la taille sont collectés pour de futures fonctionnalités. Le rapport poids/puissance influence la fatigue et la récupération — un athlète plus musclé encaisse mieux les charges élevées. Ces données seront intégrées aux calculs dans une prochaine version.
              </p>
            </div>

            <button onClick={sauvegarderProfil} style={{
              width: "100%", padding: "14px", backgroundColor: "#4CAF50",
              color: "white", border: "none", borderRadius: "10px",
              fontSize: "15px", fontWeight: "bold", cursor: "pointer"
            }}>
              💾 Sauvegarder le profil
            </button>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* SECTION OBJECTIFS */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {section === "objectifs" && (
          <div>
            <p style={styleSectionTitre}>🎯 Mes objectifs mensuels</p>

            <label style={styleLabel}>Distance mensuelle cible (km)</label>
            <input type="number" value={objDistance} onChange={e => setObjDistance(e.target.value)}
              placeholder="Ex: 100" style={styleInput} />

            <label style={styleLabel}>Nombre de séances par mois</label>
            <input type="number" value={objSeances} onChange={e => setObjSeances(e.target.value)}
              placeholder="Ex: 12" style={styleInput} />

            <label style={styleLabel}>Score de forme cible (0-100)</label>
            <input type="range" min="40" max="100" value={objScore}
              onChange={e => setObjScore(e.target.value)}
              style={{ width: "100%", accentColor: "#1a73e8", marginBottom: "4px" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#555", marginBottom: "20px" }}>
              <span>40</span>
              <span style={{ color: "white", fontWeight: "bold" }}>Cible : {objScore}/100</span>
              <span>100</span>
            </div>

            <button onClick={sauvegarderObjectifs} style={{
              width: "100%", padding: "14px", backgroundColor: "#4CAF50",
              color: "white", border: "none", borderRadius: "10px",
              fontSize: "15px", fontWeight: "bold", cursor: "pointer"
            }}>
              💾 Sauvegarder les objectifs
            </button>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* SECTION COEFFICIENTS */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {section === "coefficients" && (
          <div>
            <p style={styleSectionTitre}>📐 Coefficients par sport</p>

            {/* Message scientifique */}
            <div style={{ backgroundColor: "#1a2a1a", border: "1px solid #4CAF50", borderRadius: "10px", padding: "14px", marginBottom: "20px" }}>
              <p style={{ fontSize: "13px", color: "#4CAF50", fontWeight: "bold", marginBottom: "6px" }}>
                🔬 Base scientifique
              </p>
              <p style={{ fontSize: "12px", color: "#aaa", lineHeight: "1.6", margin: 0 }}>
                Ces coefficients ont été établis en s'appuyant sur des données issues de la physiologie du sport et de la science de l'entraînement. Ils reflètent la charge globale réelle de chaque discipline — en tenant compte de la sollicitation du système nerveux central, de la fatigue musculaire et de l'intensité cardiovasculaire.
              </p>
              <p style={{ fontSize: "12px", color: "#888", lineHeight: "1.6", margin: "8px 0 0" }}>
                Tu peux les ajuster selon ton ressenti personnel, mais les valeurs par défaut constituent une base scientifiquement cohérente. Un bouton "Réinitialiser" te permet de revenir aux valeurs d'origine à tout moment.
              </p>
            </div>

            {/* Curseurs par sport */}
            {SPORTS_DEFAUT.map(sport => (
              <div key={sport.id} style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                  <label style={{ fontSize: "14px", color: "white" }}>
                    {sport.emoji} {sport.label}
                  </label>
                  <span style={{
                    fontSize: "14px", fontWeight: "bold",
                    color: getCouleurCoef(coefficients[sport.id]),
                    backgroundColor: "#2a2a2a", padding: "2px 10px", borderRadius: "10px"
                  }}>
                    ×{parseFloat(coefficients[sport.id]).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range" min="0.1" max="1.0" step="0.01"
                  value={coefficients[sport.id]}
                  onChange={e => setCoefficients((prev: any) => ({ ...prev, [sport.id]: parseFloat(e.target.value) }))}
                  style={{ width: "100%", accentColor: getCouleurCoef(coefficients[sport.id]) }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#555", marginTop: "2px" }}>
                  <span>Effort léger (0.1)</span>
                  <span style={{ color: "#555", fontSize: "10px" }}>
                    Défaut : ×{sport.coef}
                  </span>
                  <span>Effort maximal (1.0)</span>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={reinitialiserCoefficients} style={{
                flex: 1, padding: "14px", backgroundColor: "#2a2a2a",
                color: "#888", border: "1px solid #333", borderRadius: "10px",
                fontSize: "14px", cursor: "pointer"
              }}>
                🔄 Réinitialiser
              </button>
              <button onClick={sauvegarderCoefficients} style={{
                flex: 2, padding: "14px", backgroundColor: "#4CAF50",
                color: "white", border: "none", borderRadius: "10px",
                fontSize: "15px", fontWeight: "bold", cursor: "pointer"
              }}>
                💾 Sauvegarder
              </button>
            </div>
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {/* SECTION DONNÉES */}
        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        {section === "donnees" && (
          <div>
            <p style={styleSectionTitre}>🗂️ Mes données</p>

            {/* Infos stockage */}
            <div style={{ backgroundColor: "#1e1e1e", borderRadius: "12px", padding: "16px", marginBottom: "16px", border: "1px solid #2a2a2a" }}>
              <p style={{ fontSize: "14px", color: "white", marginBottom: "8px" }}>📊 Stockage local</p>
              {(() => {
                const seances = JSON.parse(localStorage.getItem("seances") || "[]")
                return (
                  <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
                    {seances.length} séance(s) enregistrée(s) sur cet appareil
                  </p>
                )
              })()}
            </div>

            {/* Version app */}
            <div style={{ backgroundColor: "#1e1e1e", borderRadius: "12px", padding: "16px", marginBottom: "24px", border: "1px solid #2a2a2a" }}>
              <p style={{ fontSize: "14px", color: "white", marginBottom: "4px" }}>📱 FeelTrack</p>
              <p style={{ fontSize: "12px", color: "#555", margin: 0 }}>Version 1.0.0 — Développé avec ❤️</p>
            </div>

            {/* Danger zone */}
            <div style={{ backgroundColor: "#1a0000", border: "1px solid #F44336", borderRadius: "12px", padding: "16px" }}>
              <p style={{ fontSize: "14px", color: "#F44336", fontWeight: "bold", marginBottom: "8px" }}>
                ⚠️ Zone dangereuse
              </p>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>
                La suppression de toutes les séances est irréversible. Toutes tes données d'entraînement seront perdues définitivement.
              </p>

              {!confirmerSuppression ? (
                <button onClick={() => setConfirmerSuppression(true)} style={{
                  width: "100%", padding: "14px", backgroundColor: "transparent",
                  color: "#F44336", border: "1px solid #F44336", borderRadius: "10px",
                  fontSize: "14px", cursor: "pointer"
                }}>
                  🗑️ Effacer toutes mes séances
                </button>
              ) : (
                <div>
                  <p style={{ fontSize: "13px", color: "#F44336", marginBottom: "12px", textAlign: "center" }}>
                    Tu es sûr ? Cette action est irréversible.
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={() => setConfirmerSuppression(false)} style={{
                      flex: 1, padding: "14px", backgroundColor: "#2a2a2a",
                      color: "white", border: "none", borderRadius: "10px",
                      fontSize: "14px", cursor: "pointer"
                    }}>
                      Annuler
                    </button>
                    <button onClick={effacerSeances} style={{
                      flex: 1, padding: "14px", backgroundColor: "#F44336",
                      color: "white", border: "none", borderRadius: "10px",
                      fontSize: "14px", fontWeight: "bold", cursor: "pointer"
                    }}>
                      Confirmer
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
