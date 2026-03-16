# Murmurations

Live demo: <https://michelnivard.github.io/murmurations/>

`murmurations` is a Quarto presentation template that uses the `revealjs` format and adds a custom animated background flock.

If you are new to Quarto, the short version is:

- you write slides in Markdown
- Quarto renders them to HTML
- Reveal.js is the slide framework that powers the final presentation

This project gives you a complete working example with:

- a dawn-gradient background
- faint low-poly hills
- a simulated murmuration of birds
- slide-change disturbance waves
- a ready-to-publish GitHub Pages output in `docs/`

## What Are Quarto And Reveal.js?

Quarto is an open-source publishing system for documents, websites, books, and presentations.

Reveal.js is an HTML presentation framework. In Quarto, you use it by choosing the `revealjs` format. Quarto then generates the Reveal.js presentation for you.

Official documentation:

- Quarto presentations overview: <https://quarto.org/docs/presentations/>
- Quarto Reveal.js guide: <https://quarto.org/docs/presentations/revealjs/>
- Reveal.js format reference in Quarto: <https://quarto.org/docs/reference/formats/presentations/revealjs>

The Quarto Reveal.js guide explains that slides are usually created from Markdown headings, with level 2 headings (`##`) becoming slides and level 1 headings (`#`) often used for section or title slides.

## Project Layout

- `_quarto.yml`: project-level Quarto configuration
- `index.qmd`: the demo presentation source written in Markdown
- `theme.scss`: visual theme and Reveal.js styling
- `flock.js`: the background simulation and rendering logic
- `docs/`: rendered output for GitHub Pages

## First-Time Setup

1. Install Quarto from <https://quarto.org/>
2. Clone this repository
3. Open the project folder in your editor
4. Run `quarto preview` to start a live preview

You do not need to know Reveal.js internals to start editing. For most changes, you only need `index.qmd`, `theme.scss`, and `flock.js`.

## How To Work On The Slides

Edit the demo deck in `index.qmd`.

Useful commands:

```sh
quarto preview
```

Starts a local preview server and rebuilds the slides when files change.

```sh
quarto render
```

Builds the final presentation into `docs/`.

## How Slide Authoring Works

Quarto presentations are written in Markdown. For example:

```md
## Slide Title

Some text.

- Point one
- Point two
```

That becomes one Reveal.js slide.

You can also use:

- code blocks
- images
- speaker notes
- columns
- incremental lists

All of those features are described in the Quarto Reveal.js documentation linked above.

## How The Murmuration Works

The background simulation is implemented in `flock.js`.

Conceptually, it works like this:

1. Each bird has a 3D position and velocity (`x`, `y`, `z`)
2. Birds look at a fixed number of nearest neighbors
3. They align, cohere, and separate based on those neighbors
4. Side neighbors influence motion more strongly than rear neighbors
5. Slide changes inject a disturbance wave that propagates through the flock
6. Depth (`z`) affects both flock dynamics and the rendered perspective

This is a lightweight browser-friendly approximation of murmuration behavior, not a scientific simulator.

## How To Tweak The Look

Edit `theme.scss` to change:

- typography
- colors
- slide spacing
- the dawn gradient
- hill appearance
- progress bar and slide number styling

If you want the presentation to feel different visually without changing the flock behavior, start here.

## How To Tweak The Simulation

Edit `flock.js` to change the flock behavior.

The most useful settings are:

- `boidCount`: total number of birds
- `baseSpeed`, `minSpeed`, `maxSpeed`: overall flock speed
- `topologicalNeighbors`: how many nearby birds each bird reacts to
- `separationRadius`: how tightly the flock packs together
- `rightAffinityStrength`, `rightAffinityX`: how strongly the flock prefers the right side
- `waveSpeed`, `waveWidth`, `waveStrength`: the slide-change disturbance
- `minDrawSize`, `maxDrawSize`: depth-based bird size range
- `flockTop*` and `flockBottom*`: the vertical flight envelope

When in doubt:

- change `theme.scss` for appearance
- change `flock.js` for motion
- change `index.qmd` for slide content

## GitHub Pages

This repository is configured so Quarto renders into `docs/`, which GitHub Pages can serve directly from the `main` branch.

Typical Pages setup:

1. Render with `quarto render`
2. Commit the source files and `docs/`
3. In GitHub Pages, publish from the `main` branch and the `/docs` folder

Once enabled, the demo presentation can be hosted at:

`https://michelnivard.github.io/murmurations/`

## Recommended Workflow For Beginners

1. Change slide text in `index.qmd`
2. Run `quarto preview`
3. Tweak colors and typography in `theme.scss`
4. Tweak flock behavior in `flock.js`
5. Run `quarto render`
6. Push the updated `docs/` output to GitHub
