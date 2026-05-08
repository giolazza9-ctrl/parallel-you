const form = document.querySelector("#decisionForm");
const decisionInput = document.querySelector("#decisionInput");
const reels = [...document.querySelectorAll(".reel")];
const slotMachine = document.querySelector(".slot-machine");
const modeButtons = [...document.querySelectorAll("[data-mode]")];
const packButtons = [...document.querySelectorAll("[data-pack]")];
const generateDecisionButton = document.querySelector("#generateDecisionButton");
const generatorStatus = document.querySelector("#generatorStatus");
const toast = document.querySelector("#toast");
const result = {
  title: document.querySelector("#resultTitle"),
  echo: document.querySelector("#decisionEcho"),
  emotion: document.querySelector("#emotionOutput"),
  advice: document.querySelector("#adviceOutput"),
  consequence: document.querySelector("#consequenceOutput"),
  stats: document.querySelector("#statsOutput"),
};

let currentMode = "chaos";
let currentPack = "life";
let latestResult = null;
let aiEnabled = true;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const packs = {
  life: {
    verbs: ["Do it", "Wait 3 days", "Ask a plant", "Flip the table", "Decline politely"],
    emotions: [
      "Immediate relief followed by suspicious confidence.",
      "A tiny panic parade, then heroic calm.",
      "Main-character energy with a trace of tax anxiety.",
      "Peace, but the dramatic kind with thunder nearby.",
    ],
    advice: [
      "Make the choice, then walk like a documentary crew is following you.",
      "Sleep on it, but diagonally, to confuse fate.",
      "Write the pros and cons. Ignore both. Respect the pen.",
      "Tell one trusted friend and one vending machine.",
    ],
    consequences: [
      "You become briefly famous in a group chat you are not in.",
      "Your calendar develops a strong opinion.",
      "A sandwich tastes 18% more meaningful.",
      "Someone says, 'Honestly? iconic,' and refuses to elaborate.",
    ],
  },
  relationships: {
    verbs: ["Text back", "Do not text", "Confess weirdly", "Set boundary", "Leave on read"],
    emotions: [
      "Warm bravery with one dramatic refresh of the inbox.",
      "Romantic confusion wearing formal shoes.",
      "Closure-adjacent serenity.",
      "A noble ache with excellent posture.",
    ],
    advice: [
      "Send the message, then throw your phone onto a soft surface with dignity.",
      "Use punctuation like a person with health insurance.",
      "If they say 'lol' twice, consult the moon and your standards.",
      "Do the honest thing, but moisturize first.",
    ],
    consequences: [
      "Their favorite song becomes mildly suspicious.",
      "You gain 2 charisma and lose 1 ability to act normal.",
      "A mutual friend senses a disturbance in the brunch plans.",
      "Your notes app opens itself out of concern.",
    ],
  },
  money: {
    verbs: ["Buy it", "Budget first", "Invoice fate", "Walk away", "Negotiate loudly"],
    emotions: [
      "Luxury guilt with a coupon aftertaste.",
      "Investor confidence based entirely on vibes.",
      "Spreadsheet calm, but make it delusional.",
      "Financial restraint wearing sunglasses indoors.",
    ],
    advice: [
      "If it costs more than dinner, name it and make it justify itself.",
      "Create a budget category called 'plot development'.",
      "Wait 24 hours unless it is bread, rent, or revenge stationery.",
      "Ask whether future you would applaud or send a stern email.",
    ],
    consequences: [
      "Your bank app sighs in a tasteful serif font.",
      "A receipt becomes a family heirloom.",
      "You unlock premium regret with complimentary tote bag.",
      "Your net worth briefly identifies as interpretive dance.",
    ],
  },
  gym: {
    verbs: ["Go now", "Stretch first", "Skip with flair", "Lift carefully", "Hydrate ominously"],
    emotions: [
      "Heroic sweat with cafeteria-level doubt.",
      "Discipline cosplay that somehow works.",
      "Endorphins arrive late but overdressed.",
      "A hamstring files a polite complaint.",
    ],
    advice: [
      "Do 20 minutes. Leave before your excuses organize.",
      "Wear the shoes. The shoes know things.",
      "If the playlist hits, your body legally has to try.",
      "Start lighter than your ego recommends.",
    ],
    consequences: [
      "A mirror respects your character arc.",
      "Your water bottle becomes your emotional support cylinder.",
      "Stairs become a boss fight tomorrow.",
      "You develop opinions about protein powder packaging.",
    ],
  },
};

