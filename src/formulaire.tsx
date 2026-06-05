import { useState } from "react"

interface Seance {
  sport: string; type: string; parcours: string; date: string
  duree: string; distance: string; denivele: string
  temperature: string; meteo: string; moment: string
  // terrain trail/vtt
  etatSol: string; technicite: string
  // surface course à pied
  surface: string
  // profil vélo
  profilVelo: string
  // physique
  energie: string; jambes: string; cardio: string
  respiration: string; douleur: string
  // récupération
  sommeil: string; hydratation: string; nutrition: string; fatigue: string
  // mental
  motivation: string; ressenti: string[]; gestionEffort: string
  // nutrition compétition
  quantiteGlucides: string; toleranceDigestive: string; hydratationCourse: string
  note: string
}

const styleLabel = { fontSize: "13px", color: "#888", marginBottom: "6px", display: "block" as const }
const styleInput = { width: "100%", padding: "12px", backgroundColor: "#2a2a2a", border: "1px solid #333", borderRadius: "8px", color: "white", fontSize: "15px", outline: "none", marginBottom: "16px" }
const styleSectionTitre = { fontSize: "16px", fontWeight: "bold" as const, color: "#ffffff", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #2a2a2a" }
const styleBouton = (actif: boolean, couleur = "#1a73e8") => ({
  padding: "10px 16px", backgroundColor: actif ? couleur : "#2a2a2a",
  color: actif ? "white" : "#888",
  border: actif ? `1px solid ${couleur}` : "1px solid #333",
  borderRadius: "8px", fontSize: "14px", cursor: "pointer", marginRight: "8px", marginBottom: "8px"
})

const sports = [
  { id: "trail", label: "Trail", emoji: "🌄" },
  { id: "course", label: "Course à pied", emoji: "🏃" },
  { id: "vtt", label: "VTT", emoji: "🚵" },
  { id: "velo", label: "Vélo route", emoji: "🚴" },
]

const getSections = (sport: string, type: string): string[] => {
  const s = ["general", "objectif", "conditions"]
  if (sport === "trail" || sport === "vtt") s.push("terrain")
  else if (sport === "course") s.push("surface")
  else if (sport === "velo") s.push("profil")
  s.push("physique", "recuperation", "mental")
  if (type === "Compétition") s.push("nutrition")
  s.push("note")
  return s
}

const Slider = ({ label, valeur, onChange, min = "1", max = "5", labelMin, labelMax }: {
  label: string; valeur: string; onChange: (v: string) => void
  min?: string; max?: string; labelMin: string; labelMax: string
}) => (
  <div style={{ marginBottom: "24px" }}>
    <label style={{ ...styleLabel, marginBottom: "10px" }}>
      {label} — <span style={{ color: "#ffffff", fontWeight: "bold" }}>{valeur}/{max}</span>
    </label>
    <input type="range" min={min} max={max} value={valeur} onChange={e => onChange(e.target.value)}
      style={{ width: "100%", accentColor: "#1a73e8", marginBottom: "4px" }} />
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#555" }}>
      <span>{labelMin}</span><span>{labelMax}</span>
    </div>
  </div>
)

// ⏱️ Parse durée "1h30" → 90 minutes
const parseDuree = (duree: string): number => {
  if (!duree) return 60
  const c = duree.toLowerCase().replace(/\s/g, "")
  const hm = c.match(/(\d+)h(\d+)?/)
  if (hm) return parseInt(hm[1]) * 60 + parseInt(hm[2] || "0")
  const m = c.match(/(\d+)/)
  return m ? parseInt(m[1]) : 60
}

// 🧮 CALCUL DES SCORES
const getCoefTemperature = (temp: number) => {
  if (temp <= 0) return 1.20; if (temp <= 5) return 1.10; if (temp <= 10) return 1.05
  if (temp <= 25) return 1.00; if (temp <= 30) return 1.05; if (temp <= 35) return 1.15
  return 1.25
}
const getCoefMeteo = (meteo: string) => ({ soleil: 1.0, nuageux: 1.0, pluie: 1.15, vent: 1.10, neige: 1.20 }[meteo] || 1.0)
const getCoefMoment = (moment: string) => ({ matin: 1.10, aprem: 1.0, soir: 1.05, nuit: 1.15 }[moment] || 1.0)
const getCoefTerrain = (technicite: string, etatSol: string) => {
  let coef = 1.0; const tech = parseInt(technicite)
  if (tech >= 4) coef += 0.15; else if (tech >= 3) coef += 0.05
  if (etatSol === "Boueux" || etatSol === "Boueuse") coef += 0.12
  if (etatSol === "Enneigé") coef += 0.10
  return coef
}

// 💥 CHARGE DE SÉANCE — effort réel fourni (0-200)
const calculerCharge = (s: Seance): number => {
  const v = (c: string) => parseInt(c) || 3
  const intensite = (v(s.cardio) + v(s.respiration)) / 10  // 0.2–1.0
  const dureeMin = parseDuree(s.duree)
  const coefSport: Record<string, number> = { trail: 1.0, vtt: 0.85, course: 0.75, velo: 0.65 }
  const cs = coefSport[s.sport] || 0.80
  const technicite = (s.sport === "trail" || s.sport === "vtt") ? s.technicite : "3"
  const coefEnv = getCoefTemperature(parseInt(s.temperature))
    * getCoefMeteo(s.meteo)
    * getCoefMoment(s.moment)
    * getCoefTerrain(technicite, (s.sport === "trail" || s.sport === "vtt") ? s.etatSol : "")
  return Math.round(Math.min(200, Math.max(0, intensite * (dureeMin / 90) * cs * coefEnv * 70)))
}

// 💚 FORME — état subjectif de récupération (0-100)
const calculerForme = (s: Seance): number => {
  const v = (c: string) => parseInt(c) || 3
  const raw = v(s.energie) * 0.25
    + (6 - v(s.fatigue)) * 0.25
    + v(s.sommeil) * 0.20
    + (6 - v(s.douleur)) * 0.15
    + v(s.motivation) * 0.15
  return Math.round(((raw - 1) / 4) * 100)
}

const calculerScore = (s: Seance) => {
  const v = (champ: string) => parseInt(champ) || 3
  const technicite = (s.sport === "trail" || s.sport === "vtt") ? s.technicite : "3"
  const scoreSNC = (v(technicite) * 0.5 + v(s.gestionEffort) * 0.3 + v(s.motivation) * 0.2) / 5 * 100
  const scoreMusculaire = (v(s.jambes) * 0.4 + (6 - v(s.douleur)) * 0.4 + v(s.energie) * 0.2) / 5 * 100
  const scoreCardio = (v(s.cardio) * 0.5 + v(s.respiration) * 0.5) / 5 * 100
  const scoreBrut = scoreSNC * 0.35 + scoreMusculaire * 0.35 + scoreCardio * 0.30
  const etatSolPourCoef = (s.sport === "trail" || s.sport === "vtt") ? s.etatSol : ""
  const coefTotal = getCoefTemperature(parseInt(s.temperature)) * getCoefMeteo(s.meteo) * getCoefMoment(s.moment) * getCoefTerrain(technicite, etatSolPourCoef)
  const scoreEnv = Math.min(100, scoreBrut * coefTotal)
  const coefHygiene = (v(s.sommeil) + v(s.hydratation) + v(s.nutrition) + (6 - v(s.fatigue))) / 20
  const scoreFinal = Math.round(scoreEnv * (0.85 + coefHygiene * 0.15))
  return {
    scoreFinal: Math.min(100, Math.max(0, scoreFinal)),
    scoreSNC: Math.round(scoreSNC),
    scoreMusculaire: Math.round(scoreMusculaire),
    scoreCardio: Math.round(scoreCardio),
  }
}

const sauvegarderSeance = (seance: Seance) => {
  const scores = calculerScore(seance)
  const charge = calculerCharge(seance)
  const forme = calculerForme(seance)
  const seanceSauvegardee = {
    id: Date.now().toString(), date: seance.date, sport: seance.sport,
    type: seance.type, parcours: seance.parcours, duree: seance.duree,
    distance: seance.distance, denivele: seance.denivele,
    meteo: seance.meteo, moment: seance.moment, temperature: seance.temperature,
    note: seance.note, score: scores.scoreFinal,
    score_snc: scores.scoreSNC, score_musculaire: scores.scoreMusculaire, score_cardio: scores.scoreCardio,
    charge, forme,
  }
  const existantes = JSON.parse(localStorage.getItem("seances") || "[]")
  existantes.unshift(seanceSauvegardee)
  localStorage.setItem("seances", JSON.stringify(existantes))
  return seanceSauvegardee
}

export default function Formulaire({ onFermer }: { onFermer: () => void }) {
  const [sectionIdx, setSectionIdx] = useState(0)
  const [seance, setSeance] = useState<Seance>({
    sport: "", type: "", parcours: "", date: new Date().toISOString().split("T")[0],
    duree: "", distance: "", denivele: "",
    temperature: "15", meteo: "", moment: "",
    etatSol: "", technicite: "3",
    surface: "", profilVelo: "",
    energie: "3", jambes: "3", cardio: "3", respiration: "3", douleur: "1",
    sommeil: "3", hydratation: "3", nutrition: "3", fatigue: "3",
    motivation: "3", ressenti: [], gestionEffort: "3",
    quantiteGlucides: "3", toleranceDigestive: "3", hydratationCourse: "3",
    note: ""
  })

  const maj = (champ: keyof Seance, valeur: string) => setSeance(prev => ({ ...prev, [champ]: valeur }))
  const toggleRessenti = (valeur: string) => setSeance(prev => ({
    ...prev, ressenti: prev.ressenti.includes(valeur)
      ? prev.ressenti.filter(r => r !== valeur)
      : [...prev.ressenti, valeur]
  }))

  const sections = getSections(seance.sport, seance.type)
  const sectionActuelle = sections[sectionIdx]
  const total = sections.length
  const numero = sectionIdx + 1

  const validerSeance = () => {
    const seanceSauvee = sauvegarderSeance(seance)
    alert(`Séance enregistrée ! 🎉\nScore de forme : ${seanceSauvee.score}/100`)
    onFermer()
  }

  const suivant = () => {
    if (sectionIdx < total - 1) setSectionIdx(i => i + 1)
    else validerSeance()
  }
  const precedent = () => setSectionIdx(i => Math.max(0, i - 1))

  const titreSection: Record<string, string> = {
    general: "Informations générales",
    objectif: "Données objectives",
    conditions: "Conditions",
    terrain: "Terrain",
    surface: "Surface",
    profil: "Profil du parcours",
    physique: "État physique",
    recuperation: "Récupération",
    mental: "État mental",
    nutrition: "Nutrition — Compétition",
    note: "Note libre",
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", zIndex: 100, overflowY: "auto", padding: "20px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", backgroundColor: "#121212", borderRadius: "16px", padding: "24px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", color: "white" }}>Nouvelle séance</h2>
          <button onClick={onFermer} style={{ backgroundColor: "transparent", border: "none", color: "#888", fontSize: "24px", cursor: "pointer" }}>✕</button>
        </div>

        {/* Barre de progression */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
          {sections.map((_, i) => (
            <div key={i} onClick={() => setSectionIdx(i)} style={{
              flex: 1, height: "4px",
              backgroundColor: i <= sectionIdx ? "#4CAF50" : "#2a2a2a",
              borderRadius: "2px", cursor: "pointer"
            }} />
          ))}
        </div>
        <p style={{ fontSize: "11px", color: "#555", marginBottom: "24px", textAlign: "right" }}>{numero}/{total}</p>

        {/* SECTION GÉNÉRALE */}
        {sectionActuelle === "general" && (
          <div>
            <p style={styleSectionTitre}>{numero} — {titreSection.general}</p>
            <label style={styleLabel}>Sport</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {sports.map(s => (
                <button key={s.id} onClick={() => { maj("sport", s.id); setSectionIdx(0) }} style={styleBouton(seance.sport === s.id)}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
            <label style={styleLabel}>Type</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {["Entraînement", "Compétition"].map(t => (
                <button key={t} onClick={() => maj("type", t)} style={styleBouton(seance.type === t)}>{t}</button>
              ))}
            </div>
            <label style={styleLabel}>Parcours (optionnel)</label>
            <input type="text" placeholder="Ex: Col du Galibier..." value={seance.parcours}
              onChange={e => maj("parcours", e.target.value)} style={styleInput} />
            <label style={styleLabel}>Date</label>
            <input type="date" value={seance.date} onChange={e => maj("date", e.target.value)}
              style={{ ...styleInput, colorScheme: "dark" }} />
          </div>
        )}

        {/* SECTION DONNÉES OBJECTIVES */}
        {sectionActuelle === "objectif" && (
          <div>
            <p style={styleSectionTitre}>{numero} — {titreSection.objectif}</p>
            <label style={styleLabel}>Durée (obligatoire)</label>
            <input type="text" placeholder="Ex: 1h30" value={seance.duree}
              onChange={e => maj("duree", e.target.value)} style={styleInput} />
            <label style={styleLabel}>Distance en km (optionnel)</label>
            <input type="number" placeholder="Ex: 12.5" value={seance.distance}
              onChange={e => maj("distance", e.target.value)} style={styleInput} />
            {(seance.sport === "trail" || seance.sport === "vtt" || seance.sport === "velo") && (
              <div>
                <label style={styleLabel}>Dénivelé positif D+ en mètres</label>
                <input type="number" placeholder="Ex: 800" value={seance.denivele}
                  onChange={e => maj("denivele", e.target.value)} style={styleInput} />
              </div>
            )}
          </div>
        )}

        {/* SECTION CONDITIONS */}
        {sectionActuelle === "conditions" && (
          <div>
            <p style={styleSectionTitre}>{numero} — {titreSection.conditions}</p>
            <label style={styleLabel}>Température ressentie : {seance.temperature}°C</label>
            <input type="range" min="-10" max="45" value={seance.temperature}
              onChange={e => maj("temperature", e.target.value)}
              style={{ width: "100%", marginBottom: "4px", accentColor: "#1a73e8" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#555", marginBottom: "20px" }}>
              <span>-10°C</span><span>45°C</span>
            </div>
            <label style={styleLabel}>Météo</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {[
                { id: "soleil", label: "☀️ Soleil" }, { id: "nuageux", label: "🌥️ Nuageux" },
                { id: "pluie", label: "🌧️ Pluie" }, { id: "vent", label: "💨 Vent" },
                { id: "neige", label: "❄️ Neige" }
              ].map(m => (
                <button key={m.id} onClick={() => maj("meteo", m.id)} style={styleBouton(seance.meteo === m.id)}>{m.label}</button>
              ))}
            </div>
            <label style={styleLabel}>Moment de la journée</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {[
                { id: "matin", label: "🌅 Matin" }, { id: "aprem", label: "🌞 Après-midi" },
                { id: "soir", label: "🌆 Soir" }, { id: "nuit", label: "🌙 Nuit" }
              ].map(m => (
                <button key={m.id} onClick={() => maj("moment", m.id)} style={styleBouton(seance.moment === m.id)}>{m.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* SECTION TERRAIN (trail / vtt) */}
        {sectionActuelle === "terrain" && (
          <div>
            <p style={styleSectionTitre}>{numero} — {titreSection.terrain}</p>
            <label style={styleLabel}>État du sol</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {["Sec", "Boueux", "Enneigé", "Rocheux"].map(e => (
                <button key={e} onClick={() => maj("etatSol", e)} style={styleBouton(seance.etatSol === e)}>{e}</button>
              ))}
            </div>
            <Slider label="Technicité du terrain" valeur={seance.technicite} onChange={v => maj("technicite", v)}
              labelMin="Très roulant" labelMax="Très technique" />
          </div>
        )}

        {/* SECTION SURFACE (course à pied) */}
        {sectionActuelle === "surface" && (
          <div>
            <p style={styleSectionTitre}>{numero} — {titreSection.surface}</p>
            <label style={styleLabel}>Type de surface</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {["Route", "Piste d'athlétisme", "Chemin / Trail", "Tapis roulant"].map(s => (
                <button key={s} onClick={() => maj("surface", s)} style={styleBouton(seance.surface === s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* SECTION PROFIL (vélo route) */}
        {sectionActuelle === "profil" && (
          <div>
            <p style={styleSectionTitre}>{numero} — {titreSection.profil}</p>
            <label style={styleLabel}>Profil du parcours</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {["Plat", "Vallonné", "Montagneux"].map(p => (
                <button key={p} onClick={() => maj("profilVelo", p)} style={styleBouton(seance.profilVelo === p)}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {/* SECTION ÉTAT PHYSIQUE */}
        {sectionActuelle === "physique" && (
          <div>
            <p style={styleSectionTitre}>{numero} — {titreSection.physique}</p>
            <Slider label="Énergie globale" valeur={seance.energie} onChange={v => maj("energie", v)} labelMin="Épuisé" labelMax="Au top" />
            <Slider label="Sensation des jambes" valeur={seance.jambes} onChange={v => maj("jambes", v)} labelMin="Très lourdes" labelMax="Très légères" />
            <Slider label="Effort cardio" valeur={seance.cardio} onChange={v => maj("cardio", v)} labelMin="Très facile" labelMax="Effort maximal" />
            <Slider label="Difficulté respiratoire" valeur={seance.respiration} onChange={v => maj("respiration", v)} labelMin="Facile" labelMax="Très difficile" />
            <Slider label="Niveau de douleur / gêne" valeur={seance.douleur} onChange={v => maj("douleur", v)} labelMin="Aucune douleur" labelMax="Douleur intense" />
          </div>
        )}

        {/* SECTION RÉCUPÉRATION */}
        {sectionActuelle === "recuperation" && (
          <div>
            <p style={styleSectionTitre}>{numero} — {titreSection.recuperation}</p>
            <Slider label="Qualité du sommeil la veille" valeur={seance.sommeil} onChange={v => maj("sommeil", v)} labelMin="Très mauvaise" labelMax="Excellente" />
            <Slider label="Hydratation avant séance" valeur={seance.hydratation} onChange={v => maj("hydratation", v)} labelMin="Très déshydraté" labelMax="Très bien hydraté" />
            <Slider label="Nutrition avant séance" valeur={seance.nutrition} onChange={v => maj("nutrition", v)} labelMin="Insuffisant" labelMax="Parfaitement nutritionné" />
            <Slider label="Fatigue cumulée" valeur={seance.fatigue} onChange={v => maj("fatigue", v)} labelMin="Très fatigué" labelMax="Totalement reposé" />
          </div>
        )}

        {/* SECTION MENTAL */}
        {sectionActuelle === "mental" && (
          <div>
            <p style={styleSectionTitre}>{numero} — {titreSection.mental}</p>
            <Slider label="Motivation avant séance" valeur={seance.motivation} onChange={v => maj("motivation", v)} labelMin="Aucune motivation" labelMax="Ultra motivé" />
            <label style={styleLabel}>Ressenti pendant (plusieurs choix possibles)</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {[
                { id: "plaisir", label: "😊 Plaisir" }, { id: "neutre", label: "😐 Neutre" },
                { id: "ennui", label: "😑 Ennui" }, { id: "souffrance", label: "😣 Souffrance" },
                { id: "combatif", label: "💪 Combatif" }
              ].map(r => (
                <button key={r.id} onClick={() => toggleRessenti(r.id)} style={styleBouton(seance.ressenti.includes(r.id))}>{r.label}</button>
              ))}
            </div>
            <Slider label="Gestion de l'effort" valeur={seance.gestionEffort} onChange={v => maj("gestionEffort", v)} labelMin="Parti trop vite" labelMax="Parfaitement géré" />
          </div>
        )}

        {/* SECTION NUTRITION — compétition uniquement */}
        {sectionActuelle === "nutrition" && (
          <div>
            <p style={styleSectionTitre}>{numero} — {titreSection.nutrition}</p>
            <div style={{ backgroundColor: "#1a2a1a", border: "1px solid #4CAF50", borderRadius: "8px", padding: "12px", marginBottom: "20px" }}>
              <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>
                🏁 Cette section concerne uniquement la gestion nutritionnelle <strong style={{ color: "white" }}>pendant</strong> l'effort en compétition.
              </p>
            </div>
            <Slider label="Apport en glucides (gels, barres, boissons)" valeur={seance.quantiteGlucides} onChange={v => maj("quantiteGlucides", v)} labelMin="Très insuffisant" labelMax="Très bien géré" />
            <Slider label="Tolérance digestive" valeur={seance.toleranceDigestive} onChange={v => maj("toleranceDigestive", v)} labelMin="Gros problèmes" labelMax="Aucun souci" />
            <Slider label="Hydratation pendant l'effort" valeur={seance.hydratationCourse} onChange={v => maj("hydratationCourse", v)} labelMin="Très insuffisant" labelMax="Parfaite" />
          </div>
        )}

        {/* SECTION NOTE LIBRE */}
        {sectionActuelle === "note" && (
          <div>
            <p style={styleSectionTitre}>{numero} — {titreSection.note}</p>
            <label style={styleLabel}>Sensations, contexte, remarques personnelles...</label>
            <textarea value={seance.note} onChange={e => maj("note", e.target.value)}
              placeholder="Comment s'est vraiment passée cette séance ?" rows={8}
              style={{ ...styleInput, resize: "vertical", lineHeight: "1.6" }} />
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px" }}>
          <button onClick={precedent} style={{
            padding: "14px 24px",
            backgroundColor: sectionIdx === 0 ? "transparent" : "#2a2a2a",
            color: sectionIdx === 0 ? "transparent" : "white",
            border: "none", borderRadius: "10px", fontSize: "15px",
            cursor: sectionIdx === 0 ? "default" : "pointer"
          }}>
            ← Précédent
          </button>
          <button onClick={suivant} style={{
            padding: "14px 24px", backgroundColor: "#4CAF50",
            color: "white", border: "none", borderRadius: "10px",
            fontSize: "15px", fontWeight: "bold", cursor: "pointer"
          }}>
            {sectionIdx === total - 1 ? "Valider ✓" : "Suivant →"}
          </button>
        </div>

      </div>
    </div>
  )
}
