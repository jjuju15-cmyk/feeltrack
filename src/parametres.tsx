import { useState } from "react"

const SPORTS_DEFAUT = [
  { id: "trail", label: "Trail", emoji: "🌄", coef: 0.98 },
  { id: "course", label: "Course à pied", emoji: "🏃", coef: 0.78 },
  { id: "vtt", label: "VTT", emoji: "🚵", coef: 0.76 },
  { id: "velo", label: "Vélo route", emoji: "🚴", coef: 0.70 },
]

const getCouleurCoef = (coef: number) => {
  if (coef >= 0.9) return "var(--ft-cardio)"
  if (coef >= 0.75) return "#FFC107"
  return "#FF9800"
}

const styleInput = {
  width: "100%", padding: "12px 14px",
  background: "var(--ft-surface)", border: "none",
  borderRadius: "var(--ft-r-input)", color: "var(--ft-ink)",
  fontSize: 15, outline: "none", marginBottom: 16,
  fontFamily: "var(--ft-font-body)"
} as const

export default function Parametres({ onFermer }: { onFermer: () => void }) {
  const [section, setSection] = useState("profil")
  const [confirmerSuppression, setConfirmerSuppression] = useState(false)
  const [messageSauvegarde, setMessageSauvegarde] = useState("")

  const [pseudo, setPseudo] = useState(localStorage.getItem("pseudo") || "")
  const [age, setAge] = useState(localStorage.getItem("age") || "")
  const [poids, setPoids] = useState(localStorage.getItem("poids") || "")
  const [taille, setTaille] = useState(localStorage.getItem("taille") || "")
  const [sportPrincipal, setSportPrincipal] = useState(localStorage.getItem("sportPrincipal") || "")

  const [objDistance, setObjDistance] = useState(localStorage.getItem("obj_distance") || "100")
  const [objSeances, setObjSeances] = useState(localStorage.getItem("obj_seances") || "12")
  const [objScore, setObjScore] = useState(localStorage.getItem("obj_score") || "75")

  const [coefficients, setCoefficients] = useState(() => {
    const saved = localStorage.getItem("coefficients")
    return saved ? JSON.parse(saved) : SPORTS_DEFAUT.reduce((acc, s) => ({ ...acc, [s.id]: s.coef }), {})
  })

  const afficherMessage = (msg: string) => {
    setMessageSauvegarde(msg)
    setTimeout(() => setMessageSauvegarde(""), 2500)
  }

  const sauvegarderProfil = () => {
    localStorage.setItem("pseudo", pseudo)
    localStorage.setItem("age", age)
    localStorage.setItem("poids", poids)
    localStorage.setItem("taille", taille)
    localStorage.setItem("sportPrincipal", sportPrincipal)
    afficherMessage("Profil sauvegardé ✓")
  }

  const sauvegarderObjectifs = () => {
    localStorage.setItem("obj_distance", objDistance)
    localStorage.setItem("obj_seances", objSeances)
    localStorage.setItem("obj_score", objScore)
    afficherMessage("Objectifs sauvegardés ✓")
  }

  const sauvegarderCoefficients = () => {
    localStorage.setItem("coefficients", JSON.stringify(coefficients))
    afficherMessage("Coefficients sauvegardés ✓")
  }

  const reinitialiserCoefficients = () => {
    const defaut = SPORTS_DEFAUT.reduce((acc, s) => ({ ...acc, [s.id]: s.coef }), {})
    setCoefficients(defaut)
    localStorage.setItem("coefficients", JSON.stringify(defaut))
    afficherMessage("Coefficients réinitialisés ✓")
  }

  const effacerSeances = () => {
    localStorage.removeItem("seances")
    setConfirmerSuppression(false)
    afficherMessage("Toutes les séances ont été supprimées")
  }

  const sections = [
    { id: "profil", label: "Profil" },
    { id: "objectifs", label: "Objectifs" },
    { id: "coefficients", label: "Coefficients" },
    { id: "donnees", label: "Données" },
  ]

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(33, 27, 46, 0.7)", backdropFilter: "blur(6px)",
      zIndex: 200, overflowY: "auto", padding: 20
    }}>
      <div style={{
        maxWidth: 480, margin: "0 auto",
        background: "var(--ft-surface)", borderRadius: "var(--ft-r-card)",
        padding: 24, boxShadow: "var(--ft-shadow-lift)"
      }}>

        {/* En-tête */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{
            fontFamily: "var(--ft-font-display)", fontSize: 20, fontWeight: 700,
            color: "var(--ft-ink)", margin: 0
          }}>Paramètres</h2>
          <button onClick={onFermer} style={{
            background: "var(--ft-card)", border: "none", color: "var(--ft-muted)",
            fontSize: 20, cursor: "pointer", width: 36, height: 36,
            borderRadius: "var(--ft-r-orb)", display: "flex",
            alignItems: "center", justifyContent: "center",
            boxShadow: "var(--ft-shadow-soft)"
          }}>✕</button>
        </div>

        {/* Message sauvegarde */}
        {messageSauvegarde && (
          <div style={{
            background: "var(--ft-card)", borderRadius: "var(--ft-r-btn)",
            padding: "10px 16px", marginBottom: 16, textAlign: "center",
            boxShadow: "var(--ft-shadow-soft)",
            borderLeft: "4px solid var(--ft-cardio)"
          }}>
            <p style={{ color: "var(--ft-cardio)", fontSize: 13, margin: 0 }}>{messageSauvegarde}</p>
          </div>
        )}

        {/* Onglets */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => setSection(s.id)} style={{
              flex: 1, padding: "9px 4px", fontSize: 11,
              background: section === s.id ? "var(--ft-ink)" : "var(--ft-card)",
              color: section === s.id ? "#fff" : "var(--ft-muted)",
              border: "none", borderRadius: "var(--ft-r-btn)",
              fontWeight: section === s.id ? 600 : 400,
              cursor: "pointer", fontFamily: "var(--ft-font-body)",
              boxShadow: "var(--ft-shadow-soft)"
            }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* SECTION PROFIL */}
        {section === "profil" && (
          <div>
            <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 6 }}>Pseudo</p>
            <input type="text" value={pseudo} onChange={e => setPseudo(e.target.value)}
              placeholder="Ton prénom ou pseudo" style={styleInput} />

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 6 }}>Âge</p>
                <input type="number" value={age} onChange={e => setAge(e.target.value)}
                  placeholder="32" style={styleInput} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 6 }}>Poids (kg)</p>
                <input type="number" value={poids} onChange={e => setPoids(e.target.value)}
                  placeholder="72" style={styleInput} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 6 }}>Taille (cm)</p>
                <input type="number" value={taille} onChange={e => setTaille(e.target.value)}
                  placeholder="178" style={styleInput} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 6 }}>Sport principal</p>
                <select value={sportPrincipal} onChange={e => setSportPrincipal(e.target.value)}
                  style={{ ...styleInput, cursor: "pointer", appearance: "auto" }}>
                  <option value="">Choisir…</option>
                  {SPORTS_DEFAUT.map(s => (
                    <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{
              background: "var(--ft-card)", borderRadius: "var(--ft-r-btn)",
              padding: 14, marginBottom: 20, boxShadow: "var(--ft-shadow-soft)"
            }}>
              <p style={{ fontSize: 12, color: "var(--ft-muted)", lineHeight: 1.6, margin: 0 }}>
                ℹ️ Le poids et la taille sont collectés pour de futures fonctionnalités. Le rapport poids/puissance influence la fatigue et la récupération — un athlète plus musclé encaisse mieux les charges élevées.
              </p>
            </div>

            <button onClick={sauvegarderProfil} style={{
              width: "100%", padding: "14px 22px",
              background: "var(--ft-ink)", color: "#fff", border: "none",
              borderRadius: "var(--ft-r-btn)", fontSize: 15, fontWeight: 600,
              cursor: "pointer", fontFamily: "var(--ft-font-body)",
              boxShadow: "var(--ft-shadow-soft)"
            }}>
              Sauvegarder le profil
            </button>
          </div>
        )}

        {/* SECTION OBJECTIFS */}
        {section === "objectifs" && (
          <div>
            <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 6 }}>Distance mensuelle cible (km)</p>
            <input type="number" value={objDistance} onChange={e => setObjDistance(e.target.value)}
              placeholder="100" style={styleInput} />

            <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 6 }}>Nombre de séances par mois</p>
            <input type="number" value={objSeances} onChange={e => setObjSeances(e.target.value)}
              placeholder="12" style={styleInput} />

            <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 8 }}>Score de forme cible (0–100)</p>
            <input type="range" min="40" max="100" value={objScore}
              onChange={e => setObjScore(e.target.value)}
              style={{ width: "100%", accentColor: "#7C6FF0", marginBottom: 6 }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ft-muted)", marginBottom: 20 }}>
              <span>40</span>
              <span style={{
                fontFamily: "var(--ft-font-data)", color: "var(--ft-ink)", fontWeight: 500
              }}>Cible : {objScore}/100</span>
              <span>100</span>
            </div>

            <button onClick={sauvegarderObjectifs} style={{
              width: "100%", padding: "14px 22px",
              background: "var(--ft-ink)", color: "#fff", border: "none",
              borderRadius: "var(--ft-r-btn)", fontSize: 15, fontWeight: 600,
              cursor: "pointer", fontFamily: "var(--ft-font-body)",
              boxShadow: "var(--ft-shadow-soft)"
            }}>
              Sauvegarder les objectifs
            </button>
          </div>
        )}

        {/* SECTION COEFFICIENTS */}
        {section === "coefficients" && (
          <div>
            <div style={{
              background: "var(--ft-card)", borderRadius: "var(--ft-r-btn)",
              padding: 16, marginBottom: 24, boxShadow: "var(--ft-shadow-soft)",
              borderLeft: "4px solid var(--ft-cardio)"
            }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ft-cardio)", marginBottom: 6 }}>
                Base scientifique
              </p>
              <p style={{ fontSize: 12, color: "var(--ft-muted)", lineHeight: 1.6, margin: 0 }}>
                Ces coefficients reflètent la charge globale réelle de chaque discipline — sollicitation SNC, fatigue musculaire et intensité cardiovasculaire. Tu peux les ajuster selon ton ressenti.
              </p>
            </div>

            {SPORTS_DEFAUT.map(sport => (
              <div key={sport.id} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 500, color: "var(--ft-ink)" }}>
                    {sport.emoji} {sport.label}
                  </label>
                  <span style={{
                    fontFamily: "var(--ft-font-data)", fontSize: 14, fontWeight: 500,
                    color: getCouleurCoef(coefficients[sport.id]),
                    background: "var(--ft-surface)", padding: "2px 10px",
                    borderRadius: "var(--ft-r-chip)"
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
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--ft-muted)", marginTop: 2 }}>
                  <span>Léger (0.1)</span>
                  <span>Défaut : ×{sport.coef}</span>
                  <span>Maximal (1.0)</span>
                </div>
              </div>
            ))}

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={reinitialiserCoefficients} style={{
                flex: 1, padding: 14,
                background: "var(--ft-card)", color: "var(--ft-muted)",
                border: "none", borderRadius: "var(--ft-r-btn)",
                fontSize: 14, cursor: "pointer", fontFamily: "var(--ft-font-body)",
                boxShadow: "var(--ft-shadow-soft)"
              }}>
                Réinitialiser
              </button>
              <button onClick={sauvegarderCoefficients} style={{
                flex: 2, padding: 14,
                background: "var(--ft-ink)", color: "#fff",
                border: "none", borderRadius: "var(--ft-r-btn)",
                fontSize: 15, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--ft-font-body)", boxShadow: "var(--ft-shadow-soft)"
              }}>
                Sauvegarder
              </button>
            </div>
          </div>
        )}

        {/* SECTION DONNÉES */}
        {section === "donnees" && (
          <div>
            {/* Stockage */}
            <div style={{
              background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
              padding: 16, marginBottom: 12, boxShadow: "var(--ft-shadow-soft)"
            }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ft-ink)", marginBottom: 6 }}>Stockage local</p>
              {(() => {
                const seances = JSON.parse(localStorage.getItem("seances") || "[]")
                const lastExport = localStorage.getItem("lastExport")
                const joursDepuisExport = lastExport
                  ? Math.floor((Date.now() - parseInt(lastExport)) / (1000 * 60 * 60 * 24))
                  : null
                return (
                  <>
                    <p style={{ fontSize: 13, color: "var(--ft-muted)", margin: "0 0 4px" }}>
                      {seances.length} séance{seances.length > 1 ? "s" : ""} enregistrée{seances.length > 1 ? "s" : ""} sur cet appareil
                    </p>
                    {joursDepuisExport !== null && joursDepuisExport > 30 && (
                      <p style={{ fontSize: 12, color: "#FF9800", margin: 0 }}>
                        ⚠️ Dernier export il y a {joursDepuisExport} jours — pense à sauvegarder.
                      </p>
                    )}
                    {joursDepuisExport === null && seances.length > 0 && (
                      <p style={{ fontSize: 12, color: "var(--ft-muted)", margin: 0 }}>
                        Pas encore exporté — pense à faire une sauvegarde.
                      </p>
                    )}
                  </>
                )
              })()}
            </div>

            {/* Export */}
            <div style={{
              background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
              padding: 16, marginBottom: 12, boxShadow: "var(--ft-shadow-soft)"
            }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ft-ink)", marginBottom: 4 }}>Exporter mes données</p>
              <p style={{ fontSize: 12, color: "var(--ft-muted)", marginBottom: 12, lineHeight: 1.5 }}>
                Télécharge toutes tes séances, paramètres et objectifs en un fichier JSON.
              </p>
              <button onClick={() => {
                const data = {
                  version: 1,
                  exportDate: new Date().toISOString(),
                  seances: JSON.parse(localStorage.getItem("seances") || "[]"),
                  checkins: JSON.parse(localStorage.getItem("checkins") || "[]"),
                  profil: {
                    pseudo: localStorage.getItem("pseudo"),
                    age: localStorage.getItem("age"),
                    poids: localStorage.getItem("poids"),
                    taille: localStorage.getItem("taille"),
                    sportPrincipal: localStorage.getItem("sportPrincipal"),
                  },
                  objectifs: {
                    obj_distance: localStorage.getItem("obj_distance"),
                    obj_seances: localStorage.getItem("obj_seances"),
                    obj_score: localStorage.getItem("obj_score"),
                  },
                  coefficients: JSON.parse(localStorage.getItem("coefficients") || "null"),
                  periodes_off: JSON.parse(localStorage.getItem("periodes_off") || "[]"),
                }
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                const today = new Date().toISOString().split("T")[0]
                a.href = url; a.download = `feeltrack-backup-${today}.json`
                a.click(); URL.revokeObjectURL(url)
                localStorage.setItem("lastExport", Date.now().toString())
                afficherMessage("Export téléchargé ✓")
              }} style={{
                width: "100%", padding: 13,
                background: "var(--ft-snc)", color: "#fff", border: "none",
                borderRadius: "var(--ft-r-btn)", fontSize: 14, fontWeight: 600,
                cursor: "pointer", fontFamily: "var(--ft-font-body)",
                boxShadow: "0 4px 16px rgba(124,111,240,0.3)"
              }}>
                Télécharger la sauvegarde
              </button>
            </div>

            {/* Import */}
            <div style={{
              background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
              padding: 16, marginBottom: 24, boxShadow: "var(--ft-shadow-soft)"
            }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ft-ink)", marginBottom: 4 }}>Importer des données</p>
              <p style={{ fontSize: 12, color: "var(--ft-muted)", marginBottom: 12, lineHeight: 1.5 }}>
                Restaure une sauvegarde JSON. Tu peux fusionner avec les données existantes ou tout remplacer.
              </p>
              <input type="file" accept=".json" id="import-json" style={{ display: "none" }}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  const reader = new FileReader()
                  reader.onload = ev => {
                    try {
                      const data = JSON.parse(ev.target?.result as string)
                      if (!data.version || !Array.isArray(data.seances)) {
                        afficherMessage("❌ Fichier invalide — structure incorrecte")
                        return
                      }
                      const mode = window.confirm(
                        `${data.seances.length} séances trouvées.\n\nOK = Fusionner avec tes données actuelles\nAnnuler = Remplacer toutes tes données`
                      )
                      if (mode) {
                        // Fusion : dédoublonnage par id
                        const existantes = JSON.parse(localStorage.getItem("seances") || "[]")
                        const idsExistants = new Set(existantes.map((s: any) => s.id))
                        const nouvelles = data.seances.filter((s: any) => !idsExistants.has(s.id))
                        localStorage.setItem("seances", JSON.stringify([...existantes, ...nouvelles]))
                        if (data.checkins) {
                          const existantsCI = JSON.parse(localStorage.getItem("checkins") || "[]")
                          const datesExistants = new Set(existantsCI.map((c: any) => c.date))
                          const nouveauxCI = data.checkins.filter((c: any) => !datesExistants.has(c.date))
                          localStorage.setItem("checkins", JSON.stringify([...existantsCI, ...nouveauxCI]))
                        }
                        afficherMessage(`✓ ${nouvelles.length} séances importées (fusion)`)
                      } else {
                        // Remplacement total
                        localStorage.setItem("seances", JSON.stringify(data.seances))
                        if (data.checkins) localStorage.setItem("checkins", JSON.stringify(data.checkins))
                        if (data.profil) {
                          Object.entries(data.profil).forEach(([k, v]) => v && localStorage.setItem(k, v as string))
                        }
                        if (data.objectifs) {
                          Object.entries(data.objectifs).forEach(([k, v]) => v && localStorage.setItem(k, v as string))
                        }
                        if (data.coefficients) localStorage.setItem("coefficients", JSON.stringify(data.coefficients))
                        afficherMessage(`✓ ${data.seances.length} séances restaurées`)
                      }
                    } catch {
                      afficherMessage("❌ Erreur de lecture du fichier")
                    }
                    e.target.value = ""
                  }
                  reader.readAsText(file)
                }}
              />
              <button onClick={() => document.getElementById("import-json")?.click()} style={{
                width: "100%", padding: 13,
                background: "var(--ft-surface)", color: "var(--ft-ink)",
                border: "1.5px solid var(--ft-line)", borderRadius: "var(--ft-r-btn)",
                fontSize: 14, fontWeight: 500, cursor: "pointer",
                fontFamily: "var(--ft-font-body)"
              }}>
                Choisir un fichier de sauvegarde…
              </button>
            </div>

            {/* Version */}
            <div style={{
              background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
              padding: 16, marginBottom: 24, boxShadow: "var(--ft-shadow-soft)"
            }}>
              <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ft-ink)", marginBottom: 2 }}>FeelTrack</p>
              <p style={{ fontSize: 12, color: "var(--ft-muted)", margin: 0 }}>Version 1.0.0</p>
            </div>

            {/* Zone dangereuse */}
            <div style={{
              background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
              padding: 16, boxShadow: "var(--ft-shadow-soft)",
              borderLeft: "4px solid #F44336"
            }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#F44336", marginBottom: 8 }}>
                Zone dangereuse
              </p>
              <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 16, lineHeight: 1.5 }}>
                La suppression de toutes les séances est irréversible. Toutes tes données d'entraînement seront perdues.
              </p>

              {!confirmerSuppression ? (
                <button onClick={() => setConfirmerSuppression(true)} style={{
                  width: "100%", padding: 14,
                  background: "transparent", color: "#F44336",
                  border: "1px solid #F44336", borderRadius: "var(--ft-r-btn)",
                  fontSize: 14, cursor: "pointer", fontFamily: "var(--ft-font-body)"
                }}>
                  Effacer toutes mes séances
                </button>
              ) : (
                <div>
                  <p style={{ fontSize: 13, color: "#F44336", marginBottom: 12, textAlign: "center" }}>
                    Tu es sûr ? Cette action est irréversible.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => setConfirmerSuppression(false)} style={{
                      flex: 1, padding: 14,
                      background: "var(--ft-surface)", color: "var(--ft-ink)",
                      border: "none", borderRadius: "var(--ft-r-btn)",
                      fontSize: 14, cursor: "pointer", fontFamily: "var(--ft-font-body)"
                    }}>
                      Annuler
                    </button>
                    <button onClick={effacerSeances} style={{
                      flex: 1, padding: 14,
                      background: "#F44336", color: "#fff",
                      border: "none", borderRadius: "var(--ft-r-btn)",
                      fontSize: 14, fontWeight: 600, cursor: "pointer",
                      fontFamily: "var(--ft-font-body)"
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
