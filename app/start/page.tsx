'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerProfile, StoryPreferences } from '@/lib/game/types';

type TextStepKey = keyof Omit<PlayerProfile, 'storyPreferences'>;
type SelectStepKey = keyof StoryPreferences;
type StepColor = 'blue' | 'cyan' | 'emerald' | 'amber' | 'orange' | 'rose' | 'red';

type TextStep = {
  key: TextStepKey;
  label: string;
  placeholder: string;
  type: 'text' | 'number' | 'textarea';
  color: StepColor;
  hint: string;
};

type SelectStep = {
  key: SelectStepKey;
  label: string;
  placeholder: string;
  type: 'select';
  color: StepColor;
  hint: string;
  options: string[];
  maxSelections?: number;
};

type Step = TextStep | SelectStep;

const emptyStoryPreferences: StoryPreferences = {
  importantPeople: [],
  behaviorPatterns: [],
  likes: [],
  dislikes: [],
  pressureSources: [],
  supportStyle: [],
  storyVibe: [],
};

const steps: Step[] = [
  { key: 'name', label: 'What should the story call you?', placeholder: 'Your name', type: 'text', color: 'blue', hint: 'This becomes the first spark in the room.' },
  { key: 'age', label: 'How many years have shaped you?', placeholder: 'Your age', type: 'number', color: 'cyan', hint: 'The pace adapts to where you are in life.' },
  { key: 'country', label: 'Where does your weather come from?', placeholder: 'Country', type: 'text', color: 'emerald', hint: 'Location helps the story imagine your horizon.' },
  { key: 'lifeHistory', label: 'What have you already carried through?', placeholder: 'Be honest. What have you built, broken, avoided, or survived?', type: 'textarea', color: 'amber', hint: 'Messy answers make better stories.' },
  { key: 'goals', label: 'What do you want badly enough to admit?', placeholder: 'Not what you should want. What you actually want.', type: 'textarea', color: 'orange', hint: 'Ambition brightens the palette.' },
  { key: 'fears', label: 'Which shadow follows you closest?', placeholder: 'The real fears. Not spiders.', type: 'textarea', color: 'rose', hint: 'Naming fear gives the interface something to push against.' },
  { key: 'emotionalStruggles', label: 'Where do your emotions snag?', placeholder: "What keeps you up. What you don't say out loud.", type: 'textarea', color: 'red', hint: 'The final shape comes from what resists language.' },
  {
    key: 'importantPeople',
    label: 'Who should matter in this version of your life?',
    placeholder: '',
    type: 'select',
    color: 'blue',
    hint: 'Pick the people the story should be allowed to bring into the room.',
    maxSelections: 3,
    options: ['Mother or father', 'Sibling', 'Best friend', 'Old friend', 'Partner', 'Ex', 'Mentor', 'Stranger who helps', 'Someone who doubts you'],
  },
  {
    key: 'behaviorPatterns',
    label: 'What do you usually do when life gets loud?',
    placeholder: '',
    type: 'select',
    color: 'cyan',
    hint: 'These choices become patterns the story can notice and challenge later.',
    maxSelections: 3,
    options: ['Overthink', 'Disappear for a while', 'Start strong then stop', 'Work late', 'Ask for help', 'Pretend I am fine', 'Make jokes', 'Try again quietly', 'Compare myself to others'],
  },
  {
    key: 'likes',
    label: 'What small things make a day feel better?',
    placeholder: '',
    type: 'select',
    color: 'emerald',
    hint: 'Ordinary details make the story feel like it happened somewhere real.',
    maxSelections: 4,
    options: ['Night walks', 'Coffee', 'Music in headphones', 'Clean desk', 'Cooking', 'Gym', 'Rain', 'Quiet mornings', 'Long messages', 'Sunlight through curtains'],
  },
  {
    key: 'dislikes',
    label: 'What instantly drains you?',
    placeholder: '',
    type: 'select',
    color: 'amber',
    hint: 'The story will use this as pressure, not as a label.',
    maxSelections: 4,
    options: ['Being rushed', 'Fake positivity', 'Messy room', 'No replies', 'Family pressure', 'Money stress', 'Being watched', 'Starting over', 'Feeling behind', 'Loud places'],
  },
  {
    key: 'pressureSources',
    label: 'Where does pressure usually come from?',
    placeholder: '',
    type: 'select',
    color: 'orange',
    hint: 'Pick the kind of pressure that actually shows up in your life.',
    maxSelections: 3,
    options: ['Money', 'Family', 'Time passing', 'Social media', 'Friends moving ahead', 'Work deadlines', 'Health', 'Relationship tension', 'My own expectations'],
  },
  {
    key: 'supportStyle',
    label: 'What kind of help do you actually respond to?',
    placeholder: '',
    type: 'select',
    color: 'rose',
    hint: 'Some people need softness. Some need honesty. Most need both at the right time.',
    maxSelections: 2,
    options: ['Gentle encouragement', 'Blunt honesty', 'Someone sitting with me', 'A practical push', 'Space to think', 'Someone checking in later'],
  },
  {
    key: 'storyVibe',
    label: 'How should this story feel?',
    placeholder: '',
    type: 'select',
    color: 'red',
    hint: 'This sets the camera. The choices still decide what happens.',
    maxSelections: 2,
    options: ['Quiet and real', 'Funny but honest', 'Tender', 'Tense', 'Hopeful', 'A little painful', 'Like a late-night film'],
  },
];

