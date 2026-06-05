import { useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, Legend
} from "recharts"

const getCouleurScore = (score: number) => {
  if (score >= 75) return "#4CAF50"
  if (score >= 60) return "#FFC107"
  if (score >= 40) return "#FF9800"
  return "#F44336"
}

// 🏅 Emoji par sport
const getEmoji = (sport: string) => {
  const emojis: Record<string, string> = {
    trail: "🌄", course: "🏃", vtt: "🚵", velo: "🚴"
  }
  return emojis[sport] || "🏅"
}

// 🎨 Tooltips graphiques
const TooltipGraphique1 = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ backgroundColor: "#1e1e1e", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "12px", fontSize: "12px" }}>
      <p style={{ color: "#888", marginBottom: "8px" }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>{p.name} : <strong>{p.value}</strong></p>
      ))}
    </div>
  )
}

const getCouleurForme = (v: number) => {
  if (v >= 75) return "#4CAF50"
  if (v >= 60) return "#FFC107"
  if (v >= 40) return "#FF9800"
  return "#F44336"
}
const getCouleurCharge = (v: number) => {
  if (v <= 30) return "#4A90E2"
  if (v <= 60) return "#4CAF50"
  if (v <= 90) return "#FF9800"
  return "#F44336"
}

const TooltipGraphique2 = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const charge = payload.find((p: any) => p.dataKey === "Charge")?.value
  const forme = payload.find((p: any) => p.dataKey === "Forme")?.value
  return (
    <div style={{ backgroundColor: "#1e1e1e", border: "1px solid #2a2a2a", borderRadius: "8px", padding: "12px", fontSize: "12px" }}>
      <p style={{ color: "#888", marginBottom: "8px" }}>{label}</p>
      {charge !== undefined && <p style={{ color: getCouleurCharge(charge), margin: "2px 0" }}>Charge : <strong>{charge}</strong></p>}
      {forme !== undefined && <p style={{ color: getCouleurForme(forme), margin: "2px 0" }}>Forme : <strong>{forme}/100</strong></p>}
    </div>
  )
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📖 Composant Fiche d'aide
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const Fiche = ({ emoji, titre, contenu, exemple }: {
  emoji: string; titre: string; contenu: string; exemple?: string
}) => (
  <div style={{ backgroundColor: "#1e1e1e", borderRadius: "12px", padding: "16px", marginBottom: "12px", border: "1px solid #2a2a2a" }}>
    <p style={{ fontSize: "15px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>
      {emoji} {titre}
    </p>
    <p style={{ fontSize: "13px", color: "#aaa", lineHeight: "1.6", margin: 0 }}>{contenu}</p>
    {exemple && (
      <div style={{ backgroundColor: "#2a2a2a", borderRadius: "8px", padding: "10px", marginTop: "10px" }}>
        <p style={{ fontSize: "12px", color: "#FFC107", margin: 0 }}>💡 Exemple : {exemple}</p>
      </div>
    )}
  </div>
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📖 Composant Zone colorée
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const FicheZone = ({ couleur, emoji, range, titre, description, conseil }: {
  couleur: string; emoji: string; range: string; titre: string; description: string; conseil: string
}) => (
  <div style={{ backgroundColor: "#1e1e1e", borderRadius: "12px", padding: "16px", marginBottom: "10px", borderLeft: `4px solid ${couleur}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
      <p style={{ fontSize: "14px", fontWeight: "bold", color: couleur, margin: 0 }}>{emoji} {titre}</p>
      <span style={{ fontSize: "12px", color: "#555", backgroundColor: "#2a2a2a", padding: "2px 8px", borderRadius: "10px" }}>{range}</span>
    </div>
    <p style={{ fontSize: "13px", color: "#aaa", margin: "0 0 6px", lineHeight: "1.5" }}>{description}</p>
    <p style={{ fontSize: "12px", color: couleur, margin: 0 }}>→ {conseil}</p>
  </div>
)

export default function Profil() {
  const [onglet, setOnglet] = useState("stats")
  const [moisActuel, setMoisActuel] = useState(new Date())
  const [sectionAide, setSectionAide] = useState("scores")

  const pseudo = localStorage.getItem("pseudo") || "Sportif"
  const seances = JSON.parse(localStorage.getItem("seances") || "[]")

  // 🧮 Coefficients — identiques à la page d'accueil
  const COEFFICIENTS: Record<string, number> = {
    trail: 0.98, course: 0.78, vtt: 0.76, velo: 0.70
  }

  // 📊 Stats globales
  const totalSeances = seances.length
  const totalDistance = seances.reduce((acc: number, s: any) => acc + (parseFloat(s.distance) || 0), 0)
  const totalDenivele = seances.reduce((acc: number, s: any) => acc + (parseFloat(s.denivele) || 0), 0)
  const meilleurScore = totalSeances > 0 ? Math.max(...seances.map((s: any) => s.score)) : 0

  // 🧮 Score moyen pondéré
  const scoreMoyen = totalSeances > 0 ? (() => {
    const somme = seances.reduce((acc: number, s: any) => acc + s.score * (COEFFICIENTS[s.sport] || 0.75), 0)
    const coefTotal = seances.reduce((acc: number, s: any) => acc + (COEFFICIENTS[s.sport] || 0.75), 0)
    return Math.round(somme / coefTotal)
  })() : 0

  // 📈 Données graphiques
  const avecNouveauxChamps = seances.filter((s: any) => s.charge !== undefined && s.forme !== undefined)
  const donneesGraphique1 = seances.slice(0, 10).reverse().map((s: any, i: number) => ({
    name: `S${i + 1}`, SNC: s.score_snc || 0, Musculaire: s.score_musculaire || 0, Cardio: s.score_cardio || 0,
  }))
  const donneesGraphique2 = avecNouveauxChamps.slice(0, 10).reverse().map((s: any, i: number) => ({
    name: `S${i + 1}`, Charge: s.charge, Forme: s.forme,
  }))

  // 📅 Calendrier
  const genererCalendrier = () => {
    const annee = moisActuel.getFullYear()
    const mois = moisActuel.getMonth()
    const premierJour = new Date(annee, mois, 1).getDay()
    const nbJours = new Date(annee, mois + 1, 0).getDate()
    const decalage = premierJour === 0 ? 6 : premierJour - 1
    const jours = []
    for (let i = 0; i < decalage; i++) jours.push(null)
    for (let i = 1; i <= nbJours; i++) jours.push(i)
    return jours
  }

  const getScoreJour = (jour: number) => {
    const annee = moisActuel.getFullYear()
    const mois = String(moisActuel.getMonth() + 1).padStart(2, "0")
    const jourStr = String(jour).padStart(2, "0")
    const seance = seances.find((s: any) => s.date === `${annee}-${mois}-${jourStr}`)
    return seance ? seance.score : null
  }

  const nomMois = moisActuel.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })

  return (
    <div style={{ padding: "20px" }}>

      {/* Titre */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", color: "white", marginBottom: "4px" }}>👤 {pseudo}</h1>
        <p style={{ fontSize: "13px", color: "#555" }}>Ton profil FeelTrack</p>
      </div>

      {/* Onglets */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { id: "stats", label: "📊 Stats" },
          { id: "graphiques", label: "📈 Graphs" },
          { id: "objectifs", label: "🎯 Objectifs" },
          { id: "calendrier", label: "📅 Calendrier" },
          { id: "aide", label: "❓ Aide" },
        ].map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)} style={{
            flex: 1, padding: "10px 4px", minWidth: "60px",
            backgroundColor: onglet === o.id ? "#1a73e8" : "#1e1e1e",
            color: onglet === o.id ? "white" : "#555",
            border: onglet === o.id ? "1px solid #1a73e8" : "1px solid #2a2a2a",
            borderRadius: "8px", fontSize: "12px", cursor: "pointer"
          }}>
            {o.label}
          </button>
        ))}
      </div>

      {/* ONGLET STATS */}
      {onglet === "stats" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
            {[
              { label: "Séances", valeur: totalSeances, unite: "" },
              { label: "Distance totale", valeur: Math.round(totalDistance), unite: "km" },
              { label: "Dénivelé total", valeur: Math.round(totalDenivele), unite: "m" },
              { label: "Score moyen pondéré", valeur: scoreMoyen, unite: "/100" },
            ].map(stat => (
              <div key={stat.label} style={{ backgroundColor: "#1e1e1e", borderRadius: "12px", padding: "16px", textAlign: "center", border: "1px solid #2a2a2a" }}>
                <p style={{ fontSize: "28px", fontWeight: "bold", color: "white", margin: 0 }}>
                  {stat.valeur}<span style={{ fontSize: "14px", color: "#555" }}>{stat.unite}</span>
                </p>
                <p style={{ fontSize: "12px", color: "#555", margin: "4px 0 0" }}>{stat.label}</p>
              </div>
            ))}
          </div>
          {totalSeances > 0 && (
            <div style={{ backgroundColor: "#1e1e1e", borderRadius: "12px", padding: "16px", border: `1px solid ${getCouleurScore(meilleurScore)}`, marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontSize: "14px", color: "#888", margin: 0 }}>🏆 Meilleur score</p>
              <p style={{ fontSize: "28px", fontWeight: "bold", color: getCouleurScore(meilleurScore), margin: 0 }}>{meilleurScore}</p>
            </div>
          )}
          {totalSeances === 0 ? (
            <div style={{ textAlign: "center", padding: "32px", color: "#555" }}>
              <p style={{ fontSize: "32px" }}>🏃</p>
              <p>Ajoute des séances pour voir tes stats !</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: "14px", color: "#888", marginBottom: "12px" }}>Par sport</p>
              {["trail","course","vtt","velo"].map(sport => {
                const seancesSport = seances.filter((s: any) => s.sport === sport)
                if (seancesSport.length === 0) return null
                const scoreMoyenSport = Math.round(seancesSport.reduce((acc: number, s: any) => acc + s.score, 0) / seancesSport.length)
                const distanceSport = Math.round(seancesSport.reduce((acc: number, s: any) => acc + (parseFloat(s.distance) || 0), 0))
                return (
                  <div key={sport} style={{ backgroundColor: "#1e1e1e", borderRadius: "10px", padding: "12px 16px", marginBottom: "8px", border: "1px solid #2a2a2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "18px" }}>{getEmoji(sport)}</span>
                      <div>
                        <p style={{ fontSize: "13px", color: "white", margin: 0 }}>{seancesSport.length} séance(s)</p>
                        {distanceSport > 0 && <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>{distanceSport} km</p>}
                      </div>
                    </div>
                    <div style={{ backgroundColor: getCouleurScore(scoreMoyenSport), borderRadius: "20px", padding: "4px 12px", fontSize: "13px", fontWeight: "bold", color: "white" }}>
                      {scoreMoyenSport}
                    </div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* ONGLET GRAPHIQUES */}
      {onglet === "graphiques" && (
        <div>
          {seances.length < 2 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#555" }}>
              <p style={{ fontSize: "32px" }}>📈</p>
              <p>Ajoute au moins 2 séances pour voir tes graphiques</p>
            </div>
          ) : (
            <>
              {/* Graphique 1 — Charge vs Forme */}
              {donneesGraphique2.length >= 2 && (
                <div style={{ backgroundColor: "#1e1e1e", borderRadius: "16px", padding: "16px", marginBottom: "24px", border: "1px solid #2a2a2a" }}>
                  <p style={{ fontSize: "14px", color: "white", fontWeight: "bold", marginBottom: "4px" }}>📊 Charge vs Forme</p>
                  <p style={{ fontSize: "11px", color: "#555", marginBottom: "16px" }}>Charge 🟠 — Forme 🟢 (10 dernières séances)</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={donneesGraphique2} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <ReferenceArea y1={75} y2={100} fill="#4CAF50" fillOpacity={0.08} />
                      <ReferenceArea y1={60} y2={75} fill="#FFC107" fillOpacity={0.08} />
                      <ReferenceArea y1={40} y2={60} fill="#FF9800" fillOpacity={0.08} />
                      <ReferenceArea y1={0} y2={40} fill="#F44336" fillOpacity={0.08} />
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                      <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 11 }} />
                      <YAxis domain={[0, 120]} tick={{ fill: "#555", fontSize: 11 }} />
                      <Tooltip content={<TooltipGraphique2 />} />
                      <Legend wrapperStyle={{ fontSize: "12px", color: "#888" }} />
                      <Line type="monotone" dataKey="Charge" stroke="#FF9800" strokeWidth={2} dot={{ fill: "#FF9800", r: 4 }} />
                      <Line type="monotone" dataKey="Forme" stroke="#4CAF50" strokeWidth={2} dot={{ fill: "#4CAF50", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{ backgroundColor: "#2a2a2a", borderRadius: "8px", padding: "10px", marginTop: "12px" }}>
                    <p style={{ fontSize: "11px", color: "#FFC107", margin: 0 }}>
                      💡 Quand la <strong style={{ color: "#FF9800" }}>charge monte</strong> et la <strong style={{ color: "#4CAF50" }}>forme descend</strong> — c'est le signal de surmenage.
                    </p>
                  </div>
                </div>
              )}

              {/* Graphique 2 — Les 3 systèmes */}
              <div style={{ backgroundColor: "#1e1e1e", borderRadius: "16px", padding: "16px", border: "1px solid #2a2a2a" }}>
                <p style={{ fontSize: "14px", color: "white", fontWeight: "bold", marginBottom: "4px" }}>⚙️ Les 3 systèmes</p>
                <p style={{ fontSize: "11px", color: "#555", marginBottom: "16px" }}>SNC 🟠 / Musculaire 🔵 / Cardio 🟢</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={donneesGraphique1} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" tick={{ fill: "#555", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "#555", fontSize: 11 }} />
                    <Tooltip content={<TooltipGraphique1 />} />
                    <Legend wrapperStyle={{ fontSize: "12px", color: "#888" }} />
                    <Line type="monotone" dataKey="SNC" stroke="#FF6B35" strokeWidth={2} dot={{ fill: "#FF6B35", r: 4 }} />
                    <Line type="monotone" dataKey="Musculaire" stroke="#4A90E2" strokeWidth={2} dot={{ fill: "#4A90E2", r: 4 }} />
                    <Line type="monotone" dataKey="Cardio" stroke="#50C878" strokeWidth={2} dot={{ fill: "#50C878", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}

      {/* ONGLET OBJECTIFS */}
      {onglet === "objectifs" && (
        <div>
          {[
            { label: "Distance mensuelle", emoji: "📏", actuel: Math.round(totalDistance), objectif: 100, unite: "km" },
            { label: "Séances ce mois", emoji: "🗓️", actuel: totalSeances, objectif: 12, unite: "séances" },
            { label: "Score de forme cible", emoji: "🎯", actuel: scoreMoyen, objectif: 75, unite: "/100" },
          ].map(obj => {
            const pct = Math.min(100, Math.round((obj.actuel / obj.objectif) * 100))
            const couleur = pct >= 100 ? "#4CAF50" : pct >= 60 ? "#FFC107" : "#FF9800"
            return (
              <div key={obj.label} style={{ backgroundColor: "#1e1e1e", borderRadius: "12px", padding: "16px", marginBottom: "12px", border: "1px solid #2a2a2a" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <p style={{ fontSize: "14px", color: "white", margin: 0 }}>{obj.emoji} {obj.label}</p>
                  <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>{obj.actuel} / {obj.objectif} {obj.unite}</p>
                </div>
                <div style={{ backgroundColor: "#2a2a2a", borderRadius: "4px", height: "8px" }}>
                  <div style={{ width: `${pct}%`, height: "8px", backgroundColor: couleur, borderRadius: "4px", transition: "width 0.3s ease" }} />
                </div>
                <p style={{ fontSize: "11px", color: couleur, marginTop: "4px", textAlign: "right" }}>{pct}%</p>
              </div>
            )
          })}
        </div>
      )}

      {/* ONGLET CALENDRIER */}
      {onglet === "calendrier" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <button onClick={() => setMoisActuel(new Date(moisActuel.getFullYear(), moisActuel.getMonth() - 1, 1))}
              style={{ backgroundColor: "#2a2a2a", border: "none", color: "white", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}>←</button>
            <p style={{ color: "white", fontWeight: "bold", fontSize: "15px", margin: 0, textTransform: "capitalize" }}>{nomMois}</p>
            <button onClick={() => setMoisActuel(new Date(moisActuel.getFullYear(), moisActuel.getMonth() + 1, 1))}
              style={{ backgroundColor: "#2a2a2a", border: "none", color: "white", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "16px" }}>→</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
            {["L","M","M","J","V","S","D"].map((j, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: "11px", color: "#555", padding: "4px 0" }}>{j}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
            {genererCalendrier().map((jour, i) => {
              const score = jour ? getScoreJour(jour) : null
              return (
                <div key={i} style={{
                  aspectRatio: "1", borderRadius: "8px",
                  backgroundColor: score ? getCouleurScore(score) : jour ? "#1e1e1e" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", color: score ? "white" : "#555",
                  fontWeight: score ? "bold" : "normal",
                  border: jour ? "1px solid #2a2a2a" : "none"
                }}>
                  {jour || ""}
                </div>
              )
            })}
          </div>
          <div style={{ display: "flex", gap: "12px", marginTop: "16px", justifyContent: "center" }}>
            {[{couleur:"#4CAF50",label:"Optimal"},{couleur:"#FFC107",label:"Vigilance"},{couleur:"#FF9800",label:"Fatigue"},{couleur:"#F44336",label:"Surcharge"}].map(z => (
              <div key={z.label} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: z.couleur }} />
                <span style={{ fontSize: "11px", color: "#555" }}>{z.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* ONGLET AIDE */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {onglet === "aide" && (
        <div>

          {/* Sous-onglets aide */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
            {[
              { id: "scores", label: "🎯 Scores" },
              { id: "zones", label: "🚦 Zones" },
              { id: "systemes", label: "⚙️ Systèmes" },
              { id: "coefficients", label: "📐 Coefficients" },
            ].map(s => (
              <button key={s.id} onClick={() => setSectionAide(s.id)} style={{
                flex: 1, padding: "8px 4px", fontSize: "11px",
                backgroundColor: sectionAide === s.id ? "#FF6B35" : "#1e1e1e",
                color: sectionAide === s.id ? "white" : "#555",
                border: sectionAide === s.id ? "1px solid #FF6B35" : "1px solid #2a2a2a",
                borderRadius: "8px", cursor: "pointer"
              }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Section Scores */}
          {sectionAide === "scores" && (
            <div>
              <Fiche
                emoji="🎯"
                titre="Le score de forme"
                contenu="C'est un nombre entre 0 et 100 qui résume comment tu t'es senti pendant ta séance. Il prend en compte ton état physique, mental, ta récupération ET les conditions extérieures (météo, terrain, heure)."
                exemple="Tu cours sous la pluie par 30°C après une mauvaise nuit → ton score sera plus bas même si tu as couru vite."
              />
              <Fiche
                emoji="🧮"
                titre="Comment est calculé le score ?"
                contenu="Le calcul se fait en 3 étapes : (1) tes curseurs physiques et mentaux donnent un score brut, (2) les conditions environnementales l'ajustent à la hausse (conditions difficiles = effort réel plus grand), (3) ton hygiène de vie (sommeil, nutrition, hydratation) affine le résultat final."
                exemple="Score brut 70 × conditions difficiles (×1.2) = 84, mais sommeil mauvais réduit à 78 final."
              />
              <Fiche
                emoji="📊"
                titre="Score moyen pondéré"
                contenu="Le score moyen visible sur ton profil et sur 'Tous les sports' n'est pas une simple moyenne. Il tient compte du sport pratiqué — une séance de CrossFit ou Trail pèse plus lourd qu'une sortie vélo car l'effort global est plus important."
                exemple="1 séance trail (score 80) + 1 séance vélo (score 60) → score moyen pondéré ≈ 71, pas 70."
              />
            </div>
          )}

          {/* Section Zones */}
          {sectionAide === "zones" && (
            <div>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>
                Les zones te disent où tu en es physiquement. Un score bas ne veut pas dire que tu as mal couru — il peut vouloir dire que tu étais fatigué ou que les conditions étaient difficiles.
              </p>
              <FicheZone
                couleur="#4CAF50" emoji="🟢" range="75 – 100"
                titre="Forme optimale"
                description="Tu es en pleine forme, bien récupéré, motivé. Ton corps et ta tête sont alignés. C'est le moment idéal pour te challenger."
                conseil="Continue comme ça, tu peux augmenter la charge si tu le souhaites."
              />
              <FicheZone
                couleur="#FFC107" emoji="🟡" range="60 – 74"
                titre="Vigilance"
                description="Légère fatigue perceptible. Tu fonctionnes bien mais des signaux commencent à apparaître. Surveille ta récupération."
                conseil="Maintiens ton rythme mais soigne ton sommeil et ta nutrition."
              />
              <FicheZone
                couleur="#FF9800" emoji="🟠" range="40 – 59"
                titre="Fatigue accumulée"
                description="La fatigue est présente et impacte tes performances. Ton corps a besoin de récupérer. Continue à t'entraîner mais réduis l'intensité."
                conseil="Séances légères uniquement, priorise le sommeil et la récupération active."
              />
              <FicheZone
                couleur="#F44336" emoji="🔴" range="0 – 39"
                titre="Surcharge — Risque blessure"
                description="Ton organisme est en surcharge. Continuer à t'entraîner intensément à ce stade augmente fortement le risque de blessure ou de surentraînement."
                conseil="Repos obligatoire ou récupération active uniquement. Consulte un médecin si la fatigue persiste."
              />
            </div>
          )}

          {/* Section Systèmes */}
          {sectionAide === "systemes" && (
            <div>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "16px" }}>
                Ton score final est la combinaison de 3 systèmes physiologiques. Comprendre lequel est fatigué t'aide à mieux récupérer.
              </p>
              <Fiche
                emoji="🟠"
                titre="SNC — Système Nerveux Central"
                contenu="C'est la coordination, la concentration, la technicité et l'engagement mental. Le SNC se fatigue surtout sur les sports techniques (trail, VTT, CrossFit) et avec des charges lourdes en musculation. Il récupère lentement — 48 à 72h parfois."
                exemple="Après un trail très technique ou une séance de squats lourds, ton SNC peut être épuisé même si tes jambes vont bien."
              />
              <Fiche
                emoji="🔵"
                titre="Musculaire — Système Musculaire"
                contenu="C'est la force, l'endurance musculaire et les douleurs. Il reflète l'état de tes muscles après l'effort. Les courbatures, la lourdeur des jambes et les douleurs sont des indicateurs de fatigue musculaire."
                exemple="Jambes lourdes après un long trail = fatigue musculaire élevée."
              />
              <Fiche
                emoji="🟢"
                titre="Cardio — Système Cardio-Respiratoire"
                contenu="C'est ton cœur et ta respiration. Un score cardio élevé signifie que l'effort a été intense sur le plan cardiovasculaire. Ce système récupère plus vite que le SNC ou le musculaire."
                exemple="Après un fractionné intensif, le score cardio sera élevé mais tu peux récupérer en 24h."
              />
              <div style={{ backgroundColor: "#2a2a2a", borderRadius: "10px", padding: "14px", marginTop: "4px" }}>
                <p style={{ fontSize: "13px", color: "#FFC107", fontWeight: "bold", marginBottom: "8px" }}>💡 Comment lire les 3 courbes ?</p>
                <p style={{ fontSize: "12px", color: "#aaa", lineHeight: "1.6", margin: 0 }}>
                  Si <span style={{ color: "#FF6B35" }}>SNC</span> descend mais <span style={{ color: "#50C878" }}>Cardio</span> reste haut → tu es fatigué nerveusement mais cardio-vasculairement solide. Réduis la technicité.<br/><br/>
                  Si <span style={{ color: "#4A90E2" }}>Musculaire</span> descend seul → courbatures ou surcharge musculaire. Stretching et récupération active.<br/><br/>
                  Si les 3 descendent ensemble → fatigue générale. Repos.
                </p>
              </div>
            </div>
          )}

          {/* Section Coefficients */}
          {sectionAide === "coefficients" && (
            <div>
              <Fiche
                emoji="📐"
                titre="Pourquoi des coefficients par sport ?"
                contenu="Tous les sports ne demandent pas le même effort global. Un trail de 2h sollicite bien plus ton organisme qu'une sortie vélo de 2h. Les coefficients permettent de comparer des séances de sports différents sur une base équitable."
              />
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "12px" }}>Tableau des coefficients :</p>
              {[
                { sport: "Trail", emoji: "🌄", coef: 0.98, raison: "Effort global maximal — SNC, musculaire et cardio sollicités" },
                { sport: "Course à pied", emoji: "🏃", coef: 0.78, raison: "Cardio élevé, moins de SNC et impact terrain" },
                { sport: "VTT", emoji: "🚵", coef: 0.76, raison: "Technique élevée, effort variable selon terrain" },
                { sport: "Vélo route", emoji: "🚴", coef: 0.70, raison: "Endurance, peu de SNC, impact musculaire modéré" },
              ].map(s => (
                <div key={s.sport} style={{ backgroundColor: "#1e1e1e", borderRadius: "10px", padding: "12px 16px", marginBottom: "8px", border: "1px solid #2a2a2a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <p style={{ fontSize: "14px", color: "white", margin: 0 }}>{s.emoji} {s.sport}</p>
                    <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>{s.raison}</p>
                  </div>
                  <div style={{ backgroundColor: s.coef >= 0.9 ? "#4CAF50" : s.coef >= 0.75 ? "#FFC107" : "#FF9800", borderRadius: "20px", padding: "4px 12px", fontSize: "14px", fontWeight: "bold", color: "white" }}>
                    ×{s.coef}
                  </div>
                </div>
              ))}
              <div style={{ backgroundColor: "#2a2a2a", borderRadius: "10px", padding: "14px", marginTop: "8px" }}>
                <p style={{ fontSize: "12px", color: "#FFC107", margin: 0 }}>
                  💡 Ces coefficients sont modifiables. Si tu penses que le vélo devrait peser plus lourd pour toi, tu peux les ajuster dans les paramètres plus tard.
                </p>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  )
}