const accurateAddons = [
  "Regression-adjacent vibes indicate a favorable nonsense interval.",
  "Our velvet model detects a 12-degree improvement in destiny liquidity.",
  "Premium astrology and fake Bayesian fog agree: proceed with eyebrows raised.",
  "The confidence curve is wearing a tie, so this seems legitimate.",
];

const generatedDecisionPrompts = {
  life: [
    "Should I quit my job?",
    "Should I move to Paris?",
    "Should I start a side project instead of sleeping normally?",
    "Should I say yes to the thing I keep overthinking?",
    "Should I reinvent my entire personality this weekend?",
    "Should I leave town for a fresh start?",
  ],
  relationships: [
    "Should I text my ex?",
    "Should I tell my crush how I feel?",
    "Should I go on a second date?",
    "Should I set a boundary with my partner?",
    "Should I stop replying to mixed signals?",
    "Should I ask them what we are?",
  ],
  money: [
    "Should I buy a new laptop?",
    "Should I upgrade my phone?",
    "Should I book the expensive trip?",
    "Should I ask for a raise?",
    "Should I subscribe to another app I will forget exists?",
    "Should I buy the shoes?",
  ],
  gym: [
    "Should I go to the gym today?",
    "Should I start running in the morning?",
    "Should I lift heavier this week?",
    "Should I skip leg day?",
    "Should I try yoga even though I fear calm people?",
    "Should I meal prep like a person with a spreadsheet soul?",
  ],
};

const intentProfiles = [
  {
    key: "career",
    match: /\b(job|career|boss|work|quit|resign|promotion|salary|company|interview)\b/i,
    verdicts: [
      "Quit job",
      "Do not quit yet",
      "Negotiate first",
      "Apply elsewhere first",
      "Make an exit plan",
    ],
    emotions: [
      "Professional terror with a faint scent of freedom.",
      "LinkedIn courage mixed with Monday-morning dread.",
      "A clean rush of ambition followed by calendar nausea.",
      "Executive calm, except the executive is a scared intern.",
    ],
    advice: [
      "Do not rage-quit until your bank account has stopped whispering.",
      "Update the resume, then let the machine pretend that was destiny.",
      "Ask for the number you actually want and maintain unsettling eye contact.",
      "If the meeting title says 'quick sync,' spiritually prepare a parachute.",
    ],
    consequences: [
      "Your inbox briefly becomes a crime scene.",
      "A recruiter appears with the timing of a haunted elevator.",
      "Your lunch break tastes like liberation and spreadsheet dust.",
      "The office plant will know, but it will not testify.",
    ],
  },
  {
    key: "move",
    match: /\b(move|relocate|city|apartment|house|home|country|paris|london|nyc|new york|berlin|tokyo)\b/i,
    verdicts: ["Move", "Visit first", "Stay put", "Pack slowly", "Run a 90-day trial"],
    emotions: [
      "Romantic relocation fever with a logistics rash.",
      "Fresh-start euphoria interrupted by furniture math.",
      "Passport confidence and mild Wi-Fi anxiety.",
      "A brave little suitcase feeling very important.",
    ],
    advice: [
      "Book a trial trip before your belongings learn a new postal code.",
      "Check rent, weather, and whether your fantasy has laundry access.",
      "Pack one box and see if destiny helps or just watches.",
      "If the city still sounds good while tired, hungry, and lost, proceed.",
    ],
    consequences: [
      "Your favorite mug becomes an international stakeholder.",
      "You develop a powerful opinion about neighborhood bakeries.",
      "A cardboard box gains emotional leverage over you.",
      "Your maps app starts acting like a life coach.",
    ],
  },
  {
    key: "purchase",
    match: /\b(buy|purchase|order|upgrade|subscribe|car|phone|laptop|ticket|shoes|rent)\b/i,
    verdicts: ["Buy it", "Wait 24 hours", "Choose cheaper", "Rent first", "Add to cart only"],
    emotions: packs.money.emotions,
    advice: packs.money.advice,
    consequences: packs.money.consequences,
  },
  {
    key: "relationship",
    match: /\b(text|date|crush|partner|ex|break up|breakup|marry|relationship|message|call|love)\b/i,
    verdicts: ["Text back", "Set boundary", "Do not text", "Ask directly", "Leave gracefully"],
    emotions: packs.relationships.emotions,
    advice: packs.relationships.advice,
    consequences: packs.relationships.consequences,
  },
  {
    key: "fitness",
    match: /\b(gym|workout|run|lift|diet|protein|exercise|train|fitness|yoga)\b/i,
    verdicts: ["Go now", "Do the light version", "Stretch first", "Rest today", "Hydrate ominously"],
    emotions: packs.gym.emotions,
    advice: packs.gym.advice,
    consequences: packs.gym.consequences,
  },
];

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function titleCaseAction(action) {
  return action.toUpperCase().replace(/\s+/g, " ");
}

