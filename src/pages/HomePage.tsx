import { useEffect, useState } from 'react';
import { backend, type ScoreRow } from '../backend';
import { QUIZZES, type QuizDef } from '../data/quizzes';
import { durationText, formatNumber, formatTime } from '../lib/format';
import { timeLimitOf, useApp } from '../state';
import { GlyphCapital, GlyphFlag, GlyphGlobe } from '../components/Icons';

function bestText(quiz: QuizDef, best?: ScoreRow) {
  if (!best) return <span className="none">Not played yet</span>;
  if (quiz.kind === 'countries') {
    return (
      <span className="best num">
        Best {best.correct}/{best.total}
        {best.completedAll ? ` in ${formatTime(best.timeMs)}` : ''}
      </span>
    );
  }
  return <span className="best num">Best {formatNumber(best.score)} pts</span>;
}

export function HomePage() {
  const { profile, settings } = useApp();
  const [bests, setBests] = useState<Record<string, ScoreRow>>({});

  useEffect(() => {
    backend.getMyBests().then(setBests).catch(console.error);
  }, [profile]);

  const world = QUIZZES.filter((q) => !q.continent);
  const continents = QUIZZES.filter((q) => q.continent);

  const card = (q: QuizDef, feature = false) => (
    <a key={q.id} href={`#/quiz/${q.id}`} className={`quiz-card ${feature ? 'feature' : ''}`}>
      <div>
        {q.kind === 'countries' ? <GlyphGlobe /> : q.mode === 'flags' ? <GlyphFlag /> : <GlyphCapital />}
        <h2>{q.title}</h2>
      </div>
      <p>{q.blurb}</p>
      <div className="meta">
        {bestText(q, bests[q.id])}
        <span className="num">{durationText(timeLimitOf(settings, q.id))}</span>
      </div>
    </a>
  );

  return (
    <div>
      <div className="home-head">
        <div>
          <h1>Pick a quiz</h1>
          <p>Type answers as fast as you can. Everything is checked as you type, so no need to press Enter.</p>
        </div>
      </div>
      <div className="quiz-grid">{world.map((q, i) => card(q, i === 0))}</div>
      <h2 className="section-title">Capitals by continent</h2>
      <div className="quiz-grid">{continents.map((q) => card(q))}</div>
    </div>
  );
}
