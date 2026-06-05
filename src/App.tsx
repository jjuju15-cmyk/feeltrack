import { useState } from "react"
import Formulaire from "./formulaire"
import Historique from "./historique"
import Profil from "./profil"
import Parametres from "./parametres"

// 🎨 Couleur forme (0-100)
const getCouleurForme = (v: number) => {
  if (v >= 75) return "#4CAF50"
  if (v >= 60) return "#FFC107"
  if (v >= 40) return "#FF9800"
  return "#F44336"
}

// 🎨 Couleur charge (0-200)
const getCouleurCharge = (v: number) => {
  if (v <= 30) return "#4A90E2"
  if (v <= 60) return "#4CAF50"
  if (v <= 90) return "#FF9800"
  return "#F44336"
}

// 🏷️ Statut d'entraînement (méthode ACWR)
const getStatut = (seances: any[]) => {
  const avecDonnees = seances.filter((s: any) => s.charge !== undefined && s.forme !== undefined)
  if (avecDonnees.length < 2) return null

  const maintenant = new Date()
  const diffJours = (d: string) =>
    (maintenant.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)

  const s7j = avecDonnees.filter((s: any) => diffJours(s.date) <= 7)
  const s28j = avecDonnees.filter((s: any) => diffJours(s.date) <= 28)

  const chargeAigue = s7j.length > 0
    ? s7j.reduce((a: number, s: any) => a + s.charge, 0) / 7
    : 0
  const chargeChronique = s28j.length > 0
    ? s28j.reduce((a: number, s: any) => a + s.charge, 0) / 28
    : chargeAigue

  const acwr = chargeChronique > 0 ? chargeAigue / chargeChronique : 1.0
  const formeMoy = avecDonnees.slice(0, 3).reduce((a: number, s: any) => a + s.forme, 0) /
    Math.min(3, avecDonnees.length)

  if (acwr > 1.5 && formeMoy < 45)
    return { emoji: "🔴", label: "Surmenage détecté", message: "Repos obligatoire — ton corps est en surcharge", couleur: "#F44336" }
  if (acwr > 1.3)
    return { emoji: "🟠", label: "Charge élevée", message: "Réduis l'intensité, surveille ta récupération", couleur: "#FF9800" }
  if (acwr < 0.8 && formeMoy < 50)
    return { emoji: "⚪", label: "Récupération", message: "Charge faible, forme basse — récupération en cours", couleur: "#888" }
  if (formeMoy >= 70 && acwr >= 0.8 && acwr <= 1.3)
    return { emoji: "🟢", label: "Forme optimale", message: "Charge équilibrée et forme au top — continue !", couleur: "#4CAF50" }
  if (acwr >= 1.0 && acwr <= 1.3 && formeMoy >= 50)
    return { emoji: "🔵", label: "En progression", message: "Charge productive — veille à bien récupérer", couleur: "#1a73e8" }
  return { emoji: "🟡", label: "Maintenance", message: "Charge stable — maintiens le rythme", couleur: "#FFC107" }
}

