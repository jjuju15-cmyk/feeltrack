import { useState } from "react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceArea, Legend
} from "recharts"

const getCouleurScore = (score: number) => {
  if (score >= 75) return "var(--ft-cardio)"
  if (score >= 60) return "#FFC107"
  if (score >= 40) return "#FF9800"
  return "#F44336"
}

const getCouleurForme = (v: number) => {
  if (v >= 75) return "var(--ft-cardio)"
  if (v >= 60) return "#FFC107"
  if (v >= 40) return "#FF9800"
  return "#F44336"
}

const getCouleurCharge = (v: number) => {
  if (v <= 30) return "var(--ft-snc)"
  if (v <= 60) return "var(--ft-cardio)"
  if (v <= 90) return "#FF9800"
  return "#F44336"
}

const getEmoji = (sport: string) => {
  const emojis: Record<string, string> = { trail: "🌄", course: "🏃", vtt: "🚵", velo: "🚴" }
  return emojis[sport] || "🏅"
}

const TooltipGraphique1 = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: "var(--ft-card)", borderRadius: 12,
      padding: "12px 16px", fontSize: 12,
      boxShadow: "var(--ft-shadow-lift)"
    }}>
      <p style={{ color: "var(--ft-muted)", marginBottom: 8 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0", fontFamily: "var(--ft-font-data)" }}>
          {p.name} : <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

const TooltipGraphique2 = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const charge = payload.find((p: any) => p.dataKey === "Charge")?.value
  const forme = payload.find((p: any) => p.dataKey === "Forme")?.value
  return (
    <div style={{
      background: "var(--ft-card)", borderRadius: 12,
      padding: "12px 16px", fontSize: 12,
      boxShadow: "var(--ft-shadow-lift)"
    }}>
      <p style={{ color: "var(--ft-muted)", marginBottom: 8 }}>{label}</p>
      {charge !== undefined && <p style={{ color: getCouleurCharge(charge), margin: "2px 0", fontFamily: "var(--ft-font-data)" }}>Charge : <strong>{charge}</strong></p>}
      {forme !== undefined && <p style={{ color: getCouleurForme(forme), margin: "2px 0", fontFamily: "var(--ft-font-data)" }}>Forme : <strong>{forme}/100</strong></p>}
    </div>
  )
}

const Fiche = ({ emoji, titre, contenu, exemple }: {
  emoji: string; titre: string; contenu: string; exemple?: string
}) => (
  <div style={{
    background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
    padding: 20, marginBottom: 12, boxShadow: "var(--ft-shadow-soft)"
  }}>
    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--ft-ink)", marginBottom: 8 }}>
      {emoji} {titre}
    </p>
    <p style={{ fontSize: 13, color: "var(--ft-muted)", lineHeight: 1.6, margin: 0 }}>{contenu}</p>
    {exemple && (
      <div style={{
        background: "var(--ft-surface)", borderRadius: 10,
        padding: 12, marginTop: 10
      }}>
        <p style={{ fontSize: 12, color: "#FFC107", margin: 0 }}>💡 Exemple : {exemple}</p>
      </div>
    )}
  </div>
)

const FicheZone = ({ couleur, emoji, range, titre, description, conseil }: {
  couleur: string; emoji: string; range: string; titre: string; description: string; conseil: string
}) => (
  <div style={{
    background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
    padding: 20, marginBottom: 10, boxShadow: "var(--ft-shadow-soft)",
    borderLeft: `4px solid ${couleur}`
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: couleur, margin: 0 }}>{emoji} {titre}</p>
      <span style={{
        fontSize: 12, color: "var(--ft-muted)",
        background: "var(--ft-surface)", padding: "2px 10px",
        borderRadius: "var(--ft-r-chip)", fontFamily: "var(--ft-font-data)"
      }}>{range}</span>
    </div>
    <p style={{ fontSize: 13, color: "var(--ft-muted)", margin: "0 0 6px", lineHeight: 1.5 }}>{description}</p>
    <p style={{ fontSize: 12, color: couleur, margin: 0 }}>→ {conseil}</p>
  </div>
)

