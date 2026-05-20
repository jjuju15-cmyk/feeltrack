import { useState } from "react"

// 🎨 Couleur selon le score
const getCouleurScore = (score: number) => {
  if (score >= 75) return "#4CAF50"
  if (score >= 60) return "#FFC107"
  if (score >= 40) return "#FF9800"
  return "#F44336"
}

// 🏅 Emoji par sport
const getEmoji = (sport: string) => {
  const emojis: Record<string, string> = {
    course: "🏃", trail: "🌄", vtt: "🚵",
    velo: "🚴", natation: "🏊", muscu: "🏋️", crossfit: "💪"
  }
  return emojis[sport] || "🏅"
}

// 🏅 Nom du sport
const getNomSport = (sport: string) => {
  const noms: Record<string, string> = {
    course: "Course à pied", trail: "Trail", vtt: "VTT",
    velo: "Vélo route", natation: "Natation", muscu: "Musculation", crossfit: "CrossFit"
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
            borderLeft: `4px solid ${getCouleurScore(seance.score)}`
          }}>

            {/* Ligne 1 — sport + date + score */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
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
              {/* Badge score */}
              <div style={{
                backgroundColor: getCouleurScore(seance.score), borderRadius: "20px",
                padding: "4px 12px", fontSize: "14px", fontWeight: "bold", color: "white"
              }}>
                {seance.score}
              </div>
            </div>

            {/* Ligne 2 — stats */}
            <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
              {seance.duree && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "13px", fontWeight: "bold", color: "white", margin: 0 }}>{seance.duree}</p>
                  <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>Durée</p>
                </div>
              )}
              {seance.distance && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "13px", fontWeight: "bold", color: "white", margin: 0 }}>{seance.distance} km</p>
                  <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>Distance</p>
                </div>
              )}
              {seance.denivele && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "13px", fontWeight: "bold", color: "white", margin: 0 }}>{seance.denivele} m</p>
                  <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>D+</p>
                </div>
              )}
              {seance.parcours && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "13px", fontWeight: "bold", color: "white", margin: 0 }}>{seance.parcours}</p>
                  <p style={{ fontSize: "11px", color: "#555", margin: 0 }}>Parcours</p>
                </div>
              )}
            </div>

            {/* Ligne 3 — scores détaillés SNC/Muscu/Cardio */}
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

          </div>
        ))}
      </div>

    </div>
  )
}
