import { useState } from "react"
import Formulaire from "./Formulaire"
import Historique from "./historique"
import Profil from "./profil"
import Parametres from "./Parametres"

// 🏅 Liste des sports
const sports = [
  { id: "tous", label: "Tous les sports", emoji: "🏅" },
  { id: "course", label: "Course à pied", emoji: "🏃" },
  { id: "trail", label: "Trail", emoji: "🌄" },
  { id: "vtt", label: "VTT", emoji: "🚵" },
  { id: "velo", label: "Vélo route", emoji: "🚴" },
  { id: "natation", label: "Natation", emoji: "🏊" },
  { id: "muscu", label: "Musculation", emoji: "🏋️" },
  { id: "crossfit", label: "CrossFit", emoji: "💪" },
]

// 🎨 Couleur et message selon le score
const getCouleur = (score: number) => {
  if (score >= 75) return "#4CAF50"
  if (score >= 60) return "#FFC107"
  if (score >= 40) return "#FF9800"
  return "#F44336"
}
const getMessage = (score: number) => {
  if (score >= 75) return "Forme optimale — continue comme ça"
  if (score >= 60) return "Légère fatigue — surveille ta récupération"
  if (score >= 40) return "Charge élevée — pense à récupérer"
  return "Surcharge détectée — repos recommandé 🛑"
}

