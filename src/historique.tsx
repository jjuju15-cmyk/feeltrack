import { useState } from "react"

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

const getLabelCharge = (v: number) => {
  if (v <= 30) return "Légère"
  if (v <= 60) return "Modérée"
  if (v <= 90) return "Élevée"
  return "Très élevée"
}

// 🏅 Emoji par sport
const getEmoji = (sport: string) => {
  const emojis: Record<string, string> = {
    trail: "🌄", course: "🏃", vtt: "🚵", velo: "🚴"
  }
  return emojis[sport] || "🏅"
}

// 🏅 Nom du sport
const getNomSport = (sport: string) => {
  const noms: Record<string, string> = {
    trail: "Trail", course: "Course à pied", vtt: "VTT", velo: "Vélo route"
  }
  return noms[sport] || sport
}

export default function Historique() {
  // 📋 Charger les vraies séances depuis localStorage
  const [seances] = useState(() => {
    return JSON.parse(localStorage.getItem("seances") || "[]")
  })

  return (
    <div style={{ padding: "20px" }}>

      {/* Titre */}
      <h1 style={{ fontSize: "24px", color: "white", marginBottom: "8px" }}>📋 Historique</h1>
      <p style={{ fontSize: "13px", color: "#555", marginBottom: "24px" }}>
        {seances.length} séance(s) enregistrée(s)
      </p>

      {/* Message si aucune séance */}
      {seances.length === 0 && (
        <div style={{ backgroundColor: "#1e1e1e", borderRadius: "12px", padding: "32px", textAlign: "center", border: "1px solid #2a2a2a" }}>
          <p style={{ fontSize: "32px", marginBottom: "12px" }}>🏃</p>
          <p style={{ color: "#555", fontSize: "14px" }}>Aucune séance pour l'instant</p>
          <p style={{ color: "#333", fontSize: "13px", marginTop: "8px" }}>Ajoute ta première séance !</p>
        </div>
      )}

      {/* Liste des séances */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {seances.map((seance: any) => (
          <div key={seance.id} style={{
            backgroundColor: "#1e1e1e", borderRadius: "12px", padding: "16px",
            border: "1px solid #2a2a2a",
            borderLeft: `4px solid ${seance.forme !== undefined ? getCouleurForme(seance.forme) : "#2a2a2a"}`
          }}>

            {/* Ligne 1 — sport + date */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>{getEmoji(seance.sport)}</span>
                <div>
                  <p style={{ fontSize: "15px", color: "white", fontWeight: "bold", margin: 0 }}>
                    {getNomSport(seance.sport)}
                  </p>
                  <p style={{ fontSize: "12px", color: "#555", margin: 0 }}>
                    {seance.type} • {seance.date}
                  </p>
                </div>
              </div>
            </div>

            {/* Badges Charge + Forme */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
              {seance.charge !== undefined && (
                <div style={{ flex: 1, backgroundColor: "#2a2a2a", borderRadius: "8px", padding: "10px", textAlign: "center", borderTop: `3px solid ${getCouleurCharge(seance.charge)}` }}>
                  <p style={{ fontSize: "18px", fontWeight: "bold", color: getCouleurCharge(seance.charge), margin: 0 }}>{seance.charge}</p>
                  <p style={{ fontSize: "10px", color: "#555", margin: "2px 0 0" }}>Charge · {getLabelCharge(seance.charge)}</p>
                </div>
              )}
              {seance.forme !== undefined && (
                <div style={{ flex: 1, backgroundColor: "#2a2a2a", borderRadius: "8px", padding: "10px", textAlign: "center", borderTop: `3px solid ${getCouleurForme(seance.forme)}` }}>
                  <p style={{ fontSize: "18px", fontWeight: "bold", color: getCouleurForme(seance.forme), margin: 0 }}>{seance.forme}</p>
                  <p style={{ fontSize: "10px", color: "#555", margin: "2px 0 0" }}>Forme</p>
                </div>
              )}
              {seance.charge === undefined && seance.score !== undefined && (
                <div style={{ flex: 1, backgroundColor: "#2a2a2a", borderRadius: "8px", padding: "10px", textAlign: "center" }}>
                  <p style={{ fontSize: "18px", fontWeight: "bold", color: getCouleurForme(seance.score), margin: 0 }}>{seance.score}</p>
                  <p style={{ fontSize: "10px", color: "#555", margin: "2px 0 0" }}>Score</p>
                </div>
              )}
            </div>

            {/* Stats objectifs */}
            <div style={{ display: "flex", gap: "12px" }}>
              {seance.duree && (
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "bold", color: "white", margin: 0 }}>{seance.duree}</p>
                  <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>Durée</p>
                </div>
              )}
              {seance.distance && (
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "bold", color: "white", margin: 0 }}>{seance.distance} km</p>
                  <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>Distance</p>
                </div>
              )}
              {seance.denivele && (
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "bold", color: "white", margin: 0 }}>{seance.denivele} m</p>
                  <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>D+</p>
                </div>
              )}
              {seance.parcours && (
                <div>
                  <p style={{ fontSize: "13px", fontWeight: "bold", color: "white", margin: 0 }}>{seance.parcours}</p>
                  <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>Parcours</p>
                </div>
              )}
            </div>

            {/* Détail SNC/Muscu/Cardio */}
            {(seance.score_snc !== undefined) && (
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #2a2a2a" }}>
                {[
                  { label: "SNC", valeur: seance.score_snc, couleur: "#FF6B35" },
                  { label: "Muscu", valeur: seance.score_musculaire, couleur: "#4A90E2" },
                  { label: "Cardio", valeur: seance.score_cardio, couleur: "#50C878" },
                ].map(sys => (
                  <div key={sys.label} style={{ flex: 1, textAlign: "center", backgroundColor: "#2a2a2a", borderRadius: "6px", padding: "6px" }}>
                    <p style={{ fontSize: "13px", fontWeight: "bold", color: sys.couleur, margin: 0 }}>{sys.valeur}</p>
                    <p style={{ fontSize: "10px", color: "#555", margin: 0 }}>{sys.label}</p>
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