function inferDecision(decision) {
  const profile = intentProfiles.find((item) => item.match.test(decision)) || {
    key: currentPack,
    ...packs[currentPack],
  };
  const topic = extractDecisionTopic(decision);
  const verdict = personalizeVerdict(pick(profile.verdicts || profile.verbs), topic, profile.key);

  return {
    verdict,
    emotion: pick(profile.emotions),
    advice: personalizeLine(pick(profile.advice), topic),
    consequence: personalizeLine(pick(profile.consequences), topic),
  };
}

function extractDecisionTopic(decision) {
  const cleaned = decision
    .replace(/[?!.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const patterns = [
    /\bshould i\s+(.+)$/i,
    /\bdo i\s+(.+)$/i,
    /\bcan i\s+(.+)$/i,
    /\bis it time to\s+(.+)$/i,
    /\bshould we\s+(.+)$/i,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) return tidyTopic(match[1]);
  }

  return tidyTopic(cleaned);
}

function tidyTopic(topic) {
  return topic
    .replace(/^(to|the|a|an)\s+/i, "")
    .replace(/\bmy\b/gi, "your")
    .replace(/\bi\b/gi, "you")
    .trim();
}

function personalizeVerdict(verdict, topic, profileKey) {
  if (!topic) return verdict;

  const object = actionObject(topic);
  const lowerTopic = object.toLowerCase();
  const lowerVerdict = verdict.toLowerCase();

  if (profileKey === "move" && lowerVerdict === "move") return `Move ${object}`;
  if (profileKey === "move" && lowerVerdict === "stay put") return `Do not move ${object} yet`;
  if (profileKey === "move" && lowerVerdict === "pack slowly") return `Pack for ${object} slowly`;
  if (profileKey === "move" && lowerVerdict === "run a 90-day trial") return `Trial ${object} for 90 days`;
  if (lowerVerdict === "quit job" && /\bjob|career|work\b/.test(lowerTopic)) return "Quit job";
  if (profileKey === "career" && lowerVerdict === "do not quit yet") return "Do not quit job yet";
  if (profileKey === "career" && lowerVerdict === "negotiate first") return "Negotiate before quitting";
  if (lowerVerdict === "buy it" && !/\bit\b/.test(lowerTopic)) return `Buy ${object}`;
  if (profileKey === "purchase" && lowerVerdict === "wait 24 hours") return `Wait 24 hours on ${object}`;
  if (profileKey === "purchase" && lowerVerdict === "choose cheaper") {
    return `Choose a cheaper ${stripArticle(object)}`;
  }
  if (profileKey === "purchase" && lowerVerdict === "rent first") return `Rent ${object} first`;
  if (profileKey === "purchase" && lowerVerdict === "add to cart only") {
    return `Add ${object} to cart only`;
  }
  if (profileKey === "relationship" && lowerVerdict === "text back") return `Text ${object} back`;
  if (profileKey === "relationship" && lowerVerdict === "do not text") return `Do not text ${object}`;
  if (profileKey === "relationship" && lowerVerdict === "ask directly") return `Ask ${object} directly`;
  if (lowerVerdict === "visit first" && /\bto\b/.test(lowerTopic)) {
    return `Visit ${object.replace(/^to\s+/i, "")} first`;
  }

  return verdict;
}

function actionObject(topic) {
  return topic
    .replace(/^(move|relocate|go|buy|purchase|order|get|quit|leave|text|message|call|date)\s+/i, "")
    .trim();
}

function stripArticle(text) {
  return text.replace(/^(a|an|the)\s+/i, "").trim();
}

function personalizeLine(line, topic) {
  if (!topic) return line;
  const hooks = [
    `For "${topic}", the machine is weirdly specific: ${line}`,
    `${line} This is legally about "${topic}" now.`,
    `Regarding "${topic}": ${line}`,
  ];
  return pick(hooks);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function setActive(buttons, activeButton) {
  buttons.forEach((button) => button.classList.toggle("active", button === activeButton));
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentMode = button.dataset.mode;
    setActive(modeButtons, button);
    if (currentMode === "accurate") {
      showToast("Accurate+ unlocked for this demo. The seriousness is fake, the confidence is real.");
    }
  });
});

packButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentPack = button.dataset.pack;
    setActive(packButtons, button);
    showToast(`${button.textContent} pack loaded.`);
  });
});

generateDecisionButton.addEventListener("click", async () => {
  generateDecisionButton.disabled = true;
  generatorStatus.textContent = "Consulting the AI oracle...";

  if (aiEnabled && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ decision: "", mode: currentMode }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.verdict) {
          decisionInput.value = data.verdict;
          decisionInput.focus();
          generatorStatus.textContent = "AI generated a decision. The oracle has spoken.";
          generateDecisionButton.disabled = false;
          showToast("AI conjured a fresh dilemma from the void.");
          return;
        }
      }
    } catch {
      // Fall through to local generation
    }
  }

  window.setTimeout(() => {
    const generated = createGeneratedDecision();
    decisionInput.value = generated;
    decisionInput.focus();
    generatorStatus.textContent = "Decision generated. The machine is pretending this was difficult.";
    generateDecisionButton.disabled = false;
    showToast("AI generated a decision. Accuracy remains theatrically questionable.");
  }, 520);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const decision = decisionInput.value.trim();

  if (!decision) {
    decisionInput.focus();
    return;
  }

  spin(decision);
});

function createGeneratedDecision() {
  const packPrompts = generatedDecisionPrompts[currentPack] || generatedDecisionPrompts.life;
  const allPrompts = Object.values(generatedDecisionPrompts).flat();
  const promptPool = currentMode === "accurate" ? [...packPrompts, ...packPrompts, ...allPrompts] : packPrompts;
  const nextPrompt = pick(promptPool);

  if (nextPrompt === decisionInput.value.trim() && promptPool.length > 1) {
    return pick(promptPool.filter((prompt) => prompt !== nextPrompt));
  }

  return nextPrompt;
}

document.querySelector("#upgradeButton").addEventListener("click", () => {
  const accurateButton = document.querySelector('[data-mode="accurate"]');
  currentMode = "accurate";
  setActive(modeButtons, accurateButton);
  showToast("Accurate+ trial activated. No money moved, only destiny paperwork.");
});

document.querySelector("#shareButton").addEventListener("click", async () => {
  if (!latestResult) {
    showToast("Spin first, then spread the prophecy.");
    return;
  }

  const shareText = formatShareText(latestResult);

  if (navigator.share) {
    try {
      await navigator.share({
        title: "Life Decision Slot Machine",
        text: shareText,
      });
      return;
    } catch {
      showToast("Share cancelled. The prophecy remains local.");
      return;
    }
  }

  try {
    await navigator.clipboard.writeText(shareText);
    showToast("Result copied to clipboard.");
  } catch {
    showToast("Clipboard blocked this prophecy. Download the card instead.");
  }
});

document.querySelector("#downloadButton").addEventListener("click", () => {
  if (!latestResult) {
    showToast("Spin first so the card has something ridiculous to say.");
    return;
  }

  const canvas = drawShareCard(latestResult);
  const link = document.createElement("a");
  link.download = "life-decision-slot-machine-result.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
});

