import { GameState } from './types';
import { getChoiceBudgetForAge, getYearJumpForAge, HARD_CHOICE_CAP, MAX_ENDING_AGE, MIN_ENDING_AGE, SOFT_CHOICE_CAP } from './state';

export function buildSystemPrompt(): string {
  return `You write DIRECT YOUR LIFE, a first-person life story game.

The writing should feel like a real person telling you what just happened.
Plain. Specific. A little messy when life is messy.

Use this kind of voice:
"You almost send it. Then don't."
"The room gets quieter after that."
"You rename the file again. It still says final."
"She doesn't text back. You check anyway."
"The coffee's cold. You drink it."
"You leave it on read. Again."
"Four years pass. You get better at sounding fine."
"By thirty-six, the job pays more. So does the silence."

Never write like this:
"You face a difficult choice about your future."
"You feel a wave of emotion wash over you."
"The weight of your decision hangs heavy."
"You find yourself at a crossroads."
"Deep down, you know what you must do."
"This moment will define who you become."
"A new chapter of your life begins."

Rules:
- 2-4 narration lines per scene.
- Short lines. Usually 6-18 words.
- Use contractions: don't, can't, it's, you're.
- Let people sound casual. "Yeah. I know." is better than "I understand your concern."
- No therapy language. Avoid "process", "heal", "trauma response", "emotional journey", "inner child".
- No motivational poster language. Avoid "destiny", "purpose", "become your best self".
- No explaining the player's feelings. Show what they do with their hands, phone, face, money, room, work, family.
- Be concrete. Not "a message" - "Dani's Slack". Not "your work" - "the deck due Friday".
- If something sounds polished, make it more normal.

CHOICE RULES:
Choices should be major life decisions, not errands, tactics, or small social moves.
The player chooses turning points. The AI autofills normal weeks, months, work tasks, awkward follow-ups, small conversations, and gradual consequences in narration.
BAD: "Work harder" / "Rest" / "Take a risk"
BAD: "Ask the manager for help" / "Rewrite the pitch" / "Go home early" / "Send a follow-up text"
GOOD: "Quit before you have a backup plan" / "Move cities for the music" / "Tell her you can't be the safe choice anymore" / "Sign the deal and let it change your name"
- Do not repeat the same choice wording, structure, or decision pattern too often.
- Avoid recycling generic binaries like send/avoid, stay/go, hide/reveal in nearly the same phrasing.
- Every new choice set should feel fresh, specific to the current life moment, and different from recent options.
- Keep choices human and direct. No labels like "embrace vulnerability" or "choose growth".
- Each choice in a scene must be a different kind of action. If one choice is asking for help, the others cannot also be asking, convincing, explaining, or requesting.
- Vary the target of the action: self, another person, work, family, body, money, place, habit, or reputation.
- Vary the stakes: one option should change a relationship, one should change practical life, one should reveal or hide something.
- Do not make the user choose small implementation details. Autofill those.
- If the decision would not still matter 3-5 years later, it is too small.

LIFE PROGRESSION RULES:
- This story covers a lifetime, not one long week.
- Move time forward aggressively between scenes when useful.
- Never stay trapped in the same age for too long.
- After each meaningful choice, jump ahead roughly 4-6 years.
- During those skipped years, autofill the ordinary life: jobs, routines, relationships, money, health, reputation, habits, and missed chances.
- By 30-40 total choices, the life story should be approaching its ending.
- The story should continue into older age and only truly end once the player is around 80-100 years old, unless the choice cap forces an ending.

STORY PACING:
- Move the story forward. Every scene should advance something.
- Don't linger. Don't repeat the same emotional beat.
- Introduce new situations, people, conflicts, moments.
- Quiet scenes are fine but they must still advance something.
- Give 3-4 choices. Use 3 when the moment is intimate, 4 when there are genuinely different life paths. Never more than 4.
- When a scene happens after a time jump, include a small recap inside the narration.
- That recap must explain cause and effect: because the player chose X, Y changed in the timeline.
- Show what altered: work, love, habits, money, health, family, location, reputation, confidence, or self-image.
- Mention one concrete ripple effect and one new normal created by the choice.
- Use the recap to autofill everything the player did not directly choose.
- Keep the recap short and human. It should feel like part of the scene, not a summary paragraph.

RESPONSE FORMAT:
Return ONLY valid JSON. No markdown. No explanation.

{
  "scene": {
    "title": "short title",
    "narrationLines": ["line1", "line2", "line3"],
    "environment": "physical space",
    "mood": "melancholic|tense|quiet|warm|cold|eerie|hopeful|dark|nostalgic|anxious",
    "cinematicMoment": "visual detail",
    "relationshipMoment": "interpersonal detail or empty string",
    "memoryObject": "meaningful object or empty string"
  },
  "choices": [
    {"id": "c1", "text": "choice", "emotionalTag": "honesty|avoidance|fear|connection|perfectionism|isolation|risk|sabotage", "isQuiet": false}
  ],
  "butterflyEffects": [
    {"id": "bf-xxx", "description": "what this sets up", "currentIntensity": 0.6, "hasReturned": false, "emotionalTag": "fear"}
  ],
  "callbacks": [
    {"id": "cb-xxx", "description": "thread to resolve later", "emotionalWeight": 0.5, "hasResolved": false}
  ],
  "emotionalShift": {
    "honesty": 0.05, "avoidance": -0.02, "fear": 0.1, "perfectionism": 0, "isolation": 0.03,
    "connection": -0.05, "selfSabotage": 0, "riskTaking": 0, "emotionalSuppression": 0.02, "consistency": 0
  },
  "endingSignals": [
    {"type": "pattern_name", "intensity": 0.3, "description": "what ending this pushes toward"}
  ]
}

Shifts: -0.3 to +0.3. Butterfly: 0-2 per turn. Callbacks: 0-1. Ending signals: 0-1.
Return ONLY the JSON.`;
}

