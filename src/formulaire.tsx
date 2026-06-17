import { useState } from "react"

interface Seance {
  sport: string; type: string; parcours: string; date: string
  duree: string; distance: string; denivele: string
  temperature: string; meteo: string; moment: string
  etatSol: string; technicite: string
  surface: string
  profilVelo: string
  energie: string; jambes: string; cardio: string
  respiration: string; douleur: string
  sommeil: string; hydratation: string; nutrition: string; fatigue: string
  motivation: string; ressenti: string[]; gestionEffort: string
  quantiteGlucides: string; toleranceDigestive: string; hydratationCourse: string
  note: string
}

// ─── Styles de base ──────────────────────────────────────────────────────────

const sLabel = {
  fontSize: 12, color: "var(--ft-muted)", marginBottom: 8,
  display: "block" as const, letterSpacing: "0.02em"
}

const sInput = {
  width: "100%", padding: "12px 14px",
  background: "var(--ft-surface)", border: "none",
  borderRadius: "var(--ft-r-input)", color: "var(--ft-ink)",
  fontSize: 15, outline: "none", marginBottom: 16,
  fontFamily: "var(--ft-font-body)"
} as const

const sTitre = {
  fontFamily: "var(--ft-font-display)", fontSize: 17, fontWeight: 700,
  color: "var(--ft-ink)", marginBottom: 20, paddingBottom: 10,
  borderBottom: "1px solid var(--ft-line)"
} as const

// Chip bouton — actif = pastel coloré, inactif = gris doux
const sChip = (actif: boolean) => ({
  padding: "9px 16px",
  background: actif ? "rgba(124,111,240,0.12)" : "var(--ft-surface)",
  color: actif ? "var(--ft-snc)" : "var(--ft-muted)",
  border: actif ? "1.5px solid rgba(124,111,240,0.35)" : "1.5px solid transparent",
  borderRadius: "var(--ft-r-chip)", fontSize: 13, fontWeight: actif ? 600 : 400,
  cursor: "pointer", marginRight: 8, marginBottom: 8,
  fontFamily: "var(--ft-font-body)", transition: "all 0.15s ease"
})

// ─── Données statiques ───────────────────────────────────────────────────────

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

// ─── Composant Slider ─────────────────────────────────────────────────────────

const Slider = ({ label, valeur, onChange, min = "1", max = "5", labelMin, labelMax, accent = "var(--ft-muscle)" }: {
  label: string; valeur: string; onChange: (v: string) => void
  min?: string; max?: string; labelMin: string; labelMax: string; accent?: string
}) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
      <label style={sLabel}>{label}</label>
      <span style={{ fontFamily: "var(--ft-font-data)", fontSize: 15, fontWeight: 500, color: "var(--ft-ink)" }}>
        {valeur}<span style={{ fontSize: 11, color: "var(--ft-muted)" }}>/{max}</span>
      </span>
    </div>
    <input type="range" min={min} max={max} value={valeur}
      onChange={e => onChange(e.target.value)}
      style={{ width: "100%", accentColor: accent, marginBottom: 4 }} />
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ft-muted)" }}>
      <span>{labelMin}</span><span>{labelMax}</span>
    </div>
  </div>
)

// ─── Calculs ─────────────────────────────────────────────────────────────────

const parseDuree = (duree: string): number => {
  if (!duree) return 60
  const c = duree.toLowerCase().replace(/\s/g, "")
  const hm = c.match(/(\d+)h(\d+)?/)
  if (hm) return parseInt(hm[1]) * 60 + parseInt(hm[2] || "0")
  const m = c.match(/(\d+)/)
  return m ? parseInt(m[1]) : 60
}

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

const calculerCharge = (s: Seance): number => {
  const v = (c: string) => parseInt(c) || 3
  const intensite = (v(s.cardio) + v(s.respiration)) / 10
  const dureeMin = parseDuree(s.duree)
  const coefSport: Record<string, number> = { trail: 1.0, vtt: 0.85, course: 0.75, velo: 0.65 }
  const cs = coefSport[s.sport] || 0.80
  const technicite = (s.sport === "trail" || s.sport === "vtt") ? s.technicite : "3"
  const coefEnv = getCoefTemperature(parseInt(s.temperature))
    * getCoefMeteo(s.meteo) * getCoefMoment(s.moment)
    * getCoefTerrain(technicite, (s.sport === "trail" || s.sport === "vtt") ? s.etatSol : "")
  return Math.round(Math.min(200, Math.max(0, intensite * (dureeMin / 90) * cs * coefEnv * 70)))
}

