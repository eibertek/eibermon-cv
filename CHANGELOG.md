# Changelog

Novedades del juego, de más nueva a más vieja. Formato libre: una línea por feature o fix relevante para quien juega (no un log técnico commit-por-commit).

## 2026-10-09

- **Medallas, puntaje y reinicio**: tres medallas en el HUD por completar categorías (todos los Eibermon atrapados, toda la experiencia laboral + archivo + buzón, o absolutamente todo). Las batallas ahora puntúan según el timing del ataque (rayo perfecto/bueno/ok), terminar el recorrido completo suma un bonus por velocidad y guarda el mejor tiempo, y hay un botón de reinicio que borra el progreso (conservando el mejor tiempo).
- **Vercel Web Analytics** habilitado.
- **Dominio propio**: el juego pasó a vivir en `eibermon-cv.eibertek.com.ar` (antes `cv-city`), con repo en GitHub bajo la cuenta de eibertek.
- Corregido: el personaje volvía a verse "jorobado" en la versión publicada tras un primer intento de fix al mesh con rig.
- Renombrados dos NPCs cuyo modelo generado se leía como hombre pese al nombre femenino (Valentina → Pedro, Priya → Marcos).

## 2026-10-08

- **Encuadre de la batalla**: la cámara de la escena de batalla ya no recorta la cabeza/pies de la criatura; el canvas ocupa el espacio real en vez de flotar chico en medio de un hueco vacío.
- **Viewport móvil**: el contenido ya no se corría fuera de la pantalla en mobile, y el pinch-zoom ya no descentraba los modales.
- **Edificios más grandes y más cerca uno del otro** (~2x), más trabajos del CV convertidos en edificios jugables (6 en total, incluyendo EY), y el panel de "trayectoria anterior" reubicado fuera del medio del camino.
- Corregido el aspecto "vidrio roto" / post-apocalíptico de los edificios (los prompts de generación evitaban ahora cualquier mención de vidrio/reflejos).
- **CV real integrado**, bilingüe (inglés por defecto, español como toggle): los 5 trabajos más recientes son edificios + NPC completos, el resto queda resumido en un panel de "trayectoria anterior".
- Los edificios dejaron de tener nombre visible salvo que el código lo determine explícitamente.

## Antes de esto (hitos fundacionales)

- El juego arrancó como un CV en 3D isométrico explorable, con un personaje jugable (luego dos: una mujer y un hombre pelado con barba, ambos con animación de caminata).
- Las habilidades/skills se convirtieron en **Eibermon**: criaturitas que deambulan por el mapa y que hay que atacar con un rayo y atrapar con una Eiberball para revelar el detalle de la skill (sin marca Pokémon/Poké). Cada Eibermon tiene un diseño temático propio (ej. Node.js = bicho verde de muchas patas, Next.js = criatura alada azul, AWS = nube naranja sonriente), generado en 3D y mostrado en la batalla con el modelo real.
- Los edificios se volvieron semi-transparentes cuando tapan la vista de un NPC cercano.