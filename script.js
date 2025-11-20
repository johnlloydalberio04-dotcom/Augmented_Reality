// === DOM elements ===
const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const currentLabel = document.getElementById("current");
const historyList = document.getElementById("history");
const detailsBox = document.getElementById("details");

const langSelect = document.getElementById("langSelect");
const speakToggle = document.getElementById("speakToggle");
const clearHistoryBtn = document.getElementById("clearHistory");

let model;
let history = [];
let lastSpoken = null;

// ===========================================================================
//  INFO DATABASE (ENGLISH + TAGALOG + LONG DESCRIPTIONS)
// ===========================================================================
const infoDB = {
  person: {
    en: {
      title: "Person",
      description: "A human being with advanced intelligence and the ability to use language, tools, and complex reasoning.",
      history: "Humans evolved around 300,000 years ago in Africa and have developed complex civilizations over millennia."
    },
    tl: {
      title: "Tao",
      description: "Isang nilalang na may mataas na antas ng pag-iisip, wika, at kakayahang lumikha ng mga kagamitan.",
      history: "Nabuo ang mga tao sa Africa mahigit 300,000 taon na ang nakalipas at bumuo ng iba't ibang sibilisasyon."
    }
  },

  cup: {
    en: {
      title: "Cup",
      description: "A container designed for drinking beverages.",
      history: "Cups have existed since ancient civilizations such as Egypt and Mesopotamia."
    },
    tl: {
      title: "Tasa",
      description: "Isang lalagyan para sa pag-inom ng mga inumin.",
      history: "Ginagamit na ang tasa simula pa noong sinaunang panahon sa Mesopotamia at Egypt."
    }
  },

  bottle: {
    en: {
      title: "Bottle",
      description: "A container used to store liquids like water, soda, and oils.",
      history: "The earliest bottles date back to 1500 BC in Ancient Egypt."
    },
    tl: {
      title: "Bote",
      description: "Sisidlan para sa pag-iimbak ng tubig, softdrinks, o langis.",
      history: "Nagsimula ang mga unang bote noon pang 1500 BC sa Sinaunang Egypt."
    }
  },

  cellphone: {
    en: {
      title: "Cellphone",
      description: "A portable communication device used for calling, texting, and internet access.",
      history: "The first mobile phone was invented by Motorola in 1973."
    },
    tl: {
      title: "Cellphone",
      description: "Isang aparatong pangkomunikasyon na ginagamit sa pagtawag, pag-text, at internet.",
      history: "Ang unang mobile phone ay naimbento ng Motorola noong 1973."
    }
  }
};

// ===========================================================================
//  IMAGE GENERATOR (PLACEHOLDER SVG)
// ===========================================================================
function placeholder(name) {
  return `data:image/svg+xml,
  <svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
    <rect width='100%' height='100%' fill='black'/>
    <text x='50%' y='50%' fill='white' font-size='20'
      text-anchor='middle' dominant-baseline='middle'>
      ${name.toUpperCase()}
    </text>
  </svg>`;
}

// ===========================================================================
//  DISPLAY INFO IN PANEL
// ===========================================================================
function showInfo(name) {
  const entry = infoDB[name];

  if (!entry) {
    detailsBox.innerHTML = `<p>No information available.</p>`;
    return;
  }

  const lang = langSelect.value;

  let html = `
    <div class="row">
      <div class="imgBox">
        <img src="${placeholder(name)}" alt="${name}">
      </div>
      <div class="text">
  `;

  if (lang === "en" || lang === "both") {
    html += `
      <h4>${entry.en.title}</h4>
      <p>${entry.en.description}</p>
      <h4>History</h4>
      <p>${entry.en.history}</p><br>
    `;
  }

  if (lang === "tl" || lang === "both") {
    html += `
      <h4>${entry.tl.title}</h4>
      <p>${entry.tl.description}</p>
      <h4>Kasaysayan</h4>
      <p>${entry.tl.history}</p>
    `;
  }

  html += `</div></div>`;
  detailsBox.innerHTML = html;
}

// ===========================================================================
//  VOICE NARRATION
// ===========================================================================
function narrate(name) {
  if (!speakToggle.checked) return;
  if (lastSpoken === name) return;

  const entry = infoDB[name];
  if (!entry) return;

  let text = "";

  if (langSelect.value === "en") {
    text = `${entry.en.title}. ${entry.en.description}. ${entry.en.history}.`;
  } else if (langSelect.value === "tl") {
    text = `${entry.tl.title}. ${entry.tl.description}. ${entry.tl.history}.`;
  } else {
    text = `${entry.en.title}. ${entry.en.description}. ${entry.en.history}. 
            Sa Tagalog: ${entry.tl.title}. ${entry.tl.description}. ${entry.tl.history}.`;
  }

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = langSelect.value === "tl" ? "fil-PH" : "en-US";
  utter.rate = 0.95;

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);

  lastSpoken = name;
}

// ===========================================================================
//  FIXED CAMERA SETUP (WORKS 100%)
// ===========================================================================
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }},
      audio: false
    });

    video.srcObject = stream;

    await new Promise(resolve => {
      video.onloadedmetadata = () => resolve();
    });

    video.play();
  }
  catch (e) {
    alert("Camera access blocked. Please allow camera permissions.");
    console.error(e);
  }
}

// ===========================================================================
//  CANVAS RESIZER (SAFE)
// ===========================================================================
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

// ===========================================================================
//  MAIN
// ===========================================================================
async function main() {
  await startCamera();
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  model = await cocoSsd.load();
  currentLabel.textContent = "Model Loaded. Scan objects...";

  detectLoop();
}

// ===========================================================================
//  DETECTION LOOP
// ===========================================================================
function detectLoop() {
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  model.detect(video).then(predictions => {
    predictions.forEach(pred => {
      const [x, y, w, h] = pred.bbox;

      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = "red";
      ctx.font = "18px Arial";
      ctx.fillText(pred.class, x, y - 5);

      currentLabel.textContent = pred.class.toUpperCase();

      showInfo(pred.class);
      narrate(pred.class);

      if (!history.includes(pred.class)) {
        history.push(pred.class);
        const li = document.createElement("li");
        li.textContent = pred.class.toUpperCase();
        historyList.appendChild(li);
      }
    });

    requestAnimationFrame(detectLoop);
  });
}

// ===========================================================================
// CLEAR HISTORY BUTTON
// ===========================================================================
clearHistoryBtn.onclick = () => {
  history = [];
  historyList.innerHTML = "";
  lastSpoken = null;
};

// START APP
main();
