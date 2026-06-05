# FeelTrack — Contexte projet

Application mobile (React + TypeScript + Vite) de suivi de charge d'entraînement pour sportifs d'endurance, basée sur le **ressenti subjectif** plutôt que sur des capteurs.

## Sports couverts
Trail 🌄 · Course à pied 🏃 · VTT 🚵 · Vélo route 🚴

## Architecture fichiers
- `src/App.tsx` — shell, navigation, affichage accueil (Charge + Forme + Statut)
- `src/formulaire.tsx` — saisie de séance en sections dynamiques (8–9 étapes selon sport/type)
- `src/historique.tsx` — liste des séances avec badges Charge + Forme
- `src/profil.tsx` — stats, graphiques Charge/Forme, calendrier, aide
- `src/parametres.tsx` — profil utilisateur, objectifs, coefficients par sport

Stockage : **100% localStorage**, pas de backend.

## Les deux indicateurs principaux

### Charge de séance (0–200)
Effort réel fourni — monte avec sessions dures et conditions difficiles.
```
intensite = (cardio + respiration) / 10
charge = intensite × (dureeMin / 90) × coefSport × coefEnv × 70
```
Couleurs : bleu (≤30 légère) · vert (≤60 modérée) · orange (≤90 élevée) · rouge (>90 très élevée)

### Forme (0–100)
État subjectif de récupération — uniquement basé sur le ressenti, sans influence des conditions.
```
forme = énergie×0.25 + (6-fatigue)×0.25 + sommeil×0.20 + (6-douleur)×0.15 + motivation×0.15
normalisé : ((raw - 1) / 4) × 100
```
Couleurs : vert (≥75) · jaune (≥60) · orange (≥40) · rouge (<40)

### Statut d'entraînement (méthode ACWR)
Ratio charge aiguë (7j) / charge chronique (28j) combiné à la forme moyenne récente :
- 🟢 Forme optimale — ACWR 0.8–1.3 + forme ≥ 70
- 🔵 En progression — ACWR 1.0–1.3 + forme ≥ 50
- 🟡 Maintenance — équilibré
- 🟠 Charge élevée — ACWR > 1.3
- 🔴 Surmenage détecté — ACWR > 1.5 ET forme < 45
- ⚪ Récupération — ACWR < 0.8 + forme < 50

## Coefficients sport (trail = référence 1.0)
| Sport | Coef | Raison |
|---|---|---|
| Trail | 1.00 | Référence — SNC + muscu + cardio sollicités |
| VTT | 0.85 | Technique élevée, effort variable |
| Course à pied | 0.75 | Cardio dominant, peu de SNC |
| Vélo route | 0.65 | Endurance, faible SNC, peu d'impact |

Source : études PubMed sur charge neuromusculaire comparée par sport.

## Coefficients environnementaux (appliqués à la charge)

**Température**
- ≤0°C → ×1.15 · 1–10°C → ×1.05 · 11–25°C → ×1.00 · 26–32°C → ×1.12 · >32°C → ×1.25

**Météo**
- Soleil/nuageux → ×1.00 · Vent → ×1.10 · Pluie → ×1.15 · Neige → ×1.30

**Terrain (trail/VTT uniquement)**
- Sec → ×1.00 · Rocheux → ×1.15 · Boueux → ×1.25 · Enneigé → ×1.30

**Technicité (trail/VTT uniquement)**
- 1 → ×1.00 · 2 → ×1.05 · 3 → ×1.10 · 4 → ×1.18 · 5 → ×1.28

**Moment de la journée**
- Après-midi → ×1.00 · Soir → ×1.05 · Matin → ×1.08 · Nuit → ×1.15

## Formulaire — sections dynamiques par sport

Sections communes (tous sports) :
1. Infos générales (sport, type, parcours, date)
2. Données objectives (durée, distance, D+ selon sport)
3. Conditions (température, météo, moment)
4. **Section sport-spécifique** :
   - Trail / VTT → Terrain (état du sol + technicité)
   - Course à pied → Surface (route / piste / chemin / tapis)
   - Vélo route → Profil (plat / vallonné / montagneux)
5. État physique (énergie, jambes, cardio, respiration, douleur)
6. Récupération (sommeil, hydratation avant, nutrition avant, fatigue)
7. Mental (motivation, ressenti, gestion effort)
8. *(Compétition uniquement)* Nutrition (glucides pendant, digestif, hydratation course)
9. Note libre

## Données sauvegardées par séance (localStorage "seances")
`id, date, sport, type, parcours, duree, distance, denivele, meteo, moment, temperature, note`
`score, score_snc, score_musculaire, score_cardio` (ancien système — rétrocompat)
`charge, forme` (nouveaux indicateurs principaux)

## Ce qui reste à faire / à discuter
- Affiner les coefficients environnementaux à l'usage terrain
- Retravailler le calcul des 3 sous-scores (SNC / Musculaire / Cardio) pour mieux les aligner avec les nouveaux indicateurs
- Potentiellement : export des données, partage, version PWA installable
