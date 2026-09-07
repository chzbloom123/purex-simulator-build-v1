# PUREX Storage Tunnels — User Guide

## What this is

A first-person, browser-based historical simulation of the Hanford PUREX Storage Tunnels
(218-E-14 "Tunnel 1" and 218-E-15 "Tunnel 2") as they stood around 1999: loaded to their
final 36 railcars, sealed, and still standing.

No person ever entered the loaded tunnels. Interior radiation exceeded 5 roentgen per hour
from the first railcar onward, and no photograph of the loaded interiors exists. In 2017 and
2019 both tunnels were filled solid with engineered grout. The walk this simulation offers was
impossible while the tunnels stood and is impossible now.

Everything is built from the public record: the RCRA permit application, DOE engineering
evaluations, construction-era photographs, and as-built drawing excerpts. Where the record is
silent, the simulation infers period-plausible detail, and inferred details are labeled as
inferred. Placards inside the tunnels quote their sources.

**This is not site information.** It is not a substitute for any Hanford document, procedure,
or training. Photo credits where imagery is shown: U.S. Department of Energy.

## Using the simulation

Open the site in a modern desktop or mobile browser. You will see an entry screen that states
what the simulation is and is not. Click **Enter the railroad tunnel** to begin.

### Desktop controls

| Action | Key |
| --- | --- |
| Move | W A S D or arrow keys |
| Look | Mouse (click the view to lock the pointer, Esc to release) |
| Run | Shift |
| Step through a sealed door | E, when the prompt appears |
| Inspection view (free camera) | F to toggle |

### Touch controls

On a phone or tablet, use the pad in the lower left to move and drag anywhere else to look.
A **Step through** button appears when you are at a sealed door.

### Jump menu

The **Jump to…** dropdown in the heads-up display takes you directly to any named position:
the railroad tunnel, the junction, either tunnel door, or any of the 36 railcar positions.
Use it to reach a specific car without walking the full length.

### Heads-up display

- The top line names where you are (for example, "Tunnel 2 · position 14").
- A second line names the current mode, such as inspection view.
- A prompt appears when an action is available, such as stepping through a door.

### Placards

Small white boards stand beside points of interest. Walk up to one and its text appears in a
panel: a title, a short body, and the source it is drawn from. Placards mark only what the
record documents, including the water-fillable doors, the 1 percent downgrade, the two-car
HA column in Tunnel 1, the L-1 pulser car, the tank cars emptied under RCRA, and the 1964
construction collapses in Tunnel 2.

## What is real and what is a conceit

Real, from the record: tunnel dimensions and construction, the railcar inventory and its
order, door details, the grade, the sealed state circa 1999.

Presentation conceits, not history: the visitor's headlamp, the ability to pass through the
sealed doors, and the inspection view. The interior was unlit, unpowered, and closed.

## Where things live in the repository

- `canon.md` is the factual authority. Every dimension and date traces to it.
- `decisions.md` lists every choice the record did not dictate.
- `issues.md` logs problems encountered during the build.
- `image-log.md` records the provenance of every reference image under `images/`.
- `public/placards.json` holds the placard text shown in the simulation.

## Running or building it yourself

Requires Node 24 or later.

```
npm install
npm run dev        # local server at http://localhost:5173
npm run build      # static site written to dist/
npm run preview    # serve the built dist/ locally
```

The site is fully static. Hosting on Netlify needs no settings beyond what `netlify.toml`
already declares: build with `npm run build`, publish the `dist/` folder.