export default function Profil() {
  const [onglet, setOnglet] = useState("stats")
  const [moisActuel, setMoisActuel] = useState(new Date())
  const [sectionAide, setSectionAide] = useState("scores")

  const pseudo = localStorage.getItem("pseudo") || "Sportif"
  const seances = JSON.parse(localStorage.getItem("seances") || "[]")

  const COEFFICIENTS: Record<string, number> = {
    trail: 0.98, course: 0.78, vtt: 0.76, velo: 0.70
  }

  const totalSeances = seances.length
  const totalDistance = seances.reduce((acc: number, s: any) => acc + (parseFloat(s.distance) || 0), 0)
  const totalDenivele = seances.reduce((acc: number, s: any) => acc + (parseFloat(s.denivele) || 0), 0)
  const meilleurScore = totalSeances > 0 ? Math.max(...seances.map((s: any) => s.score)) : 0

  const scoreMoyen = totalSeances > 0 ? (() => {
    const somme = seances.reduce((acc: number, s: any) => acc + s.score * (COEFFICIENTS[s.sport] || 0.75), 0)
    const coefTotal = seances.reduce((acc: number, s: any) => acc + (COEFFICIENTS[s.sport] || 0.75), 0)
    return Math.round(somme / coefTotal)
  })() : 0

  const trierParDate = (arr: any[]) =>
    [...arr].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const avecNouveauxChamps = seances.filter((s: any) => s.charge !== undefined && s.forme !== undefined)
  const donneesGraphique1 = trierParDate(seances).slice(-10).map((s: any) => ({
    name: new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    SNC: s.score_snc || 0, Musculaire: s.score_musculaire || 0, Cardio: s.score_cardio || 0,
  }))
  const donneesGraphique2 = trierParDate(avecNouveauxChamps).slice(-10).map((s: any) => ({
    name: new Date(s.date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    Charge: s.charge, Forme: s.forme,
  }))

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

  const onglets = [
    { id: "stats", label: "Stats" },
    { id: "graphiques", label: "Graphs" },
    { id: "objectifs", label: "Objectifs" },
    { id: "calendrier", label: "Calendrier" },
    { id: "aide", label: "Aide" },
  ]

  return (
    <div style={{ padding: "24px 20px" }}>

      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{
          fontFamily: "var(--ft-font-display)", fontSize: 26, fontWeight: 700,
          color: "var(--ft-ink)", letterSpacing: "-0.02em", marginBottom: 2
        }}>
          {pseudo}
        </h1>
        <p style={{ fontSize: 13, color: "var(--ft-muted)" }}>Ton profil FeelTrack</p>
      </div>

      {/* Onglets */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24, flexWrap: "wrap" }}>
        {onglets.map(o => (
          <button key={o.id} onClick={() => setOnglet(o.id)} style={{
            flex: 1, padding: "9px 4px", minWidth: 58,
            background: onglet === o.id ? "var(--ft-ink)" : "var(--ft-card)",
            color: onglet === o.id ? "#fff" : "var(--ft-muted)",
            border: "none", borderRadius: "var(--ft-r-btn)",
            fontSize: 12, fontWeight: onglet === o.id ? 600 : 400,
            cursor: "pointer", fontFamily: "var(--ft-font-body)",
            boxShadow: "var(--ft-shadow-soft)", transition: "all 0.15s ease"
          }}>
            {o.label}
          </button>
        ))}
      </div>

      {/* ONGLET STATS */}
      {onglet === "stats" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {[
              { label: "séances", valeur: totalSeances, unite: "" },
              { label: "distance totale", valeur: Math.round(totalDistance), unite: " km" },
              { label: "dénivelé total", valeur: Math.round(totalDenivele), unite: " m" },
              { label: "score moyen", valeur: scoreMoyen, unite: "/100" },
            ].map(stat => (
              <div key={stat.label} style={{
                background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
                padding: 20, textAlign: "center", boxShadow: "var(--ft-shadow-soft)"
              }}>
                <p style={{
                  fontFamily: "var(--ft-font-data)", fontSize: 30, fontWeight: 500,
                  color: "var(--ft-ink)", margin: 0, lineHeight: 1
                }}>
                  {stat.valeur}<span style={{ fontSize: 14, color: "var(--ft-muted)" }}>{stat.unite}</span>
                </p>
                <p style={{ fontSize: 12, color: "var(--ft-muted)", marginTop: 6 }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {totalSeances > 0 && (
            <div style={{
              background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
              padding: "16px 20px", marginBottom: 24, boxShadow: "var(--ft-shadow-soft)",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <p style={{ fontSize: 14, color: "var(--ft-muted)", margin: 0 }}>🏆 Meilleur score</p>
              <p style={{
                fontFamily: "var(--ft-font-data)", fontSize: 28, fontWeight: 500,
                color: getCouleurScore(meilleurScore), margin: 0
              }}>{meilleurScore}</p>
            </div>
          )}

          {totalSeances === 0 ? (
            <div style={{
              background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
              padding: 40, textAlign: "center", boxShadow: "var(--ft-shadow-soft)"
            }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>🏃</p>
              <p style={{ fontSize: 14, color: "var(--ft-muted)" }}>Ajoute des séances pour voir tes stats !</p>
            </div>
          ) : (
            <>
              <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 12 }}>par sport</p>
              {["trail", "course", "vtt", "velo"].map(sport => {
                const seancesSport = seances.filter((s: any) => s.sport === sport)
                if (seancesSport.length === 0) return null
                const scoreMoyenSport = Math.round(seancesSport.reduce((acc: number, s: any) => acc + s.score, 0) / seancesSport.length)
                const distanceSport = Math.round(seancesSport.reduce((acc: number, s: any) => acc + (parseFloat(s.distance) || 0), 0))
                return (
                  <div key={sport} style={{
                    background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
                    padding: "14px 16px", marginBottom: 8,
                    boxShadow: "var(--ft-shadow-soft)",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{getEmoji(sport)}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ft-ink)", margin: 0 }}>
                          {seancesSport.length} séance{seancesSport.length > 1 ? "s" : ""}
                        </p>
                        {distanceSport > 0 && <p style={{ fontSize: 11, color: "var(--ft-muted)", margin: 0 }}>{distanceSport} km</p>}
                      </div>
                    </div>
                    <span style={{
                      fontFamily: "var(--ft-font-data)", fontSize: 14, fontWeight: 500,
                      color: getCouleurScore(scoreMoyenSport),
                      background: "var(--ft-surface)", padding: "4px 12px",
                      borderRadius: "var(--ft-r-chip)"
                    }}>{scoreMoyenSport}</span>
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
            <div style={{
              background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
              padding: 40, textAlign: "center", boxShadow: "var(--ft-shadow-soft)"
            }}>
              <p style={{ fontSize: 40, marginBottom: 16 }}>📈</p>
              <p style={{ fontSize: 14, color: "var(--ft-muted)" }}>Ajoute au moins 2 séances pour voir tes graphiques</p>
            </div>
          ) : (
            <>
              {donneesGraphique2.length >= 2 && (
                <div style={{
                  background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
                  padding: 20, marginBottom: 24, boxShadow: "var(--ft-shadow-soft)"
                }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ft-ink)", marginBottom: 2 }}>Charge vs Forme</p>
                  <p style={{ fontSize: 11, color: "var(--ft-muted)", marginBottom: 16 }}>10 dernières séances</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={donneesGraphique2} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <ReferenceArea y1={75} y2={100} fill="#4CAF50" fillOpacity={0.06} />
                      <ReferenceArea y1={60} y2={75} fill="#FFC107" fillOpacity={0.06} />
                      <ReferenceArea y1={40} y2={60} fill="#FF9800" fillOpacity={0.06} />
                      <ReferenceArea y1={0} y2={40} fill="#F44336" fillOpacity={0.06} />
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--ft-line)" />
                      <XAxis dataKey="name" tick={{ fill: "var(--ft-muted)", fontSize: 11 }} />
                      <YAxis domain={[0, 120]} tick={{ fill: "var(--ft-muted)", fontSize: 11 }} />
                      <Tooltip content={<TooltipGraphique2 />} />
                      <Legend wrapperStyle={{ fontSize: 12, color: "var(--ft-muted)" }} />
                      <Line type="monotone" dataKey="Charge" stroke="#FF9800" strokeWidth={2} dot={{ fill: "#FF9800", r: 4 }} />
                      <Line type="monotone" dataKey="Forme" stroke="#2DD4BF" strokeWidth={2} dot={{ fill: "#2DD4BF", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div style={{
                    background: "var(--ft-surface)", borderRadius: 10,
                    padding: 12, marginTop: 12
                  }}>
                    <p style={{ fontSize: 11, color: "#FFC107", margin: 0 }}>
                      💡 Quand la <strong style={{ color: "#FF9800" }}>charge monte</strong> et la <strong style={{ color: "#2DD4BF" }}>forme descend</strong> — c'est le signal de surmenage.
                    </p>
                  </div>
                </div>
              )}

              <div style={{
                background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
                padding: 20, boxShadow: "var(--ft-shadow-soft)"
              }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ft-ink)", marginBottom: 2 }}>Les 3 systèmes</p>
                <p style={{ fontSize: 11, color: "var(--ft-muted)", marginBottom: 16 }}>SNC / Musculaire / Cardio</p>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={donneesGraphique1} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--ft-line)" />
                    <XAxis dataKey="name" tick={{ fill: "var(--ft-muted)", fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: "var(--ft-muted)", fontSize: 11 }} />
                    <Tooltip content={<TooltipGraphique1 />} />
                    <Legend wrapperStyle={{ fontSize: 12, color: "var(--ft-muted)" }} />
                    <Line type="monotone" dataKey="SNC" stroke="#7C6FF0" strokeWidth={2} dot={{ fill: "#7C6FF0", r: 4 }} />
                    <Line type="monotone" dataKey="Musculaire" stroke="#FF7A66" strokeWidth={2} dot={{ fill: "#FF7A66", r: 4 }} />
                    <Line type="monotone" dataKey="Cardio" stroke="#2DD4BF" strokeWidth={2} dot={{ fill: "#2DD4BF", r: 4 }} />
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
            const couleur = pct >= 100 ? "var(--ft-cardio)" : pct >= 60 ? "#FFC107" : "#FF9800"
            return (
              <div key={obj.label} style={{
                background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
                padding: 20, marginBottom: 12, boxShadow: "var(--ft-shadow-soft)"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ft-ink)", margin: 0 }}>{obj.emoji} {obj.label}</p>
                  <p style={{ fontFamily: "var(--ft-font-data)", fontSize: 13, color: "var(--ft-muted)", margin: 0 }}>
                    {obj.actuel} / {obj.objectif} {obj.unite}
                  </p>
                </div>
                <div style={{ background: "var(--ft-surface)", borderRadius: "var(--ft-r-chip)", height: 8, overflow: "hidden" }}>
                  <div style={{
                    width: `${pct}%`, height: 8, background: couleur,
                    borderRadius: "var(--ft-r-chip)", transition: "width 0.4s ease"
                  }} />
                </div>
                <p style={{
                  fontFamily: "var(--ft-font-data)", fontSize: 11,
                  color: couleur, marginTop: 6, textAlign: "right"
                }}>{pct}%</p>
              </div>
            )
          })}
        </div>
      )}

      {/* ONGLET CALENDRIER */}
      {onglet === "calendrier" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <button
              onClick={() => setMoisActuel(new Date(moisActuel.getFullYear(), moisActuel.getMonth() - 1, 1))}
              style={{
                background: "var(--ft-card)", border: "none", color: "var(--ft-ink)",
                padding: "8px 14px", borderRadius: "var(--ft-r-btn)",
                cursor: "pointer", fontSize: 16, boxShadow: "var(--ft-shadow-soft)"
              }}>←</button>
            <p style={{
              fontFamily: "var(--ft-font-body)", fontWeight: 600, fontSize: 15,
              color: "var(--ft-ink)", margin: 0, textTransform: "capitalize"
            }}>{nomMois}</p>
            <button
              onClick={() => setMoisActuel(new Date(moisActuel.getFullYear(), moisActuel.getMonth() + 1, 1))}
              style={{
                background: "var(--ft-card)", border: "none", color: "var(--ft-ink)",
                padding: "8px 14px", borderRadius: "var(--ft-r-btn)",
                cursor: "pointer", fontSize: 16, boxShadow: "var(--ft-shadow-soft)"
              }}>→</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
            {["L", "M", "M", "J", "V", "S", "D"].map((j, i) => (
              <div key={i} style={{ textAlign: "center", fontSize: 11, color: "var(--ft-muted)", padding: "4px 0" }}>{j}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {genererCalendrier().map((jour, i) => {
              const score = jour ? getScoreJour(jour) : null
              return (
                <div key={i} style={{
                  aspectRatio: "1", borderRadius: 10,
                  background: score ? getCouleurScore(score) : jour ? "var(--ft-card)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12,
                  color: score ? "#fff" : "var(--ft-muted)",
                  fontWeight: score ? 600 : 400,
                  boxShadow: jour ? "var(--ft-shadow-soft)" : "none"
                }}>
                  {jour || ""}
                </div>
              )
            })}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { couleur: "var(--ft-cardio)", label: "Optimal" },
              { couleur: "#FFC107", label: "Vigilance" },
              { couleur: "#FF9800", label: "Fatigue" },
              { couleur: "#F44336", label: "Surcharge" },
            ].map(z => (
              <div key={z.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: z.couleur }} />
                <span style={{ fontSize: 11, color: "var(--ft-muted)" }}>{z.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ONGLET AIDE */}
      {onglet === "aide" && (
        <div>
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              { id: "scores", label: "Scores" },
              { id: "zones", label: "Zones" },
              { id: "systemes", label: "Systèmes" },
              { id: "coefficients", label: "Coefficients" },
            ].map(s => (
              <button key={s.id} onClick={() => setSectionAide(s.id)} style={{
                flex: 1, padding: "8px 4px", fontSize: 11, minWidth: 70,
                background: sectionAide === s.id ? "var(--ft-snc)" : "var(--ft-card)",
                color: sectionAide === s.id ? "#fff" : "var(--ft-muted)",
                border: "none", borderRadius: "var(--ft-r-btn)",
                cursor: "pointer", fontFamily: "var(--ft-font-body)",
                fontWeight: sectionAide === s.id ? 600 : 400,
                boxShadow: "var(--ft-shadow-soft)"
              }}>
                {s.label}
              </button>
            ))}
          </div>

          {sectionAide === "scores" && (
            <div>
              <Fiche emoji="🎯" titre="Le score de forme"
                contenu="C'est un nombre entre 0 et 100 qui résume comment tu t'es senti pendant ta séance. Il prend en compte ton état physique, mental, ta récupération ET les conditions extérieures (météo, terrain, heure)."
                exemple="Tu cours sous la pluie par 30°C après une mauvaise nuit → ton score sera plus bas même si tu as couru vite." />
              <Fiche emoji="🧮" titre="Comment est calculé le score ?"
                contenu="Le calcul se fait en 3 étapes : (1) tes curseurs physiques et mentaux donnent un score brut, (2) les conditions environnementales l'ajustent à la hausse (conditions difficiles = effort réel plus grand), (3) ton hygiène de vie (sommeil, nutrition, hydratation) affine le résultat final."
                exemple="Score brut 70 × conditions difficiles (×1.2) = 84, mais sommeil mauvais réduit à 78 final." />
              <Fiche emoji="📊" titre="Score moyen pondéré"
                contenu="Le score moyen visible sur ton profil n'est pas une simple moyenne. Il tient compte du sport pratiqué — une séance de Trail pèse plus lourd qu'une sortie vélo car l'effort global est plus important."
                exemple="1 séance trail (score 80) + 1 séance vélo (score 60) → score moyen pondéré ≈ 71, pas 70." />
            </div>
          )}

          {sectionAide === "zones" && (
            <div>
              <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 16, lineHeight: 1.6 }}>
                Les zones te disent où tu en es physiquement. Un score bas ne veut pas dire que tu as mal couru — il peut vouloir dire que tu étais fatigué ou que les conditions étaient difficiles.
              </p>
              <FicheZone couleur="var(--ft-cardio)" emoji="🟢" range="75 – 100" titre="Forme optimale"
                description="Tu es en pleine forme, bien récupéré, motivé. Ton corps et ta tête sont alignés. C'est le moment idéal pour te challenger."
                conseil="Continue comme ça, tu peux augmenter la charge si tu le souhaites." />
              <FicheZone couleur="#FFC107" emoji="🟡" range="60 – 74" titre="Vigilance"
                description="Légère fatigue perceptible. Tu fonctionnes bien mais des signaux commencent à apparaître."
                conseil="Maintiens ton rythme mais soigne ton sommeil et ta nutrition." />
              <FicheZone couleur="#FF9800" emoji="🟠" range="40 – 59" titre="Fatigue accumulée"
                description="La fatigue est présente et impacte tes performances. Ton corps a besoin de récupérer."
                conseil="Séances légères uniquement, priorise le sommeil et la récupération active." />
              <FicheZone couleur="#F44336" emoji="🔴" range="0 – 39" titre="Surcharge — Risque blessure"
                description="Ton organisme est en surcharge. Continuer intensément à ce stade augmente fortement le risque de blessure."
                conseil="Repos obligatoire ou récupération active uniquement." />
            </div>
          )}

          {sectionAide === "systemes" && (
            <div>
              <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 16, lineHeight: 1.6 }}>
                Ton score final est la combinaison de 3 systèmes physiologiques. Comprendre lequel est fatigué t'aide à mieux récupérer.
              </p>
              <Fiche emoji="🟣" titre="SNC — Système Nerveux Central"
                contenu="La coordination, la concentration, la technicité et l'engagement mental. Le SNC se fatigue surtout sur les sports techniques (trail, VTT). Il récupère lentement — 48 à 72h parfois."
                exemple="Après un trail très technique, ton SNC peut être épuisé même si tes jambes vont bien." />
              <Fiche emoji="🟠" titre="Musculaire — Système Musculaire"
                contenu="La force, l'endurance musculaire et les douleurs. Les courbatures, la lourdeur des jambes et les douleurs sont des indicateurs de fatigue musculaire."
                exemple="Jambes lourdes après un long trail = fatigue musculaire élevée." />
              <Fiche emoji="🩵" titre="Cardio — Système Cardio-Respiratoire"
                contenu="Ton cœur et ta respiration. Un score cardio élevé signifie un effort cardiovasculaire intense. Ce système récupère plus vite que le SNC ou le musculaire."
                exemple="Après un fractionné intensif, tu peux récupérer en 24h." />
              <div style={{
                background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
                padding: 16, marginTop: 4, boxShadow: "var(--ft-shadow-soft)"
              }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#FFC107", marginBottom: 8 }}>💡 Comment lire les 3 courbes ?</p>
                <p style={{ fontSize: 12, color: "var(--ft-muted)", lineHeight: 1.7, margin: 0 }}>
                  Si <span style={{ color: "#7C6FF0" }}>SNC</span> descend mais <span style={{ color: "#2DD4BF" }}>Cardio</span> reste haut → fatigue nerveuse, réduis la technicité.<br />
                  Si <span style={{ color: "#FF7A66" }}>Musculaire</span> descend seul → stretching et récupération active.<br />
                  Si les 3 descendent ensemble → repos.
                </p>
              </div>
            </div>
          )}

          {sectionAide === "coefficients" && (
            <div>
              <Fiche emoji="📐" titre="Pourquoi des coefficients par sport ?"
                contenu="Tous les sports ne demandent pas le même effort global. Un trail de 2h sollicite bien plus ton organisme qu'une sortie vélo de 2h. Les coefficients permettent de comparer des séances de sports différents sur une base équitable." />
              <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 12 }}>Tableau des coefficients :</p>
              {[
                { sport: "Trail", emoji: "🌄", coef: 0.98, raison: "Effort global maximal — SNC, musculaire et cardio sollicités" },
                { sport: "Course à pied", emoji: "🏃", coef: 0.78, raison: "Cardio élevé, moins de SNC et impact terrain" },
                { sport: "VTT", emoji: "🚵", coef: 0.76, raison: "Technique élevée, effort variable selon terrain" },
                { sport: "Vélo route", emoji: "🚴", coef: 0.70, raison: "Endurance, peu de SNC, impact musculaire modéré" },
              ].map(s => (
                <div key={s.sport} style={{
                  background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
                  padding: "14px 16px", marginBottom: 8, boxShadow: "var(--ft-shadow-soft)",
                  display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 500, color: "var(--ft-ink)", margin: 0 }}>{s.emoji} {s.sport}</p>
                    <p style={{ fontSize: 11, color: "var(--ft-muted)", margin: 0 }}>{s.raison}</p>
                  </div>
                  <span style={{
                    fontFamily: "var(--ft-font-data)", fontSize: 14, fontWeight: 500,
                    color: s.coef >= 0.9 ? "var(--ft-cardio)" : s.coef >= 0.75 ? "#FFC107" : "#FF9800",
                    background: "var(--ft-surface)", padding: "4px 12px",
                    borderRadius: "var(--ft-r-chip)"
                  }}>×{s.coef}</span>
                </div>
              ))}
              <div style={{
                background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
                padding: 16, marginTop: 8, boxShadow: "var(--ft-shadow-soft)"
              }}>
                <p style={{ fontSize: 12, color: "#FFC107", margin: 0 }}>
                  💡 Ces coefficients sont modifiables dans les paramètres si tu veux les ajuster à ton ressenti terrain.
                </p>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
