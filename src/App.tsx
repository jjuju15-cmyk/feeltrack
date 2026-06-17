import { useState } from "react"
import Formulaire from "./formulaire"
import Historique from "./historique"
import Profil from "./profil"
import Parametres from "./parametres"
import SensationOrb from "./SensationOrb"

// Statut d'entraînement (méthode ACWR)
const getStatut = (seances: any[]) => {
  const avecDonnees = seances.filter((s: any) => s.charge !== undefined && s.forme !== undefined)
  if (avecDonnees.length < 2) return null

  const maintenant = new Date()
  const diffJours = (d: string) =>
    (maintenant.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)

  const s7j = avecDonnees.filter((s: any) => diffJours(s.date) <= 7)
  const s28j = avecDonnees.filter((s: any) => diffJours(s.date) <= 28)

  const formeMoy = avecDonnees.slice(0, 3).reduce((a: number, s: any) => a + s.forme, 0) /
    Math.min(3, avecDonnees.length)

  // Nécessite au moins 3 séances de plus de 7 jours pour un ACWR fiable
  const seancesAnciennes = avecDonnees.filter((s: any) => diffJours(s.date) > 7)
  if (seancesAnciennes.length < 3) {
    if (formeMoy >= 70) return { label: "Forme optimale", message: "Bon départ ! Continue à enregistrer tes séances pour affiner le statut.", couleur: "var(--ft-cardio)" }
    return { label: "Démarrage", message: "Enregistre quelques semaines de séances pour activer le suivi de charge.", couleur: "#FFC107" }
  }

  const chargeAigue = s7j.length > 0 ? s7j.reduce((a: number, s: any) => a + s.charge, 0) / 7 : 0
  const chargeChronique = s28j.length > 0 ? s28j.reduce((a: number, s: any) => a + s.charge, 0) / 28 : chargeAigue
  const acwr = chargeChronique > 0 ? chargeAigue / chargeChronique : 1.0

  // Garde densité absolue : beaucoup de séances + forme basse = signal d'alerte
  if (s7j.length >= 6 && formeMoy < 55)
    return { label: "Volume élevé", message: "Beaucoup de séances cette semaine et forme en baisse — pense à récupérer", couleur: "#FF9800" }

  // Seuils ACWR : zone productive jusqu'à 1.5, alarme à partir de 2.0
  if (acwr > 2.0 && formeMoy < 45) return { label: "Surmenage détecté", message: "Repos obligatoire — ton corps est en surcharge", couleur: "#F44336" }
  if (acwr > 1.5) return { label: "Charge élevée", message: "Semaine chargée — surveille ta récupération", couleur: "#FF9800" }
  if (acwr < 0.8 && formeMoy < 50) return { label: "Récupération", message: "Charge faible, forme basse — récupération en cours", couleur: "var(--ft-muted)" }
  if (formeMoy >= 70 && acwr >= 0.8 && acwr <= 1.5) return { label: "Forme optimale", message: "Charge équilibrée et forme au top — continue !", couleur: "var(--ft-cardio)" }
  if (acwr >= 1.0 && acwr <= 1.5 && formeMoy >= 50) return { label: "En progression", message: "Charge productive — c'est le bon rythme !", couleur: "var(--ft-snc)" }
  return { label: "Maintenance", message: "Charge stable — maintiens le rythme", couleur: "#FFC107" }
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

export default function App() {
  const [pageActive, setPageActive] = useState("accueil")
  const [pseudo, setPseudo] = useState(localStorage.getItem("pseudo") || "")
  const [pseudoSaisi, setPseudoSaisi] = useState(!!localStorage.getItem("pseudo"))
  const [formulaireOuvert, setFormulaireOuvert] = useState(false)
  const [parametresOuverts, setParametresOuverts] = useState(false)

  const seances = JSON.parse(localStorage.getItem("seances") || "[]")

  const maintenant = new Date()
  const diffJours = (d: string) =>
    (maintenant.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24)

  const seances7j = seances.filter((s: any) => s.charge !== undefined && diffJours(s.date) <= 7)
  const chargeHebdo = seances7j.length > 0
    ? Math.round(seances7j.reduce((a: number, s: any) => a + s.charge, 0) / seances7j.length)
    : null

  const avecForme = seances.filter((s: any) => s.forme !== undefined)
  const formeMoyenne = avecForme.length > 0
    ? Math.round(avecForme.slice(0, 3).reduce((a: number, s: any) => a + s.forme, 0) / Math.min(3, avecForme.length))
    : null

  // Sous-scores pour l'orbe (3 dernières séances avec sous-scores)
  const avecSousScores = seances.filter((s: any) => s.score_snc !== undefined)
  const orbSnc = avecSousScores.length > 0
    ? Math.round(avecSousScores.slice(0, 3).reduce((a: number, s: any) => a + s.score_snc, 0) / Math.min(3, avecSousScores.length))
    : 50
  const orbMuscle = avecSousScores.length > 0
    ? Math.round(avecSousScores.slice(0, 3).reduce((a: number, s: any) => a + s.score_musculaire, 0) / Math.min(3, avecSousScores.length))
    : 50
  const orbCardio = avecSousScores.length > 0
    ? Math.round(avecSousScores.slice(0, 3).reduce((a: number, s: any) => a + s.score_cardio, 0) / Math.min(3, avecSousScores.length))
    : 50

  const statut = getStatut(seances)
  const aDonnees = chargeHebdo !== null || formeMoyenne !== null

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", position: "relative", paddingBottom: 88 }}>

      {/* Bouton paramètres */}
      <button onClick={() => setParametresOuverts(true)} style={{
        position: "fixed", top: 16, right: 16, zIndex: 90,
        background: "var(--ft-card)", border: "none",
        borderRadius: "var(--ft-r-orb)", width: 42, height: 42,
        fontSize: 18, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "var(--ft-shadow-soft)"
      }}>⚙️</button>

      {/* PAGE ACCUEIL */}
      {pageActive === "accueil" && (
        <div style={{ padding: "24px 20px" }}>

          {/* Onboarding — saisie pseudo */}
          {!pseudoSaisi && (
            <div style={{
              background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
              padding: 32, marginBottom: 24, textAlign: "center",
              boxShadow: "var(--ft-shadow-soft)"
            }}>
              <p style={{ fontFamily: "var(--ft-font-display)", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
                Bienvenue 👋
              </p>
              <p style={{ fontSize: 14, color: "var(--ft-muted)", marginBottom: 20 }}>Comment tu t'appelles ?</p>
              <input
                type="text"
                placeholder="Ton prénom…"
                value={pseudo}
                onChange={e => setPseudo(e.target.value)}
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "var(--ft-surface)", border: "none",
                  borderRadius: "var(--ft-r-input)", color: "var(--ft-ink)",
                  fontSize: 16, marginBottom: 12, outline: "none",
                  fontFamily: "var(--ft-font-body)"
                }}
              />
              <button
                onClick={() => { if (pseudo.trim()) { localStorage.setItem("pseudo", pseudo); setPseudoSaisi(true) } }}
                style={{
                  width: "100%", padding: "14px 22px",
                  background: "var(--ft-ink)", color: "#fff", border: "none",
                  borderRadius: "var(--ft-r-btn)", fontSize: 15, fontWeight: 600,
                  cursor: "pointer", fontFamily: "var(--ft-font-body)",
                  boxShadow: "var(--ft-shadow-soft)"
                }}
              >
                C'est parti !
              </button>
            </div>
          )}

          {/* En-tête */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{
              fontFamily: "var(--ft-font-display)", fontSize: 28, fontWeight: 700,
              color: "var(--ft-ink)", marginBottom: 16, letterSpacing: "-0.02em"
            }}>
              {pseudoSaisi ? `Bonjour ${pseudo} 👋` : "Bonjour 👋"}
            </h1>
            <button onClick={() => setFormulaireOuvert(true)} style={{
              width: "100%", padding: "15px 22px",
              background: "var(--ft-snc)", color: "#fff", border: "none",
              borderRadius: "var(--ft-r-btn)", fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "var(--ft-font-body)",
              boxShadow: "0 8px 24px rgba(124,111,240,0.35)", transition: "transform 0.15s ease",
              letterSpacing: "0.01em"
            }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              + Enregistrer ma séance
            </button>
          </div>

          {aDonnees ? (
            <>
              {/* Orbe signature */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
                <SensationOrb snc={orbSnc} muscle={orbMuscle} cardio={orbCardio} size={200} label="sensation" />
                <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
                  {[
                    { label: "SNC", val: orbSnc, color: "var(--ft-snc)" },
                    { label: "Muscu", val: orbMuscle, color: "var(--ft-muscle)" },
                    { label: "Cardio", val: orbCardio, color: "var(--ft-cardio)" },
                  ].map(ax => (
                    <div key={ax.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: ax.color }} />
                      <span style={{ fontFamily: "var(--ft-font-data)", fontSize: 14, color: "var(--ft-ink)" }}>{ax.val}</span>
                      <span style={{ fontSize: 11, color: "var(--ft-muted)" }}>{ax.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tuiles Charge + Forme */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div style={{
                  background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
                  padding: 20, boxShadow: "var(--ft-shadow-soft)"
                }}>
                  <p style={{ fontSize: 12, color: "var(--ft-muted)", letterSpacing: "0.03em", marginBottom: 8 }}>charge</p>
                  <p style={{
                    fontFamily: "var(--ft-font-data)", fontSize: 42, fontWeight: 500,
                    color: chargeHebdo !== null ? getCouleurCharge(chargeHebdo) : "var(--ft-muted)",
                    lineHeight: 1, margin: 0
                  }}>
                    {chargeHebdo ?? "—"}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--ft-muted)", marginTop: 6 }}>moy. / séance · 7j</p>
                </div>
                <div style={{
                  background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
                  padding: 20, boxShadow: "var(--ft-shadow-soft)"
                }}>
                  <p style={{ fontSize: 12, color: "var(--ft-muted)", letterSpacing: "0.03em", marginBottom: 8 }}>forme</p>
                  <p style={{
                    fontFamily: "var(--ft-font-data)", fontSize: 42, fontWeight: 500,
                    color: formeMoyenne !== null ? getCouleurForme(formeMoyenne) : "var(--ft-muted)",
                    lineHeight: 1, margin: 0
                  }}>
                    {formeMoyenne ?? "—"}
                  </p>
                  <p style={{ fontSize: 11, color: "var(--ft-muted)", marginTop: 6 }}>moy. 3 dernières</p>
                </div>
              </div>

              {/* Badge statut */}
              {statut && (
                <div style={{
                  background: "var(--ft-card)", borderRadius: "var(--ft-r-card)",
                  padding: "16px 20px", boxShadow: "var(--ft-shadow-soft)"
                }}>
                  <p style={{
                    fontSize: 14, fontWeight: 600, color: statut.couleur,
                    marginBottom: 4
                  }}>{statut.label}</p>
                  <p style={{ fontSize: 13, color: "var(--ft-muted)", margin: 0 }}>{statut.message}</p>
                </div>
              )}
            </>
          ) : (
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

        </div>
      )}

      {/* PAGE HISTORIQUE */}
      {pageActive === "historique" && <Historique />}

      {/* PAGE PROFIL */}
      {pageActive === "profil" && <Profil key={pageActive} />}

      {/* BARRE DE NAVIGATION — 3 bulles rondes */}
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 480,
        background: "var(--ft-card)",
        borderTop: "1px solid var(--ft-line)",
        display: "flex", justifyContent: "center", alignItems: "center",
        gap: 16, padding: "12px 24px 20px", zIndex: 50
      }}>
        {[
          { id: "accueil", icon: "🏠", label: "Accueil" },
          { id: "historique", icon: "📋", label: "Historique" },
          { id: "profil", icon: "👤", label: "Profil" },
        ].map(page => {
          const actif = pageActive === page.id
          return (
            <button key={page.id} onClick={() => setPageActive(page.id)} style={{
              flex: 1, display: "flex", flexDirection: "column",
              alignItems: "center", gap: 5, border: "none", cursor: "pointer",
              background: actif ? "var(--ft-snc)" : "var(--ft-surface)",
              borderRadius: 20, padding: "10px 8px",
              boxShadow: actif ? "0 4px 16px rgba(124,111,240,0.35)" : "var(--ft-shadow-soft)",
              transition: "all 0.2s ease",
              fontFamily: "var(--ft-font-body)"
            }}>
              <span style={{ fontSize: 20 }}>{page.icon}</span>
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: actif ? "#fff" : "var(--ft-muted)"
              }}>{page.label}</span>
            </button>
          )
        })}
      </div>

      {formulaireOuvert && <Formulaire onFermer={() => setFormulaireOuvert(false)} />}
      {parametresOuverts && <Parametres onFermer={() => setParametresOuverts(false)} />}

    </div>
  )
}
