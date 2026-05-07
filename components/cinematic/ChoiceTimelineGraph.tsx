'use client';

import { motion } from 'framer-motion';

interface TimelineChoice {
  sceneIndex: number;
  choiceText: string;
  age?: number;
}

interface ChoiceTimelineGraphProps {
  choices: TimelineChoice[];
  playerName: string;
  startingAge: number;
  accentClass: string;
}

function trimChoice(choice: string) {
  return choice.length > 54 ? `${choice.slice(0, 51)}...` : choice;
}

function getChoiceAge(choice: TimelineChoice, index: number, startingAge: number) {
  return choice.age ?? startingAge + index * 5;
}

export default function ChoiceTimelineGraph({
  choices,
  playerName,
  startingAge,
  accentClass,
}: ChoiceTimelineGraphProps) {
  if (choices.length === 0) return null;

  const visibleChoices = choices.slice(-12);
  const startAge = getChoiceAge(visibleChoices[0], 0, startingAge);
  const endAge = getChoiceAge(visibleChoices[visibleChoices.length - 1], visibleChoices.length - 1, startingAge);

  const shareTimeline = async () => {
    const text = `${playerName}'s life timeline in Direct Your Life:\n${visibleChoices
      .map((choice, index) => `Age ${getChoiceAge(choice, index, startingAge)}: ${choice.choiceText}`)
      .join('\n')}`;

    if (navigator.share) {
      await navigator.share({ title: `${playerName}'s life timeline`, text }).catch(() => undefined);
      return;
    }

    await navigator.clipboard?.writeText(text).catch(() => undefined);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="share-timeline"
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={`text-xs uppercase tracking-[0.24em] ${accentClass} opacity-60`}>Life graph</p>
          <h3 className="font-display mt-2 text-2xl text-white">{playerName}'s timeline</h3>
        </div>
        <button
          onClick={shareTimeline}
          className={`rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] ${accentClass} transition-colors hover:bg-white/10`}
        >
          Share
        </button>
      </div>

      <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-black/24 p-5">
        <div className="timeline-spine" />
        <div className="mb-5 flex justify-between text-[11px] uppercase tracking-[0.22em] text-slate-500">
          <span>Age {startAge}</span>
          <span>Age {endAge}</span>
        </div>
        <div className="grid gap-4">
          {visibleChoices.map((choice, index) => {
            const age = getChoiceAge(choice, index, startingAge);
            const side = index % 2 === 0 ? 'timeline-left' : 'timeline-right';

            return (
              <motion.div
                key={`${choice.sceneIndex}-${choice.choiceText}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -12 : 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className={`timeline-node ${side}`}
              >
                <div className="timeline-dot" />
                <p className={`text-[11px] uppercase tracking-[0.2em] ${accentClass}`}>Age {age}</p>
                <p className="mt-2 text-sm leading-6 text-slate-100/82">{trimChoice(choice.choiceText)}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
