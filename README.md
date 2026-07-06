# Water Drop Game

A browser-based reflex game built for charity: water — players click falling water drops to score points before time runs out, with three difficulty levels and "bad drop" hazards that cost points.

**[Live demo](https://sanaadnan25.github.io/06-CompletedCharityWater/)**

## What it does

- Choose Easy, Normal, or Hard difficulty, each with its own drop speed, spawn rate, and time limit
- Click falling "clean" drops (+1 point) while avoiding "bad" drops (–1 point), visually distinguished from each other
- Live score and countdown timer, with floating +1/–1 feedback on each click
- Win threshold scales with difficulty (10/13/16 points); win triggers a confetti animation and celebratory message, loss shows an encouraging retry message
- Fully replayable — "Play Again" resets state without a page reload
- Responsive layout styled to charity: water's brand guidelines

## How it works

Vanilla JS manages game state across difficulty settings, drop spawning (randomized position/size, weighted clean-vs-bad ratio per difficulty), scoring, and a countdown timer. End-of-game logic determines win/loss against a difficulty-scaled threshold and renders a dynamic overlay with a restart handler.

**Stack:** HTML/CSS/JS

## Notes

Built from a charity: water coding challenge starter template. All core gameplay — difficulty system, timer, scoring, bad-drop mechanic, win/loss logic, confetti, and replay flow — was implemented on top of the provided base files.