export default function App() {
  const [pageActive, setPageActive] = useState("accueil")
  const [pseudo, setPseudo] = useState(localStorage.getItem("pseudo") || "")
  const [pseudoSaisi, setPseudoSaisi] = useState(!!localStorage.getItem("pseudo"))
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [parametresOuverts, setParametresOuverts] = useState(false)

  const seances = JSON.parse(localStorage.getItem("seances") || "[]")

  // Charge : moyenne par séance sur les 7 derniers jours
  const maintenant = new Date()
  const diffJours = (d: string) =>
    (maintenant.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)
  const seances7j = seances.filter((s: any) => s.charge !== undefined && diffJours(s.date) <= 7)
  const chargeHebdo = seances7j.length > 0
    ? Math.round(seances7j.reduce((a: number, s: any) => a + s.charge, 0) / seances7j.length)
    : null

  // Forme : moyenne des 3 dernières séances
  const avecForme = seances.filter((s: any) => s.forme !== undefined)
  const formeMoyenne = avecForme.length > 0
    ? Math.round(avecForme.slice(0, 3).reduce((a: number, s: any) => a + s.forme, 0) / Math.min(3, avecForme.length))
    : null

  const statut = getStatut(seances)

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", position: "relative", paddingBottom: "80px" }}>

      {/* ⚙️ Bouton paramètres */}
      <button onClick={() => setParametresOuverts(true)} style={{
        position: "fixed", top: "16px", right: "16px", zIndex: 90,
        backgroundColor: "#1e1e1e", border: "1px solid #2a2a2a", borderRadius: "50%",
        width: "42px", height: "42px", fontSize: "18px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}>⚙️</button>

      {/* PAGE ACCUEIL */}
      {pageActive === "accueil" && (
        <div style={{ padding: "20px" }}>

          {/* Saisie pseudo */}
          {!pseudoSaisi && (
            <div style={{ backgroundColor: "#1e1e1e", borderRadius: "16px", padding: "32px", marginBottom: "24px", textAlign: "center" }}>
              <p style={{ fontSize: "20px", marginBottom: "20px" }}>👋 Bienvenue !</p>
              <p style={{ fontSize: "14px", color: "#888", marginBottom: "16px" }}>Comment tu t'appelles ?</p>
              <input type="text" placeholder="Ton prénom..." value={pseudo}
                onChange={e => setPseudo(e.target.value)}
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

          {/* Tuiles Charge + Forme */}
          {(chargeHebdo !== null || formeMoyenne !== null) ? (
            <>
              <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                {/* Charge */}
                <div style={{
                  flex: 1, backgroundColor: "#1e1e1e", borderRadius: "16px", padding: "20px",
                  textAlign: "center", border: `2px solid ${chargeHebdo !== null ? getCouleurCharge(chargeHebdo) : "#2a2a2a"}`
                }}>
                  <p style={{ fontSize: "11px", color: "#888", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Charge</p>
                  <p style={{ fontSize: "52px", fontWeight: "bold", color: chargeHebdo !== null ? getCouleurCharge(chargeHebdo) : "#555", margin: 0, lineHeight: 1 }}>
                    {chargeHebdo ?? "—"}
                  </p>
                  <p style={{ fontSize: "10px", color: "#555", marginTop: "6px" }}>moy. / séance · 7j</p>
                </div>
                {/* Forme */}
                <div style={{
                  flex: 1, backgroundColor: "#1e1e1e", borderRadius: "16px", padding: "20px",
                  textAlign: "center", border: `2px solid ${formeMoyenne !== null ? getCouleurForme(formeMoyenne) : "#2a2a2a"}`
                }}>
                  <p style={{ fontSize: "11px", color: "#888", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>Forme</p>
                  <p style={{ fontSize: "52px", fontWeight: "bold", color: formeMoyenne !== null ? getCouleurForme(formeMoyenne) : "#555", margin: 0, lineHeight: 1 }}>
                    {formeMoyenne ?? "—"}
                  </p>
                  <p style={{ fontSize: "10px", color: "#555", marginTop: "6px" }}>moy. 3 dernières séances</p>
                </div>
              </div>

              {/* Statut d'entraînement */}
              {statut && (
                <div style={{
                  backgroundColor: "#1e1e1e", borderRadius: "12px", padding: "16px",
                  border: `1px solid ${statut.couleur}`, marginBottom: "8px"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                    <span style={{ fontSize: "18px" }}>{statut.emoji}</span>
                    <p style={{ fontSize: "15px", fontWeight: "bold", color: statut.couleur, margin: 0 }}>{statut.label}</p>
                  </div>
                  <p style={{ fontSize: "13px", color: "#888", margin: 0, paddingLeft: "28px" }}>{statut.message}</p>
                </div>
              )}
            </>
          ) : (
            <div style={{ backgroundColor: "#1e1e1e", borderRadius: "16px", padding: "32px", textAlign: "center", border: "1px solid #2a2a2a" }}>
              <p style={{ fontSize: "32px", marginBottom: "12px" }}>🏃</p>
              <p style={{ fontSize: "13px", color: "#555" }}>Ajoute tes premières séances pour voir ta charge et ta forme</p>
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

      {formulaireOuvert && <Formulaire onFermer={() => { setFormulaireOuvert(false) }} />}
      {parametresOuverts && <Parametres onFermer={() => setParametresOuverts(false)} />}

    </div>
  )
}