export default function App() {
  const [pageActive, setPageActive] = useState("accueil")
  const [sportActif, setSportActif] = useState("tous")
  const [pseudo, setPseudo] = useState(localStorage.getItem("pseudo") || "")
  const [pseudoSaisi, setPseudoSaisi] = useState(!!localStorage.getItem("pseudo"))
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [parametresOuverts, setParametresOuverts] = useState(false)

  // 🔄 Recharger les séances et coefficients
  const seances = JSON.parse(localStorage.getItem("seances") || "[]")
  const COEFFICIENTS = (() => {
    const saved = localStorage.getItem("coefficients")
    return saved ? JSON.parse(saved) : {
      course: 0.78, trail: 0.98, vtt: 0.76, velo: 0.70,
      natation: 0.70, muscu: 0.73, crossfit: 1.0
    }
  })()

  // 🧮 Score selon le sport sélectionné
  const calculerScoreAffiche = () => {
    if (seances.length === 0) return null
    const seancesFiltrees = sportActif === "tous"
      ? seances.slice(0, 10)
      : seances.filter((s: any) => s.sport === sportActif).slice(0, 10)
    if (seancesFiltrees.length === 0) return null
    if (sportActif === "tous" && seancesFiltrees.length < 2) return null
    if (sportActif === "tous") {
      const somme = seancesFiltrees.reduce((acc: number, s: any) => acc + s.score * (COEFFICIENTS[s.sport] || 0.75), 0)
      const coefTotal = seancesFiltrees.reduce((acc: number, s: any) => acc + (COEFFICIENTS[s.sport] || 0.75), 0)
      return { score: Math.round(somme / coefTotal), nbSeances: seancesFiltrees.length }
    } else {
      const moyenne = Math.round(seancesFiltrees.reduce((acc: number, s: any) => acc + s.score, 0) / seancesFiltrees.length)
      return { score: moyenne, nbSeances: seancesFiltrees.length }
    }
  }

  const resultat = calculerScoreAffiche()

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", position: "relative", paddingBottom: "80px" }}>

      {/* ⚙️ Bouton paramètres — visible sur toutes les pages */}
      <button onClick={() => setParametresOuverts(true)} style={{
        position: "fixed", top: "16px", right: "16px",
        zIndex: 90, backgroundColor: "#1e1e1e",
        border: "1px solid #2a2a2a", borderRadius: "50%",
        width: "42px", height: "42px", fontSize: "18px",
        cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "center"
      }}>
        ⚙️
      </button>

      {/* PAGE ACCUEIL */}
      {pageActive === "accueil" && (
        <div style={{ padding: "20px" }}>

          {/* Saisie pseudo */}
          {!pseudoSaisi && (
            <div style={{ backgroundColor: "#1e1e1e", borderRadius: "16px", padding: "32px", marginBottom: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "20px", marginBottom: "20px" }}>👋 Bienvenue !</p>
              <p style={{ fontSize: "14px", color: "#888", marginBottom: "16px" }}>Comment tu t'appelles ?</p>
              <input type="text" placeholder="Ton prénom..." value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
                style={{ width: "100%", padding: "12px", backgroundColor: "#2a2a2a", border: "1px solid #333", borderRadius: "8px", color: "white", fontSize: "16px", marginBottom: "12px", outline: "none" }} />
              <button onClick={() => { if (pseudo.trim()) { localStorage.setItem("pseudo", pseudo); setPseudoSaisi(true) } }}
                style={{ width: "100%", padding: "14px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "bold", cursor: "pointer" }}>
                C'est parti ! 🚀
              </button>
            </div>
          )}

          {/* En-tête */}
          <div style={{ marginBottom: "28px", paddingTop: "8px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "16px", color: "#ffffff" }}>
              {pseudoSaisi ? `Bonjour ${pseudo} 👋` : "Bonjour 👋"}
            </h1>
            <button onClick={() => setFormulaireOuvert(true)} style={{
              width: "100%", padding: "16px", backgroundColor: "#4CAF50",
              color: "white", border: "none", borderRadius: "12px",
              fontSize: "16px", fontWeight: "bold", cursor: "pointer"
            }}>
              + Nouvelle séance
            </button>
          </div>

          {/* Boutons sport en colonne */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "28px" }}>
            {sports.map((sport) => (
              <button key={sport.id} onClick={() => setSportActif(sport.id)} style={{
                width: "100%", padding: "14px 16px",
                backgroundColor: sportActif === sport.id ? "#1a73e8" : "#1e1e1e",
                color: sportActif === sport.id ? "white" : "#aaaaaa",
                border: sportActif === sport.id ? "1px solid #1a73e8" : "1px solid #2a2a2a",
                borderRadius: "10px", fontSize: "15px", cursor: "pointer",
                textAlign: "left", transition: "all 0.2s ease"
              }}>
                {sport.emoji} {sport.label}
              </button>
            ))}
          </div>

          {/* Tuile score */}
          {resultat ? (
            <div style={{ backgroundColor: "#1e1e1e", borderRadius: "16px", padding: "28px", textAlign: "center", border: `2px solid ${getCouleur(resultat.score)}` }}>
              <p style={{ fontSize: "13px", color: "#888", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Score de forme — {sports.find(s => s.id === sportActif)?.label}
              </p>
              <p style={{ fontSize: "64px", fontWeight: "bold", color: getCouleur(resultat.score), margin: "0", lineHeight: "1" }}>
                {resultat.score}
              </p>
              <div style={{ height: "6px", backgroundColor: getCouleur(resultat.score), borderRadius: "3px", margin: "16px 0", opacity: 0.6 }} />
              <p style={{ fontSize: "13px", color: getCouleur(resultat.score), fontWeight: "bold" }}>{getMessage(resultat.score)}</p>
              <p style={{ fontSize: "11px", color: "#555", marginTop: "8px" }}>Basé sur {resultat.nbSeances} séance(s)</p>
            </div>
          ) : (
            <div style={{ backgroundColor: "#1e1e1e", borderRadius: "16px", padding: "28px", textAlign: "center", border: "1px solid #2a2a2a" }}>
              <p style={{ fontSize: "13px", color: "#555" }}>
                {sportActif === "tous" ? "Ajoute 2 séances pour voir ton score global" : "Ajoute une séance pour voir ton score"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* PAGE HISTORIQUE */}
      {pageActive === "historique" && <Historique />}

      {/* PAGE PROFIL */}
      {pageActive === "profil" && <Profil key={pageActive} />}

      {/* BARRE DE NAVIGATION */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: "480px", backgroundColor: "#1a1a1a",
        borderTop: "1px solid #2a2a2a", display: "flex",
        justifyContent: "space-around", padding: "12px 0", zIndex: 50
      }}>
        {[
          { id: "accueil", emoji: "🏠", label: "Accueil" },
          { id: "historique", emoji: "📋", label: "Historique" },
          { id: "profil", emoji: "👤", label: "Profil" },
        ].map(page => (
          <button key={page.id} onClick={() => setPageActive(page.id)} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            backgroundColor: "transparent", border: "none", cursor: "pointer",
            color: pageActive === page.id ? "#4CAF50" : "#555", gap: "4px"
          }}>
            <span style={{ fontSize: "22px" }}>{page.emoji}</span>
            <span style={{ fontSize: "11px" }}>{page.label}</span>
          </button>
        ))}
      </div>

      {/* Formulaire nouvelle séance */}
      {formulaireOuvert && <Formulaire onFermer={() => setFormulaireOuvert(false)} />}

      {/* Paramètres */}
      {parametresOuverts && <Parametres onFermer={() => setParametresOuverts(false)} />}

    </div>
  )
}
