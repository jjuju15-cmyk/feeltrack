import { useState } from "react"

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

const getLabelCharge = (v: number) => {
  if (v <= 30) return "légère"
  if (v <= 60) return "modérée"
  if (v <= 90) return "élevée"
  return "très élevée"
}

const getEmoji = (sport: string) => {
  const emojis: Record<string, string> = { trail: "🌄", course: "🏃", vtt: "🚵", velo: "🚴" }
  return emojis[sport] || "🏅"
}

const getNomSport = (sport: string) => {
  const noms: Record<string, string> = {
    trail: "Trail", course: "Course à pied", vtt: "VTT", velo: "Vélo route"
  }
  return noms[sport] || sport
}

export default function Historique() {
  const [seances] = useState(() => JSON.parse(localStorage.getItem("seances") || "[]"))

  return (
    <div style={{ padding: "24px 20px" }}>

      <h1 style={{
        fontFamily: "var(--ft-font-display)", fontSize: 26, fontWeight: 700,
        color: "var(--ft-ink)", letterSpacing: "-0.02em", marginBottom: 4
      }}>
        Historique
      </h1>
      <p style={{ fontSize: 13, color: "var(--ft-muted)", marginBottom: 24 }}>
        {seances.length} séance{seances.length > 1 ? "s" : ""} enregistrée{seances.length > 1 ? "s" : ""}
      </p>

      {seances.length === 0 && (
        <div style={{
          background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
          padding: 40, textAlign: "center", boxShadow: "var(--ft-shadow-soft)"
        }}>
          <p style={{ fontSize: 40, marginBottom: 16 }}>🏃</p>
          <p style={{ fontSize: 14, color: "var(--ft-muted)", lineHeight: 1.6 }}>
            Aucune séance encore.<br />Lance-toi, on enregistre ta première sensation.
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {seances.map((seance: any) => (
          <div key={seance.id} style={{
            background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
            padding: "20px", boxShadow: "var(--ft-shadow-soft)",
            borderLeft: `4px solid ${seance.forme !== undefined ? getCouleurForme(seance.forme) : "var(--ft-line)"}`
          }}>

            {/* Sport + date */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>{getEmoji(seance.sport)}</span>
                <div>
                  <p style={{
                    fontFamily: "var(--ft-font-body)", fontSize: 15, fontWeight: 600,
                    color: "var(--ft-ink)", margin: 0
                  }}>
                    {getNomSport(seance.sport)}
                  </p>
                  <p style={{ fontSize: 12, color: "var(--ft-muted)", margin: 0 }}>
                    {seance.type} · {seance.date}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges Charge + Forme */}
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {seance.charge !== undefined && (
                <div style={{
                  flex: 1, background: "var(--ft-surface)", borderRadius: 12,
                  padding: "10px 8px", textAlign: "center"
                }}>
                  <p style={{
                    fontFamily: "var(--ft-font-data)", fontSize: 20, fontWeight: 500,
                    color: getCouleurCharge(seance.charge), margin: 0, lineHeight: 1
                  }}>{seance.charge}</p>
                  <p style={{ fontSize: 10, color: "var(--ft-muted)", marginTop: 4 }}>
                    charge · {getLabelCharge(seance.charge)}
                  </p>
                </div>
              )}
              {seance.forme !== undefined && (
                <div style={{
                  flex: 1, background: "var(--ft-surface)", borderRadius: 12,
                  padding: "10px 8px", textAlign: "center"
                }}>
                  <p style={{
                    fontFamily: "var(--ft-font-data)", fontSize: 20, fontWeight: 500,
                    color: getCouleurForme(seance.forme), margin: 0, lineHeight: 1
                  }}>{seance.forme}</p>
                  <p style={{ fontSize: 10, color: "var(--ft-muted)", marginTop: 4 }}>forme</p>
                </div>
              )}
              {seance.charge === undefined && seance.score !== undefined && (
                <div style={{
                  flex: 1, background: "var(--ft-surface)", borderRadius: 12,
                  padding: "10px 8px", textAlign: "center"
                }}>
                  <p style={{
                    fontFamily: "var(--ft-font-data)", fontSize: 20, fontWeight: 500,
                    color: getCouleurForme(seance.score), margin: 0, lineHeight: 1
                  }}>{seance.score}</p>
                  <p style={{ fontSize: 10, color: "var(--ft-muted)", marginTop: 4 }}>score</p>
                </div>
              )}
            </div>

            {/* Stats objectives */}
            {(seance.duree || seance.distance || seance.denivele || seance.parcours) && (
              <div style={{ display: "flex", gap: 16, marginBottom: seance.score_snc !== undefined ? 14 : 0 }}>
                {seance.duree && (
                  <div>
                    <p style={{ fontFamily: "var(--ft-font-data)", fontSize: 13, color: "var(--ft-ink)", margin: 0 }}>{seance.duree}</p>
                    <p style={{ fontSize: 11, color: "var(--ft-muted)", margin: 0 }}>durée</p>
                  </div>
                )}
                {seance.distance && (
                  <div>
                    <p style={{ fontFamily: "var(--ft-font-data)", fontSize: 13, color: "var(--ft-ink)", margin: 0 }}>{seance.distance} km</p>
                    <p style={{ fontSize: 11, color: "var(--ft-muted)", margin: 0 }}>distance</p>
                  </div>
                )}
                {seance.denivele && (
                  <div>
                    <p style={{ fontFamily: "var(--ft-font-data)", fontSize: 13, color: "var(--ft-ink)", margin: 0 }}>{seance.denivele} m</p>
                    <p style={{ fontSize: 11, color: "var(--ft-muted)", margin: 0 }}>D+</p>
                  </div>
                )}
                {seance.parcours && (
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--ft-ink)", margin: 0 }}>{seance.parcours}</p>
                    <p style={{ fontSize: 11, color: "var(--ft-muted)", margin: 0 }}>parcours</p>
                  </div>
                )}
              </div>
            )}

            {/* Sous-scores SNC / Muscu / Cardio */}
            {seance.score_snc !== undefined && (
              <div style={{
                display: "flex", gap: 8, paddingTop: 14,
                borderTop: "1px solid var(--ft-line)"
              }}>
                {[
                  { label: "SNC", val: seance.score_snc, color: "var(--ft-snc)" },
                  { label: "Muscu", val: seance.score_musculaire, color: "var(--ft-muscle)" },
                  { label: "Cardio", val: seance.score_cardio, color: "var(--ft-cardio)" },
                ].map(sys => (
                  <div key={sys.label} style={{
                    flex: 1, textAlign: "center",
                    background: "var(--ft-surface)", borderRadius: 10, padding: "6px 4px"
                  }}>
                    <p style={{
                      fontFamily: "var(--ft-font-data)", fontSize: 13, fontWeight: 500,
                      color: sys.color, margin: 0
                    }}>{sys.val}</p>
                    <p style={{ fontSize: 10, color: "var(--ft-muted)", margin: 0 }}>{sys.label}</p>
                  </div>
                ))}
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  )
}
