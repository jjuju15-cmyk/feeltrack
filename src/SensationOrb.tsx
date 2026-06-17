import { CSSProperties } from "react";

/**
 * SensationOrb — élément signature de FeelTrack.
 * Orbe doux qui mélange les 3 axes (SNC / Musculaire / Cardio) selon leurs
 * valeurs (0–100) et affiche le score global pondéré au centre.
 * Pondération FeelTrack : SNC 35% + Musculaire 35% + Cardio 30%.
 *
 * Aucune dépendance externe. Importe d'abord design-tokens.css (pour les
 * couleurs et la keyframe ft-breathe).
 */

type SensationOrbProps = {
  snc: number;      // 0–100
  muscle: number;   // 0–100
  cardio: number;   // 0–100
  size?: number;    // diamètre en px (défaut 220)
  label?: string;   // libellé sous le chiffre (défaut "sensation")
};

const clamp = (v: number) => Math.max(0, Math.min(100, v));

// Opacité d'un calque : présence mini garantie + montée avec la valeur.
const layerAlpha = (v: number) => 0.22 + 0.62 * (clamp(v) / 100);

export default function SensationOrb({
  snc,
  muscle,
  cardio,
  size = 220,
  label = "sensation",
}: SensationOrbProps) {
  const s = clamp(snc);
  const m = clamp(muscle);
  const c = clamp(cardio);

  const global = Math.round(s * 0.35 + m * 0.35 + c * 0.3);

  // Mélange organique : un radial-gradient par axe, positionné à 3 endroits,
  // dont l'opacité suit la valeur de l'axe. Le tout sur une base sombre douce.
  const orbStyle: CSSProperties = {
    width: size,
    height: size,
    borderRadius: "var(--ft-r-orb, 9999px)",
    background: [
      `radial-gradient(circle at 32% 28%, rgba(124,111,240,${layerAlpha(s)}), transparent 62%)`,
      `radial-gradient(circle at 70% 32%, rgba(255,122,102,${layerAlpha(m)}), transparent 62%)`,
      `radial-gradient(circle at 50% 78%, rgba(45,212,191,${layerAlpha(c)}), transparent 62%)`,
      "radial-gradient(circle at 50% 40%, #3a3357, #241d3a)",
    ].join(", "),
    boxShadow: "var(--ft-shadow-lift, 0 12px 40px rgba(124,111,240,0.18))",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#FFFFFF",
    position: "relative",
    isolation: "isolate",
  };

  const glowStyle: CSSProperties = {
    position: "absolute",
    inset: -size * 0.18,
    borderRadius: "var(--ft-r-orb, 9999px)",
    background:
      "radial-gradient(circle, rgba(124,111,240,0.35), transparent 70%)",
    filter: "blur(28px)",
    zIndex: -1,
  };

  return (
    <div
      className="ft-orb-breathe"
      style={{ animation: "ft-breathe 4s ease-in-out infinite", width: size, height: size }}
      role="img"
      aria-label={`Score ${label} : ${global} sur 100`}
    >
      <div style={orbStyle}>
        <span style={glowStyle} aria-hidden="true" />
        <span
          style={{
            fontFamily: "var(--ft-font-data, monospace)",
            fontSize: size * 0.28,
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}
        >
          {global}
        </span>
        <span
          style={{
            fontFamily: "var(--ft-font-body, sans-serif)",
            fontSize: size * 0.075,
            opacity: 0.85,
            marginTop: size * 0.03,
            textTransform: "lowercase",
            letterSpacing: "0.04em",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/* Exemple d'utilisation :
   <SensationOrb snc={72} muscle={58} cardio={64} />
*/