async function fetchAIDecision(decision) {
  if (!aiEnabled || !SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-decision`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        Apikey: SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ decision, mode: currentMode }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.error) return null;

    return {
      verdict: data.verdict,
      emotion: data.emotion,
      advice: data.advice,
      consequence: data.consequence,
      stats: data.stats,
    };
  } catch {
    return null;
  }
}

function spin(decision) {
  slotMachine.classList.remove("pulled");
  void slotMachine.offsetWidth;
  slotMachine.classList.add("pulled");

  reels.forEach((reel, index) => {
    reel.classList.add("spinning");
    reel.querySelector("span").textContent = pickReelFiller(index);
  });

  const submitButton = form.querySelector(".primary-button");
  submitButton.disabled = true;

  fetchAIDecision(decision).then((aiResult) => {
    let generated;

    if (aiResult) {
      generated = {
        decision,
        verdict: aiResult.verdict,
        emotion: aiResult.emotion,
        advice: aiResult.advice,
        consequence: aiResult.consequence,
        stats: aiResult.stats,
        fromAI: true,
      };
    } else {
      const matched = inferDecision(decision);
      generated = {
        decision,
        verdict: matched.verdict,
        emotion: matched.emotion,
        advice: matched.advice,
        consequence: matched.consequence,
        stats: createStats(decision, matched.verdict),
      };
    }

    if (currentMode === "accurate" && !aiResult) {
      generated.stats = `${generated.stats} ${pick(accurateAddons)}`;
    }

    latestResult = generated;

    const values = [
      titleCaseAction(generated.verdict),
      generated.emotion.split(" ").slice(0, 3).join(" "),
      generated.advice.split(" ").slice(0, 3).join(" "),
      `${Math.floor(Math.random() * 89) + 11}%`,
    ];

    reels.forEach((reel, index) => {
      window.setTimeout(() => {
        reel.classList.remove("spinning");
        reel.querySelector("span").textContent = values[index];
      }, 720 + index * 310);
    });

    window.setTimeout(() => {
      renderResult(generated);
      submitButton.disabled = false;
    }, 2050);
  });
}

function pickReelFiller(index) {
  const filler = [
    ["YES", "NO", "MAYBE", "DRAMA"],
    ["CALM", "PANIC", "POWER", "SPICE"],
    ["TEXT", "QUIT", "RUN", "SNACK"],
    ["42%", "7X", "NOISE", "88%"],
  ];
  return pick(filler[index]);
}

function createStats(decision, verdict) {
  const numbers = [7, 13, 22, 41, 69, 88, 404];
  const nouns = ["sandwich happiness", "calendar friction", "vibe liquidity", "regret velocity"];
  const sample = Math.floor(Math.random() * 9000) + 1000;
  return `The universe rolled a ${pick(numbers)}. In a fake sample of ${sample} parallel yous, "${verdict}" improved ${pick(nouns)} by ${Math.floor(Math.random() * 74) + 12}% for decisions resembling "${decision}".`;
}

function renderResult(data) {
  result.title.textContent = `Result: ${titleCaseAction(data.verdict)}`;
  result.echo.textContent = data.decision;
  result.emotion.textContent = data.emotion;
  result.advice.textContent = data.advice;
  result.consequence.textContent = data.consequence;
  result.stats.textContent = data.stats;

  const aiBadge = document.querySelector("#aiBadge");
  if (data.fromAI) {
    aiBadge.style.display = "inline-grid";
  } else {
    aiBadge.style.display = "none";
  }
}

function formatShareText(data) {
  return [
    `Life Decision Slot Machine says: ${titleCaseAction(data.verdict)}`,
    `Decision: ${data.decision}`,
    `Reason: ${data.stats}`,
  ].join("\n");
}

function drawShareCard(data) {
  const canvas = document.querySelector("#shareCanvas");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;

  ctx.fillStyle = "#071d1b";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#b9283b";
  ctx.fillRect(60, 60, width - 120, height - 120);
  ctx.fillStyle = "#f7f1dc";
  ctx.fillRect(96, 96, width - 192, height - 192);
  ctx.fillStyle = "#171412";
  ctx.fillRect(126, 126, width - 252, height - 252);

  ctx.fillStyle = "#f0b94a";
  ctx.font = "bold 42px Arial";
  ctx.fillText("LIFE DECISION SLOT MACHINE", 166, 210);

  ctx.fillStyle = "#f7f1dc";
  ctx.font = "bold 86px Arial";
  wrapText(ctx, `RESULT: ${titleCaseAction(data.verdict)}`, 166, 350, 860, 96);

  ctx.fillStyle = "#bcb39e";
  ctx.font = "34px Arial";
  wrapText(ctx, data.decision, 166, 540, 860, 44);

  ctx.fillStyle = "#f0b94a";
  ctx.font = "bold 34px Arial";
  ctx.fillText("REASON", 166, 680);

  ctx.fillStyle = "#f7f1dc";
  ctx.font = "38px Arial";
  wrapText(ctx, data.stats, 166, 745, 860, 52);

  ctx.fillStyle = "#244b7a";
  ctx.fillRect(166, 1130, 420, 86);
  ctx.fillStyle = "#f7f1dc";
  ctx.font = "bold 34px Arial";
  ctx.fillText("Shareable nonsense", 198, 1184);

  return canvas;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  words.forEach((word, index) => {
    const testLine = `${line}${word} `;
    if (ctx.measureText(testLine).width > maxWidth && index > 0) {
      ctx.fillText(line, x, currentY);
      line = `${word} `;
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  });

  ctx.fillText(line, x, currentY);
}
