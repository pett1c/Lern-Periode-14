const generateBtn = document.getElementById("generate-btn");
const colorBoxes = document.querySelectorAll(".color-box");

// Generate palette on button click
generateBtn.addEventListener("click", generatePalette);

// Add click listeners to all copy buttons
colorBoxes.forEach((box) => {
  const copyBtn = box.querySelector(".copy-btn");
  copyBtn.addEventListener("click", () => {
    // Use data attribute to always get the real color, even during "Copied!" feedback
    const hexValue = box.dataset.color;
    copyToClipboard(hexValue, box);
  });
});

// Generate random colors and update the display
function generatePalette() {
  colorBoxes.forEach((box) => {
    const color = generateRandomColor();
    const colorDiv = box.querySelector(".color");
    const hexSpan = box.querySelector(".hex-value");

    colorDiv.style.backgroundColor = color;
    hexSpan.textContent = color;
    box.dataset.color = color; // Store the real color in a data attribute
  });
}

// Generate a random hex color (always 6 digits)
function generateRandomColor() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
}

// Copy color to clipboard and show feedback
function copyToClipboard(color, box) {
  navigator.clipboard.writeText(color).then(() => {
    const hexSpan = box.querySelector(".hex-value");
    hexSpan.textContent = "Copied!";
    setTimeout(() => {
      hexSpan.textContent = color;
    }, 1000);
  });
}

// Generate initial palette on page load
generatePalette();