const stepColors: Record<string, {
  accent: string;
  accentText: string;
  glow: string;
  border: string;
  borderFocus: string;
  panel: string;
  progress: string;
}> = {
  blue: {
    accent: 'from-sky-400 via-cyan-300 to-blue-500',
    accentText: 'text-sky-200',
    glow: 'bg-sky-500',
    border: 'border-sky-400/20',
    borderFocus: 'focus:border-sky-300/50',
    panel: 'bg-sky-500/10',
    progress: 'bg-sky-400',
  },
  cyan: {
    accent: 'from-cyan-300 via-teal-300 to-blue-400',
    accentText: 'text-cyan-200',
    glow: 'bg-cyan-400',
    border: 'border-cyan-400/20',
    borderFocus: 'focus:border-cyan-300/50',
    panel: 'bg-cyan-500/10',
    progress: 'bg-cyan-400',
  },
  emerald: {
    accent: 'from-emerald-300 via-green-300 to-teal-400',
    accentText: 'text-emerald-200',
    glow: 'bg-emerald-400',
    border: 'border-emerald-400/20',
    borderFocus: 'focus:border-emerald-300/50',
    panel: 'bg-emerald-500/10',
    progress: 'bg-emerald-400',
  },
  amber: {
    accent: 'from-amber-200 via-yellow-300 to-orange-400',
    accentText: 'text-amber-200',
    glow: 'bg-amber-400',
    border: 'border-amber-400/20',
    borderFocus: 'focus:border-amber-300/50',
    panel: 'bg-amber-500/10',
    progress: 'bg-amber-400',
  },
  orange: {
    accent: 'from-orange-200 via-orange-300 to-rose-400',
    accentText: 'text-orange-200',
    glow: 'bg-orange-400',
    border: 'border-orange-400/20',
    borderFocus: 'focus:border-orange-300/50',
    panel: 'bg-orange-500/10',
    progress: 'bg-orange-400',
  },
  rose: {
    accent: 'from-rose-200 via-pink-300 to-red-400',
    accentText: 'text-rose-200',
    glow: 'bg-rose-400',
    border: 'border-rose-400/20',
    borderFocus: 'focus:border-rose-300/50',
    panel: 'bg-rose-500/10',
    progress: 'bg-rose-400',
  },
  red: {
    accent: 'from-red-200 via-rose-300 to-fuchsia-400',
    accentText: 'text-red-200',
    glow: 'bg-red-400',
    border: 'border-red-400/20',
    borderFocus: 'focus:border-red-300/50',
    panel: 'bg-red-500/10',
    progress: 'bg-red-400',
  },
};