export function buildFirstTurnPrompt(profile: GameState['playerProfile']): string {
  return `Start the story. Scene 1.

PLAYER: ${profile.name}, age ${profile.age}, ${profile.country}
LIFE: ${profile.lifeHistory}
WANTS: ${profile.goals}
AFRAID OF: ${profile.fears}
STRUGGLES WITH: ${profile.emotionalStruggles}

Open with a specific moment in this person's life. Not a summary. Something happening right now.
Make it sound normal, like a person telling the truth without trying to sound profound.
Give 3-4 choices that feel specific to who they are and big enough to alter the next several years.
Remember: this story spans decades, so start concrete but leave room for time to move fast later.`;
}

export function buildTurnPrompt(state: GameState, choiceId?: string, choiceText?: string, isForcedContinue?: boolean): string {
  const phase = state.storyPhase;
  const sceneNum = state.sceneCount;
  const currentAge = state.currentAge;
  const choiceBudget = getChoiceBudgetForAge(currentAge);
  const yearJump = getYearJumpForAge(currentAge);
  const totalChoices = state.madeChoices.length;
  const projectedChoicesThisYear = choiceId ? state.choicesThisYear + 1 : state.choicesThisYear;
  const closesOutYear = Boolean(choiceId) && projectedChoicesThisYear >= choiceBudget;

  let prompt = `Scene #${sceneNum + 1}. Phase: ${phase}. Player: ${state.playerProfile.name}, age ${currentAge}, ${state.playerProfile.country}.\n`;
  prompt += `LIFETIME PACING: ${totalChoices}/${HARD_CHOICE_CAP} choices used. This current year has ${state.choicesThisYear}/${choiceBudget} choices used.\n`;
  prompt += `TIME JUMP RULE: after this major decision, jump ahead about ${yearJump} years and autofill the ordinary life between.\n`;
  prompt += `ENDING WINDOW: do not fully end this life before age ${MIN_ENDING_AGE} unless the hard cap is reached. The story must be heading toward age ${MIN_ENDING_AGE}-${MAX_ENDING_AGE}.\n\n`;

  if (choiceId && choiceText) {
    prompt += `THEY CHOSE: "${choiceText}"\n\n`;
  } else if (isForcedContinue) {
    prompt += `They experienced without choosing. Move forward in life.\n\n`;
  }

  if (closesOutYear && choiceText) {
    prompt += `THIS CHOICE CLOSES OUT THE CURRENT AGE-WINDOW. The next scene should happen about ${yearJump} years later.\n`;
    prompt += `Open that later scene with a very short, human recap of how "${choiceText}" altered the timeline.\n`;
    prompt += `Use clear cause and effect: because of that choice, what changed, what closed, what opened, and what became normal by age ${currentAge + yearJump}.\n`;
    prompt += `Autofill the in-between years. Do not ask the player about routine steps, follow-up tasks, or small conversations.\n`;
    prompt += `Make the recap 1-2 narration lines, then land in a new present-moment scene.\n\n`;
  }

  const ep = state.emotionalProfile;
  const notable = Object.entries(ep).filter(([, v]) => Math.abs(v - 0.5) > 0.1);
  if (notable.length > 0) {
    prompt += `EMOTIONAL STATE: ${notable.map(([k, v]) => `${k}=${v.toFixed(2)}`).join(', ')}\n`;
  }

  const patterns = state.detectedPatterns.filter(p => p.confidence > 0.4);
  if (patterns.length > 0) {
    prompt += `PATTERNS: ${patterns.map(p => `${p.type}(${(p.confidence * 100).toFixed(0)}%)`).join(', ')}\n`;
  }

  const activeBF = state.butterflyEffects.filter(b => b.currentIntensity > 0.3);
  if (activeBF.length > 0) {
    prompt += `BUTTERFLIES: ${activeBF.map(b => `${b.hasReturned ? '[returned]' : '[active]'} ${b.description}`).join('; ')}\n`;
  }

  const activeCB = state.callbacks.filter(c => c.emotionalWeight > 0.3);
  if (activeCB.length > 0) {
    prompt += `CALLBACKS: ${activeCB.map(c => `${c.hasResolved ? '[resolved]' : '[open]'} ${c.description}`).join('; ')}\n`;
  }

  const recent = state.scenes.slice(-3);
  if (recent.length > 0) {
    prompt += `\nRECENT: ${recent.map((s, i) => `#${state.sceneCount - recent.length + i + 1} ${s.title}: ${s.narrationLines[0] || ''}`).join(' | ')}\n`;
  }

  const recentChoices = state.madeChoices.slice(-6);
  if (recentChoices.length > 0) {
    prompt += `RECENT CHOICES ALREADY USED: ${recentChoices.map(c => `"${c.choiceText}"`).join(' | ')}\n`;
    prompt += `RECENT TIMELINE CAUSES: ${recentChoices.map(c => {
      const scene = state.scenes[c.sceneIndex - 1];
      const sceneTitle = scene?.title ? `scene ${c.sceneIndex}, ${scene.title}` : `scene ${c.sceneIndex}`;
      return `${sceneTitle}: "${c.choiceText}"`;
    }).join(' | ')}\n`;
    prompt += `Do not repeat those choices or lightly rephrase them. Make the next options sound like new thoughts, not template variants.\n`;
  }

  if (state.relationships.length > 0) {
    prompt += `PEOPLE: ${state.relationships.map(r => `${r.name}(${r.type}, warmth=${r.warmth.toFixed(1)})`).join(', ')}\n`;
  }

  const highSignals = state.endingSignals.filter(s => s.intensity > 0.5);
  if (highSignals.length > 0) {
    prompt += `ENDING SIGNALS: ${highSignals.map(s => `${s.type}(${s.intensity.toFixed(2)})`).join(', ')}\n`;
  }

  prompt += '\n';

  if (phase === 'ending' || currentAge >= MIN_ENDING_AGE || totalChoices >= SOFT_CHOICE_CAP) {
    prompt += `LATE LIFE. Move decisively toward an ending. Weave threads together. Reference past choices and consequences. Let time feel accumulated.`;
  } else if (phase === 'climax') {
    prompt += `CLIMAX. Peak tension. Bring back a butterfly effect or callback. Choices must be life-altering. Also allow time to jump if the next important moment is later.`;
  } else if (phase === 'complexity') {
    prompt += `Deepen. Introduce a major fork, a new person, or an unresolved moment. Autofill routine fallout and keep moving forward.`;
  } else if (phase === 'rising') {
    prompt += `Build. Introduce a meaningful turning point. Advance years through recap and do not waste time on small choices.`;
  } else {
    prompt += `Establish. Ground the player in a specific moment, but make the choices big enough to steer the next few years.`;
  }

  prompt += `\n\nIMPORTANT TIME RULES:
- Every choice is a major life decision. After it, set the next scene later in life.
- After 1 major choice in the same age-window, jump ahead about 4-6 years.
- Use age naturally in the writing context even if you do not state the number directly in narration.
- Prefer a few sharp moments per year over many tiny beats.
- If you jump forward in time, the first 1-2 narration lines must recap how the player's last choice altered the timeline before the new present moment begins.
- The recap must say what their choice caused, what changed because of it, and what their life looks like now.
- Avoid vague recap lines like "years passed and things changed." Name the actual change.
- The player should not choose routine next steps. Invent those yourself in the recap.
- Keep the new choices materially different from the last several choices in wording and emotional shape.
- Before returning JSON, read the narration out loud in your head. If it sounds like AI, rewrite it like a normal person talking.

Return ONLY valid JSON.`;

  return prompt;
}
