import { useState } from "react"

// 📋 Types — structure complète d'une séance
interface Seance {
  sport: string; type: string; parcours: string; date: string
  duree: string; distance: string; denivele: string
  temperature: string; meteo: string; moment: string
  surface: string; etatSol: string; technicite: string
  energie: string; jambes: string; cardio: string
  respiration: string; douleur: string; crampes: string
  sommeil: string; hydratation: string; nutrition: string; fatigue: string
  motivation: string; ressenti: string[]; gestionEffort: string
  note: string
}

const styleSectionTitre = { fontSize: "16px", fontWeight: "bold" as const, color: "#ffffff", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #2a2a2a" }
const styleLabel = { fontSize: "13px", color: "#888", marginBottom: "6px", display: "block" as const }
const styleInput = { width: "100%", padding: "12px", backgroundColor: "#2a2a2a", border: "1px solid #333", borderRadius: "8px", color: "white", fontSize: "15px", outline: "none", marginBottom: "16px" }
const styleBouton = (actif: boolean, couleur = "#1a73e8") => ({ padding: "10px 16px", backgroundColor: actif ? couleur : "#2a2a2a", color: actif ? "white" : "#888", border: actif ? `1px solid ${couleur}` : "1px solid #333", borderRadius: "8px", fontSize: "14px", cursor: "pointer", marginRight: "8px", marginBottom: "8px" })

const sports = [
  { id: "course", label: "Course à pied", emoji: "🏃" },
  { id: "trail", label: "Trail", emoji: "🌄" },
  { id: "vtt", label: "VTT", emoji: "🚵" },
  { id: "velo", label: "Vélo route", emoji: "🚴" },
  { id: "natation", label: "Natation", emoji: "🏊" },
  { id: "muscu", label: "Musculation", emoji: "🏋️" },
  { id: "crossfit", label: "CrossFit", emoji: "💪" },
]

const Slider = ({ label, valeur, onChange, min = "1", max = "5", labelMin, labelMax }: {
  label: string; valeur: string; onChange: (v: string) => void; min?: string; max?: string; labelMin: string; labelMax: string
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
  if (etatSol === "Boueux") coef += 0.12; if (etatSol === "Enneigé") coef += 0.10
  return coef
}

const calculerScore = (s: Seance) => {
  const v = (champ: string) => parseInt(champ) || 3
  const scoreSNC = (v(s.technicite) * 0.5 + v(s.gestionEffort) * 0.3 + v(s.motivation) * 0.2) / 5 * 100
  const scoreMusculaire = (v(s.jambes) * 0.4 + (6 - v(s.douleur)) * 0.4 + v(s.energie) * 0.2) / 5 * 100
  const scoreCardio = (v(s.cardio) * 0.5 + v(s.respiration) * 0.5) / 5 * 100
  const scoreBrut = scoreSNC * 0.35 + scoreMusculaire * 0.35 + scoreCardio * 0.30
  const coefTotal = getCoefTemperature(parseInt(s.temperature)) * getCoefMeteo(s.meteo) * getCoefMoment(s.moment) * getCoefTerrain(s.technicite, s.etatSol)
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
  const seanceSauvegardee = {
    id: Date.now().toString(), date: seance.date, sport: seance.sport,
    type: seance.type, parcours: seance.parcours, duree: seance.duree,
    distance: seance.distance, denivele: seance.denivele,
    meteo: seance.meteo, moment: seance.moment, temperature: seance.temperature,
    note: seance.note, score: scores.scoreFinal,
    score_snc: scores.scoreSNC, score_musculaire: scores.scoreMusculaire, score_cardio: scores.scoreCardio,
  }
  const existantes = JSON.parse(localStorage.getItem("seances") || "[]")
  existantes.unshift(seanceSauvegardee)
  localStorage.setItem("seances", JSON.stringify(existantes))
  return seanceSauvegardee
}

export default function Formulaire({ onFermer }: { onFermer: () => void }) {
  const [sectionActive, setSectionActive] = useState(1)
  const [seance, setSeance] = useState<Seance>({
    sport: "", type: "", parcours: "", date: new Date().toISOString().split("T")[0],
    duree: "", distance: "", denivele: "",
    temperature: "15", meteo: "", moment: "",
    surface: "", etatSol: "", technicite: "3",
    energie: "3", jambes: "3", cardio: "3", respiration: "3", douleur: "1", crampes: "non",
    sommeil: "3", hydratation: "3", nutrition: "3", fatigue: "3",
    motivation: "3", ressenti: [], gestionEffort: "3", note: ""
  })

  const maj = (champ: keyof Seance, valeur: string) => setSeance(prev => ({ ...prev, [champ]: valeur }))
  const toggleRessenti = (valeur: string) => setSeance(prev => ({
    ...prev, ressenti: prev.ressenti.includes(valeur) ? prev.ressenti.filter(r => r !== valeur) : [...prev.ressenti, valeur]
  }))

  const validerSeance = () => {
    const seanceSauvee = sauvegarderSeance(seance)
    alert(`Séance enregistrée ! 🎉\nScore de forme : ${seanceSauvee.score}/100`)
    onFermer()
  }

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.9)", zIndex: 100, overflowY: "auto", padding: "20px" }}>
      <div style={{ maxWidth: "480px", margin: "0 auto", backgroundColor: "#121212", borderRadius: "16px", padding: "24px" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "20px", color: "white" }}>Nouvelle séance</h2>
          <button onClick={onFermer} style={{ backgroundColor: "transparent", border: "none", color: "#888", fontSize: "24px", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
          {[1,2,3,4,5,6,7,8].map(n => (
            <div key={n} onClick={() => setSectionActive(n)} style={{ flex: 1, height: "4px", backgroundColor: n <= sectionActive ? "#4CAF50" : "#2a2a2a", borderRadius: "2px", cursor: "pointer" }}/>
          ))}
        </div>
        <p style={{ fontSize: "11px", color: "#555", marginBottom: "24px", textAlign: "right" }}>{sectionActive}/8</p>

        {sectionActive === 1 && (
          <div>
            <p style={styleSectionTitre}>1 — Informations générales</p>
            <label style={styleLabel}>Sport</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {sports.map(s => <button key={s.id} onClick={() => maj("sport", s.id)} style={styleBouton(seance.sport === s.id)}>{s.emoji} {s.label}</button>)}
            </div>
            <label style={styleLabel}>Type</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {["Entraînement","Compétition"].map(t => <button key={t} onClick={() => maj("type", t)} style={styleBouton(seance.type === t)}>{t}</button>)}
            </div>
            <label style={styleLabel}>Parcours (optionnel)</label>
            <input type="text" placeholder="Ex: Forêt de Tronçais..." value={seance.parcours} onChange={e => maj("parcours", e.target.value)} style={styleInput} />
            <label style={styleLabel}>Date</label>
            <input type="date" value={seance.date} onChange={e => maj("date", e.target.value)} style={{ ...styleInput, colorScheme: "dark" }} />
          </div>
        )}

        {sectionActive === 2 && (
          <div>
            <p style={styleSectionTitre}>2 — Données objectives</p>
            <label style={styleLabel}>Durée (obligatoire)</label>
            <input type="text" placeholder="Ex: 1h30" value={seance.duree} onChange={e => maj("duree", e.target.value)} style={styleInput} />
            <label style={styleLabel}>Distance en km (optionnel)</label>
            <input type="number" placeholder="Ex: 12.5" value={seance.distance} onChange={e => maj("distance", e.target.value)} style={styleInput} />
            <label style={styleLabel}>Dénivelé positif D+ en mètres (optionnel)</label>
            <input type="number" placeholder="Ex: 450" value={seance.denivele} onChange={e => maj("denivele", e.target.value)} style={styleInput} />
          </div>
        )}

        {sectionActive === 3 && (
          <div>
            <p style={styleSectionTitre}>3 — Conditions environnementales</p>
            <label style={styleLabel}>Température ressentie : {seance.temperature}°C</label>
            <input type="range" min="-10" max="45" value={seance.temperature} onChange={e => maj("temperature", e.target.value)} style={{ width: "100%", marginBottom: "4px", accentColor: "#1a73e8" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#555", marginBottom: "20px" }}><span>-10°C</span><span>45°C</span></div>
            <label style={styleLabel}>Météo</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {[{id:"soleil",label:"☀️ Soleil"},{id:"nuageux",label:"🌥️ Nuageux"},{id:"pluie",label:"🌧️ Pluie"},{id:"vent",label:"💨 Vent"},{id:"neige",label:"❄️ Neige"}].map(m => (
                <button key={m.id} onClick={() => maj("meteo", m.id)} style={styleBouton(seance.meteo === m.id)}>{m.label}</button>
              ))}
            </div>
            <label style={styleLabel}>Moment de la journée</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {[{id:"matin",label:"🌅 Matin"},{id:"aprem",label:"🌞 Après-midi"},{id:"soir",label:"🌆 Soir"},{id:"nuit",label:"🌙 Nuit"}].map(m => (
                <button key={m.id} onClick={() => maj("moment", m.id)} style={styleBouton(seance.moment === m.id)}>{m.label}</button>
              ))}
            </div>
          </div>
        )}

        {sectionActive === 4 && (
          <div>
            <p style={styleSectionTitre}>4 — Terrain</p>
            <label style={styleLabel}>Type de surface</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {(seance.sport === "velo" ? ["Route","Piste cyclable","Voie verte"] : seance.sport === "natation" ? ["Piscine","Eau libre","Mer"] : seance.sport === "muscu" || seance.sport === "crossfit" ? ["Salle","Extérieur"] : ["Route","Trail","Chemin","Tapis"]).map(s => (
                <button key={s} onClick={() => maj("surface", s)} style={styleBouton(seance.surface === s)}>{s}</button>
              ))}
            </div>
            {!["natation","muscu","crossfit"].includes(seance.sport) && (
              <>
                <label style={styleLabel}>État du sol</label>
                <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
                  {(seance.sport === "velo" ? ["Sèche","Mouillée","Gravillonnée"] : ["Sec","Boueux","Enneigé"]).map(e => (
                    <button key={e} onClick={() => maj("etatSol", e)} style={styleBouton(seance.etatSol === e)}>{e}</button>
                  ))}
                </div>
              </>
            )}
            {seance.sport === "natation" && (
              <>
                <label style={styleLabel}>Conditions</label>
                <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
                  {["Calme","Agité","Courant","Froid"].map(c => <button key={c} onClick={() => maj("etatSol", c)} style={styleBouton(seance.etatSol === c)}>{c}</button>)}
                </div>
              </>
            )}
            {!["natation","muscu","crossfit"].includes(seance.sport) && (
              <Slider label="Technicité" valeur={seance.technicite} onChange={v => maj("technicite", v)} labelMin="Très roulant" labelMax="Très technique" />
            )}
          </div>
        )}

        {sectionActive === 5 && (
          <div>
            <p style={styleSectionTitre}>5 — État physique</p>
            <Slider label="Énergie globale" valeur={seance.energie} onChange={v => maj("energie", v)} labelMin="Épuisé" labelMax="Au top" />
            <Slider label="Sensation des jambes" valeur={seance.jambes} onChange={v => maj("jambes", v)} labelMin="Très lourdes" labelMax="Très légères" />
            <Slider label="Effort cardio" valeur={seance.cardio} onChange={v => maj("cardio", v)} labelMin="Très facile" labelMax="Effort maximal" />
            <Slider label="Difficulté respiratoire" valeur={seance.respiration} onChange={v => maj("respiration", v)} labelMin="Facile" labelMax="Très difficile" />
            <Slider label="Niveau de douleur" valeur={seance.douleur} onChange={v => maj("douleur", v)} labelMin="Aucune douleur" labelMax="Douleur intense" />
            <label style={styleLabel}>Crampes</label>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
              {["non","oui"].map(c => <button key={c} onClick={() => maj("crampes", c)} style={styleBouton(seance.crampes === c, c === "oui" ? "#F44336" : "#4CAF50")}>{c === "oui" ? "😣 Oui" : "✓ Non"}</button>)}
            </div>
          </div>
        )}

        {sectionActive === 6 && (
          <div>
            <p style={styleSectionTitre}>6 — Récupération & hygiène de vie</p>
            <Slider label="Qualité du sommeil la veille" valeur={seance.sommeil} onChange={v => maj("sommeil", v)} labelMin="Très mauvaise" labelMax="Excellente" />
            <Slider label="Hydratation avant séance" valeur={seance.hydratation} onChange={v => maj("hydratation", v)} labelMin="Très déshydraté" labelMax="Très bien hydraté" />
            <Slider label="Nutrition avant séance" valeur={seance.nutrition} onChange={v => maj("nutrition", v)} labelMin="Insuffisant" labelMax="Parfaitement nutritionné" />
            <Slider label="Fatigue cumulée" valeur={seance.fatigue} onChange={v => maj("fatigue", v)} labelMin="Très fatigué" labelMax="Totalement reposé" />
          </div>
        )}

        {sectionActive === 7 && (
          <div>
            <p style={styleSectionTitre}>7 — État mental</p>
            <Slider label="Motivation avant séance" valeur={seance.motivation} onChange={v => maj("motivation", v)} labelMin="Aucune motivation" labelMax="Ultra motivé" />
            <label style={styleLabel}>Ressenti pendant (plusieurs choix possibles)</label>
            <div style={{ display: "flex", flexWrap: "wrap", marginBottom: "16px" }}>
              {[{id:"plaisir",label:"😊 Plaisir"},{id:"neutre",label:"😐 Neutre"},{id:"ennui",label:"😑 Ennui"},{id:"souffrance",label:"😣 Souffrance"},{id:"combatif",label:"💪 Combatif"}].map(r => (
                <button key={r.id} onClick={() => toggleRessenti(r.id)} style={styleBouton(seance.ressenti.includes(r.id))}>{r.label}</button>
              ))}
            </div>
            <Slider label="Gestion de l'effort" valeur={seance.gestionEffort} onChange={v => maj("gestionEffort", v)} labelMin="Parti trop vite" labelMax="Parfaitement géré" />
          </div>
        )}

        {sectionActive === 8 && (
          <div>
            <p style={styleSectionTitre}>8 — Note libre</p>
            <label style={styleLabel}>Sensations, contexte, remarques personnelles...</label>
            <textarea value={seance.note} onChange={e => maj("note", e.target.value)}
              placeholder="Comment s'est vraiment passée cette séance ?" rows={8}
              style={{ ...styleInput, resize: "vertical", lineHeight: "1.6" }} />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "32px" }}>
          <button onClick={() => setSectionActive(s => Math.max(1, s - 1))} style={{ padding: "14px 24px", backgroundColor: sectionActive === 1 ? "transparent" : "#2a2a2a", color: sectionActive === 1 ? "transparent" : "white", border: "none", borderRadius: "10px", fontSize: "15px", cursor: sectionActive === 1 ? "default" : "pointer" }}>← Précédent</button>
          <button onClick={() => { if (sectionActive < 8) setSectionActive(s => s + 1); else validerSeance() }} style={{ padding: "14px 24px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "bold", cursor: "pointer" }}>
            {sectionActive === 8 ? "Valider ✓" : "Suivant →"}
          </button>
        </div>

      </div>
    </div>
  )
}