export default function StartPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<Partial<PlayerProfile>>({});
  const [storyPreferences, setStoryPreferences] = useState<StoryPreferences>(emptyStoryPreferences);
  const [inputValue, setInputValue] = useState('');
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = steps[currentStep];
  const colors = stepColors[step.color];
  const completion = ((currentStep + 1) / steps.length) * 100;
  const selectedOptions = step.type === 'select' ? storyPreferences[step.key] : [];
  const canContinue = step.type === 'select' ? selectedOptions.length > 0 : Boolean(inputValue.trim());
  const energy = Math.min(100, 26 + (step.type === 'select' ? selectedOptions.length * 18 : inputValue.trim().length * 3) + currentStep * 5);

  const previewProfile = useMemo(
    () => ({
      ...profile,
      ...(step.type === 'select'
        ? { storyPreferences }
        : { [step.key]: step.key === 'age' ? Number(inputValue || 0) || '' : inputValue }),
    }),
    [profile, step, inputValue, storyPreferences]
  );

  const collectedInsights = [
    previewProfile.name ? `Identity: ${previewProfile.name}` : null,
    previewProfile.country ? `Origin: ${previewProfile.country}` : null,
    previewProfile.goals ? `Pull: ${String(previewProfile.goals).slice(0, 28)}${String(previewProfile.goals).length > 28 ? '...' : ''}` : null,
    previewProfile.fears ? `Shadow: ${String(previewProfile.fears).slice(0, 28)}${String(previewProfile.fears).length > 28 ? '...' : ''}` : null,
    storyPreferences.behaviorPatterns.length ? `Pattern: ${storyPreferences.behaviorPatterns[0]}` : null,
    storyPreferences.storyVibe.length ? `Camera: ${storyPreferences.storyVibe.join(', ')}` : null,
  ].filter(Boolean) as string[];

  const togglePreference = (key: SelectStepKey, option: string, maxSelections = 3) => {
    setStoryPreferences((current) => {
      const existing = current[key];
      const next = existing.includes(option)
        ? existing.filter((item) => item !== option)
        : existing.length >= maxSelections
          ? [...existing.slice(1), option]
          : [...existing, option];

      return { ...current, [key]: next };
    });
  };

  const handleNext = () => {
    if (loading) return;
    if (!canContinue) return;

    const newProfile = step.type === 'select'
      ? profile
      : { ...profile, [step.key]: step.key === 'age' ? parseInt(inputValue, 10) || 0 : inputValue };
    setProfile(newProfile);

    if (currentStep < steps.length - 1) {
      setDirection(1);
      setInputValue('');
      setCurrentStep(currentStep + 1);
    } else {
      startGame({ ...(newProfile as PlayerProfile), storyPreferences });
    }
  };

  const startGame = async (finalProfile: PlayerProfile) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/story-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerProfile: finalProfile, gameState: { sceneCount: 0 } }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Failed to start the story');

      localStorage.setItem('dyl_game_state', JSON.stringify(data.gameState));
      router.push('/story');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (loading) return;
    if (currentStep > 0) {
      setDirection(-1);
      const prevStep = steps[currentStep - 1];
      setInputValue(prevStep.type === 'select' ? '' : String(profile[prevStep.key] || ''));
      setCurrentStep(currentStep - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && step.type !== 'textarea' && step.type !== 'select') {
      e.preventDefault();
      handleNext();
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#040814] px-6">
        <div className="ambient-grid absolute inset-0 opacity-20" />
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.14, 0.3, 0.14] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute h-72 w-72 rounded-full bg-sky-500/30 blur-3xl"
        />
        <motion.div
          animate={{ scale: [0.85, 1.1, 0.85], opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, delay: 0.7 }}
          className="absolute h-96 w-96 rounded-full bg-amber-400/20 blur-3xl"
        />
        <div className="glass-panel relative w-full max-w-xl rounded-[32px] p-10 text-center">
          <div className="mb-8 flex justify-center gap-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{ y: [0, -10, 0], scale: [0.9, 1.15, 0.9], opacity: [0.25, 0.8, 0.25] }}
                transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.14 }}
                className="h-3 w-3 rounded-full bg-sky-300"
              />
            ))}
          </div>
          <p className="text-xs uppercase tracking-[0.34em] text-slate-300/75">Generating your opening scene</p>
          <p className="mt-4 text-lg text-white/85">The room is learning your shape.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040814] text-white">
      <div className="ambient-grid absolute inset-0 opacity-20" />
      <motion.div
        key={step.color}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.9, scale: 1 }}
        transition={{ duration: 0.8 }}
        className={`absolute left-[10%] top-[12%] h-80 w-80 rounded-full ${colors.glow} opacity-20 blur-3xl`}
      />
      <motion.div
        animate={{ x: [0, 28, 0], y: [0, -18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[8%] right-[6%] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl"
      />

      {Array.from({ length: 11 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/50"
          style={{
            left: `${8 + i * 8}%`,
            top: `${18 + (i % 4) * 18}%`,
            width: i % 3 === 0 ? 6 : 4,
            height: i % 3 === 0 ? 6 : 4,
          }}
          animate={{
            opacity: [0.12, Math.min(0.85, 0.18 + inputValue.length * 0.03), 0.12],
            y: [0, -18, 0],
            scale: [0.9, 1.15, 0.9],
          }}
          transition={{
            duration: 4.5 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center px-6 py-10 lg:px-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-panel rounded-[34px] p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.34em] text-slate-300/70">Profile composer</p>
                <h1 className="font-display mt-3 text-4xl text-white md:text-5xl">Build the emotional weather.</h1>
              </div>
              <div className={`rounded-full bg-gradient-to-r ${colors.accent} px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-950`}>
                Step {currentStep + 1} of {steps.length}
              </div>
            </div>

            <div className="mt-8 flex gap-2 overflow-hidden rounded-full bg-white/8 p-2">
              {steps.map((s, i) => {
                const active = i === currentStep;
                const complete = i < currentStep;
                return (
                  <motion.div
                    key={s.key}
                    animate={{ flex: active ? 1.7 : 1, opacity: active ? 1 : complete ? 0.8 : 0.35 }}
                    className={`h-2 rounded-full ${complete ? stepColors[s.color].progress : active ? stepColors[s.color].panel : 'bg-white/10'}`}
                  />
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_220px]">
              <div>
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={currentStep}
                    custom={direction}
                    initial={{ opacity: 0, x: direction * 28 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -28 }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                  >
                    <p className={`text-xs uppercase tracking-[0.34em] ${colors.accentText}`}>Prompting the next layer</p>
                    <label className="mt-4 block text-2xl leading-tight text-white md:text-3xl">
                      {step.label}
                    </label>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300/72">{step.hint}</p>

                    <div className={`mt-8 rounded-[28px] border ${colors.border} ${colors.panel} p-4 md:p-5`}>
                      {step.type === 'select' ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {step.options.map((option) => {
                            const active = selectedOptions.includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                onClick={() => togglePreference(step.key, option, step.maxSelections)}
                                className={`rounded-2xl border px-4 py-3 text-left text-sm leading-6 transition-all ${
                                  active
                                    ? 'border-white/35 bg-white/18 text-white shadow-[0_0_24px_rgba(255,255,255,0.08)]'
                                    : 'border-white/10 bg-black/10 text-slate-300/82 hover:border-white/22 hover:bg-white/8 hover:text-white'
                                }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      ) : step.type === 'textarea' ? (
                        <textarea
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={step.placeholder}
                          rows={6}
                          className={`min-h-[180px] w-full resize-none bg-transparent text-base leading-7 text-white outline-none transition-colors placeholder:text-white/25 ${colors.borderFocus}`}
                          autoFocus
                        />
                      ) : (
                        <input
                          type={step.type}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={step.placeholder}
                          min={step.type === 'number' ? 10 : undefined}
                          max={step.type === 'number' ? 120 : undefined}
                          className={`w-full bg-transparent py-5 text-2xl text-white outline-none transition-colors placeholder:text-white/25 ${colors.borderFocus}`}
                          autoFocus
                        />
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-sm text-rose-300/85"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={handleBack}
                    className={`rounded-full border border-white/10 px-5 py-3 text-sm text-slate-300 transition-colors hover:border-white/20 hover:text-white ${currentStep === 0 ? 'invisible' : ''}`}
                  >
                    Back
                  </button>

                  <div className="flex items-center gap-4">
                    <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Energy {energy}%</p>
                    <motion.button
                      onClick={handleNext}
                      disabled={!canContinue || loading}
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className={`rounded-full bg-gradient-to-r ${colors.accent} px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-slate-950 disabled:cursor-not-allowed disabled:opacity-30`}
                    >
                      {currentStep === steps.length - 1 ? 'Enter the story' : 'Shape the next layer'}
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-[28px] p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live reaction</p>
                <div className="story-ring mx-auto mt-5 flex h-36 w-36 items-center justify-center rounded-full border border-white/10">
                  <motion.div
                    animate={{ scale: [1, 1 + energy / 300, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${colors.accent}`}
                  >
                    <span className="text-lg font-semibold text-slate-950">{energy}%</span>
                  </motion.div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-400">
                    <span>Profile clarity</span>
                    <span>{Math.round(completion)}%</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      animate={{ width: `${completion}%` }}
                      transition={{ duration: 0.45 }}
                      className={`h-full rounded-full bg-gradient-to-r ${colors.accent}`}
                    />
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {collectedInsights.length > 0 ? collectedInsights.map((insight) => (
                    <div key={insight} className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 text-sm text-slate-200/80">
                      {insight}
                    </div>
                  )) : (
                    <p className="text-sm leading-6 text-slate-300/60">
                      Start typing and the interface will begin reflecting the person behind the story.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-[34px] p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.34em] text-slate-300/70">Story avatar</p>
            <h2 className="font-display mt-3 text-4xl text-white">Your choices are already designing the stage.</h2>

            <div className="mt-8 rounded-[30px] border border-white/10 bg-black/20 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Current focus</p>
                  <p className={`mt-2 text-lg ${colors.accentText}`}>{step.label}</p>
                </div>
                <div className={`rounded-full bg-white/8 px-3 py-2 text-xs uppercase tracking-[0.24em] ${colors.accentText}`}>
                  {step.type === 'select' ? `${selectedOptions.length} picked` : `${inputValue.trim().length} chars`}
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                {Array.from({ length: 9 }).map((_, i) => {
                  const activeCount = step.type === 'select' ? selectedOptions.length * 2 + 1 : Math.ceil((inputValue.trim().length || currentStep + 1) / 4);
                  const active = i < Math.max(1, Math.min(9, activeCount));
                  return (
                    <motion.div
                      key={i}
                      animate={{ scale: active ? [1, 1.08, 1] : 1, opacity: active ? 1 : 0.28 }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.08 }}
                      className={`aspect-square rounded-2xl border border-white/10 ${active ? colors.panel : 'bg-white/[0.03]'}`}
                    />
                  );
                })}
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {steps.map((s, i) => {
                const storedValue = s.type === 'select' ? storyPreferences[s.key].join(', ') : previewProfile[s.key];
                const active = i === currentStep;
                return (
                  <div
                    key={s.key}
                    className={`rounded-2xl border px-4 py-3 transition-all ${
                      active ? 'border-white/18 bg-white/10' : 'border-white/8 bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{s.key}</p>
                      <span className={`h-2.5 w-2.5 rounded-full ${i <= currentStep ? stepColors[s.color].progress : 'bg-white/15'}`} />
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-200/78">
                      {storedValue ? String(storedValue) : 'Waiting for this layer to be written.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
