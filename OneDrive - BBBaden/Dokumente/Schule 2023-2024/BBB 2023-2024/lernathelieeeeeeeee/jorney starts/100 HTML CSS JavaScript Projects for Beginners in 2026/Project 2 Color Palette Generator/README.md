# Color Palette Generator

A simple and clean color palette generator built with vanilla HTML, CSS, and JavaScript.

## Features

- **Random Palette Generation** — Click the "Generate Palette" button to create 5 random colors
- **Copy to Clipboard** — Click the copy icon on any color to copy the hex value
- **Visual Feedback** — Shows "Copied!" confirmation when a color is copied
- **Responsive Design** — Adapts to different screen sizes
- **Hover Effects** — Smooth animations on buttons and color cards

## Tech Stack

- HTML5
- CSS3 (Flexbox, Grid)
- Vanilla JavaScript
- Font Awesome 7 (icons)

## Project Structure

```
Project 2 Color Palette Generator/
├── index.html    # Page structure with 5 color boxes
├── style.css     # Styling, layout, and responsive design
├── script.js     # Palette generation, copy logic
└── README.md
```

## How It Works

1. On page load, 5 random hex colors are generated
2. Each color is displayed as a card with a color preview and hex code
3. Clicking "Generate Palette" replaces all colors with new random ones
4. Clicking the copy icon copies the hex value (e.g. `#667eea`) to the clipboard

## Getting Started

Just open `index.html` in any browser — no build tools or dependencies needed.

## Future Ideas

- Lock individual colors to keep them while generating new ones
- Toggle between HEX, RGB, and HSL formats
- Save favorite palettes to localStorage
- Generate harmonious palettes (analogous, complementary, triadic)
- Export palette as CSS variables or PNG image