const calculerForme = (s: Seance): number => {
  const v = (c: string) => parseInt(c) || 3
  const raw = v(s.energie) * 0.25 + (6 - v(s.fatigue)) * 0.25
    + v(s.sommeil) * 0.20 + (6 - v(s.douleur)) * 0.15 + v(s.motivation) * 0.15
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
  const coefTotal = getCoefTemperature(parseInt(s.temperature))
    * getCoefMeteo(s.meteo) * getCoefMoment(s.moment)
    * getCoefTerrain(technicite, etatSolPourCoef)
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

// ─── Composant principal ──────────────────────────────────────────────────────

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
    const s = sauvegarderSeance(seance)
    alert(`Séance enregistrée !\nCharge : ${s.charge}  ·  Forme : ${s.forme}/100`)
    onFermer()
  }

  const suivant = () => {
    if (sectionIdx < total - 1) setSectionIdx(i => i + 1)
    else validerSeance()
  }
  const precedent = () => setSectionIdx(i => Math.max(0, i - 1))

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(33,27,46,0.65)", backdropFilter: "blur(8px)",
      zIndex: 100, overflowY: "auto", padding: "20px"
    }}>
      <div style={{
        maxWidth: 480, margin: "0 auto",
        background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
        padding: 24, boxShadow: "var(--ft-shadow-lift)"
      }}>

        {/* En-tête */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{
            fontFamily: "var(--ft-font-display)", fontSize: 20, fontWeight: 700,
            color: "var(--ft-ink)", margin: 0
          }}>Nouvelle séance</h2>
          <button onClick={onFermer} style={{
            background: "var(--ft-surface)", border: "none", color: "var(--ft-muted)",
            fontSize: 18, cursor: "pointer", width: 34, height: 34,
            borderRadius: "var(--ft-r-orb)", display: "flex",
            alignItems: "center", justifyContent: "center"
          }}>✕</button>
        </div>

        {/* Barre de progression */}
        <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
          {sections.map((_, i) => (
            <div key={i} onClick={() => setSectionIdx(i)} style={{
              flex: 1, height: 4,
              background: i <= sectionIdx ? "var(--ft-snc)" : "var(--ft-line)",
              borderRadius: 999, cursor: "pointer",
              transition: "background 0.2s ease"
            }} />
          ))}
        </div>
        <p style={{
          fontFamily: "var(--ft-font-data)", fontSize: 11,
          color: "var(--ft-muted)", marginBottom: 24, textAlign: "right"
        }}>{numero}/{total}</p>

        {/* ── GÉNÉRAL ── */}
        {sectionActuelle === "general" && (
          <div>
            <p style={sTitre}>{numero} — {titreSection.general}</p>
            <span style={sLabel}>Sport</span>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 16 }}>
              {sports.map(s => (
                <button key={s.id} onClick={() => { maj("sport", s.id); setSectionIdx(0) }}
                  style={sChip(seance.sport === s.id)}>
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
            <span style={sLabel}>Type</span>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 16 }}>
              {["Entraînement", "Compétition"].map(t => (
                <button key={t} onClick={() => maj("type", t)} style={sChip(seance.type === t)}>{t}</button>
              ))}
            </div>
            <span style={sLabel}>Parcours (optionnel)</span>
            <input type="text" placeholder="Ex: Col du Galibier…" value={seance.parcours}
              onChange={e => maj("parcours", e.target.value)} style={sInput} />
            <span style={sLabel}>Date</span>
            <input type="date" value={seance.date} onChange={e => maj("date", e.target.value)}
              style={{ ...sInput, colorScheme: "light" }} />
          </div>
        )}

        {/* ── DONNÉES OBJECTIVES ── */}
        {sectionActuelle === "objectif" && (
          <div>
            <p style={sTitre}>{numero} — {titreSection.objectif}</p>
            <span style={sLabel}>Durée (obligatoire)</span>
            <input type="text" placeholder="Ex: 1h30" value={seance.duree}
              onChange={e => maj("duree", e.target.value)} style={sInput} />
            <span style={sLabel}>Distance en km (optionnel)</span>
            <input type="number" placeholder="Ex: 12.5" value={seance.distance}
              onChange={e => maj("distance", e.target.value)} style={sInput} />
            {(seance.sport === "trail" || seance.sport === "vtt" || seance.sport === "velo") && (
              <>
                <span style={sLabel}>Dénivelé positif D+ en mètres</span>
                <input type="number" placeholder="Ex: 800" value={seance.denivele}
                  onChange={e => maj("denivele", e.target.value)} style={sInput} />
              </>
            )}
          </div>
        )}

        {/* ── CONDITIONS ── */}
        {sectionActuelle === "conditions" && (
          <div>
            <p style={sTitre}>{numero} — {titreSection.conditions}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
              <span style={sLabel}>Température ressentie</span>
              <span style={{ fontFamily: "var(--ft-font-data)", fontSize: 15, fontWeight: 500, color: "var(--ft-ink)" }}>
                {seance.temperature}°C
              </span>
            </div>
            <input type="range" min="-10" max="45" value={seance.temperature}
              onChange={e => maj("temperature", e.target.value)}
              style={{ width: "100%", marginBottom: 4, accentColor: "var(--ft-cardio)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ft-muted)", marginBottom: 20 }}>
              <span>-10°C</span><span>45°C</span>
            </div>
            <span style={sLabel}>Météo</span>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 16 }}>
              {[
                { id: "soleil", label: "☀️ Soleil" }, { id: "nuageux", label: "🌥️ Nuageux" },
                { id: "pluie", label: "🌧️ Pluie" }, { id: "vent", label: "💨 Vent" },
                { id: "neige", label: "❄️ Neige" }
              ].map(m => (
                <button key={m.id} onClick={() => maj("meteo", m.id)} style={sChip(seance.meteo === m.id)}>{m.label}</button>
              ))}
            </div>
            <span style={sLabel}>Moment de la journée</span>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 16 }}>
              {[
                { id: "matin", label: "🌅 Matin" }, { id: "aprem", label: "🌞 Après-midi" },
                { id: "soir", label: "🌆 Soir" }, { id: "nuit", label: "🌙 Nuit" }
              ].map(m => (
                <button key={m.id} onClick={() => maj("moment", m.id)} style={sChip(seance.moment === m.id)}>{m.label}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── TERRAIN (trail / vtt) ── */}
        {sectionActuelle === "terrain" && (
          <div>
            <p style={sTitre}>{numero} — {titreSection.terrain}</p>
            <span style={sLabel}>État du sol</span>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 16 }}>
              {["Sec", "Boueux", "Enneigé", "Rocheux"].map(e => (
                <button key={e} onClick={() => maj("etatSol", e)} style={sChip(seance.etatSol === e)}>{e}</button>
              ))}
            </div>
            <Slider label="Technicité du terrain" valeur={seance.technicite}
              onChange={v => maj("technicite", v)} labelMin="Très roulant" labelMax="Très technique"
              accent="var(--ft-snc)" />
          </div>
        )}

        {/* ── SURFACE (course à pied) ── */}
        {sectionActuelle === "surface" && (
          <div>
            <p style={sTitre}>{numero} — {titreSection.surface}</p>
            <span style={sLabel}>Type de surface</span>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 16 }}>
              {["Route", "Piste d'athlétisme", "Chemin / Trail", "Tapis roulant"].map(s => (
                <button key={s} onClick={() => maj("surface", s)} style={sChip(seance.surface === s)}>{s}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── PROFIL (vélo route) ── */}
        {sectionActuelle === "profil" && (
          <div>
            <p style={sTitre}>{numero} — {titreSection.profil}</p>
            <span style={sLabel}>Profil du parcours</span>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 16 }}>
              {["Plat", "Vallonné", "Montagneux"].map(p => (
                <button key={p} onClick={() => maj("profilVelo", p)} style={sChip(seance.profilVelo === p)}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── ÉTAT PHYSIQUE ── */}
        {sectionActuelle === "physique" && (
          <div>
            <p style={sTitre}>{numero} — {titreSection.physique}</p>
            <Slider label="Énergie globale" valeur={seance.energie} onChange={v => maj("energie", v)}
              labelMin="Épuisé" labelMax="Au top" />
            <Slider label="Sensation des jambes" valeur={seance.jambes} onChange={v => maj("jambes", v)}
              labelMin="Très lourdes" labelMax="Très légères" />
            <Slider label="Effort cardio" valeur={seance.cardio} onChange={v => maj("cardio", v)}
              labelMin="Très facile" labelMax="Effort maximal" accent="var(--ft-cardio)" />
            <Slider label="Difficulté respiratoire" valeur={seance.respiration} onChange={v => maj("respiration", v)}
              labelMin="Facile" labelMax="Très difficile" accent="var(--ft-cardio)" />
            <Slider label="Niveau de douleur / gêne" valeur={seance.douleur} onChange={v => maj("douleur", v)}
              labelMin="Aucune douleur" labelMax="Douleur intense" accent="#F44336" />
          </div>
        )}

        {/* ── RÉCUPÉRATION ── */}
        {sectionActuelle === "recuperation" && (
          <div>
            <p style={sTitre}>{numero} — {titreSection.recuperation}</p>
            <Slider label="Qualité du sommeil la veille" valeur={seance.sommeil} onChange={v => maj("sommeil", v)}
              labelMin="Très mauvaise" labelMax="Excellente" />
            <Slider label="Hydratation avant séance" valeur={seance.hydratation} onChange={v => maj("hydratation", v)}
              labelMin="Très déshydraté" labelMax="Très bien hydraté" accent="var(--ft-cardio)" />
            <Slider label="Nutrition avant séance" valeur={seance.nutrition} onChange={v => maj("nutrition", v)}
              labelMin="Insuffisant" labelMax="Parfaitement nutritionné" />
            <Slider label="Fatigue cumulée" valeur={seance.fatigue} onChange={v => maj("fatigue", v)}
              labelMin="Très fatigué" labelMax="Totalement reposé" />
          </div>
        )}

        {/* ── MENTAL ── */}
        {sectionActuelle === "mental" && (
          <div>
            <p style={sTitre}>{numero} — {titreSection.mental}</p>
            <Slider label="Motivation avant séance" valeur={seance.motivation} onChange={v => maj("motivation", v)}
              labelMin="Aucune motivation" labelMax="Ultra motivé" accent="var(--ft-snc)" />
            <span style={sLabel}>Ressenti pendant (plusieurs choix possibles)</span>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 16 }}>
              {[
                { id: "plaisir", label: "😊 Plaisir" }, { id: "neutre", label: "😐 Neutre" },
                { id: "ennui", label: "😑 Ennui" }, { id: "souffrance", label: "😣 Souffrance" },
                { id: "combatif", label: "💪 Combatif" }
              ].map(r => (
                <button key={r.id} onClick={() => toggleRessenti(r.id)}
                  style={sChip(seance.ressenti.includes(r.id))}>{r.label}</button>
              ))}
            </div>
            <Slider label="Gestion de l'effort" valeur={seance.gestionEffort} onChange={v => maj("gestionEffort", v)}
              labelMin="Parti trop vite" labelMax="Parfaitement géré" accent="var(--ft-snc)" />
          </div>
        )}

        {/* ── NUTRITION (compétition) ── */}
        {sectionActuelle === "nutrition" && (
          <div>
            <p style={sTitre}>{numero} — {titreSection.nutrition}</p>
            <div style={{
              background: "var(--ft-surface)", borderRadius: "var(--ft-r-btn)",
              padding: 14, marginBottom: 20,
              borderLeft: "4px solid var(--ft-cardio)"
            }}>
              <p style={{ fontSize: 12, color: "var(--ft-muted)", margin: 0, lineHeight: 1.6 }}>
                🏁 Cette section concerne la gestion nutritionnelle <strong style={{ color: "var(--ft-ink)" }}>pendant</strong> l'effort en compétition.
              </p>
            </div>
            <Slider label="Apport en glucides (gels, barres, boissons)" valeur={seance.quantiteGlucides}
              onChange={v => maj("quantiteGlucides", v)} labelMin="Très insuffisant" labelMax="Très bien géré" />
            <Slider label="Tolérance digestive" valeur={seance.toleranceDigestive}
              onChange={v => maj("toleranceDigestive", v)} labelMin="Gros problèmes" labelMax="Aucun souci" />
            <Slider label="Hydratation pendant l'effort" valeur={seance.hydratationCourse}
              onChange={v => maj("hydratationCourse", v)} labelMin="Très insuffisant" labelMax="Parfaite"
              accent="var(--ft-cardio)" />
          </div>
        )}

        {/* ── NOTE LIBRE ── */}
        {sectionActuelle === "note" && (
          <div>
            <p style={sTitre}>{numero} — {titreSection.note}</p>
            <span style={sLabel}>Sensations, contexte, remarques personnelles…</span>
            <textarea value={seance.note} onChange={e => maj("note", e.target.value)}
              placeholder="Comment s'est vraiment passée cette séance ?" rows={8}
              style={{
                ...sInput, resize: "vertical", lineHeight: 1.6,
                fontFamily: "var(--ft-font-body)"
              }} />
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, gap: 12 }}>
          <button onClick={precedent} style={{
            padding: "13px 20px",
            background: sectionIdx === 0 ? "transparent" : "var(--ft-surface)",
            color: sectionIdx === 0 ? "transparent" : "var(--ft-muted)",
            border: "none", borderRadius: "var(--ft-r-btn)",
            fontSize: 14, cursor: sectionIdx === 0 ? "default" : "pointer",
            fontFamily: "var(--ft-font-body)", pointerEvents: sectionIdx === 0 ? "none" : "auto"
          }}>
            ← Précédent
          </button>
          <button onClick={suivant} style={{
            flex: 1, padding: "13px 20px",
            background: "var(--ft-snc)", color: "#fff", border: "none",
            borderRadius: "var(--ft-r-btn)", fontSize: 15, fontWeight: 700,
            cursor: "pointer", fontFamily: "var(--ft-font-body)",
            boxShadow: "0 6px 20px rgba(124,111,240,0.35)"
          }}>
            {sectionIdx === total - 1 ? "Enregistrer ma séance ✓" : "Suivant →"}
          </button>
        </div>

      </div>
    </div>
  )
}
