import { useMemo, useRef, useState } from 'react';
import { CONTINENTS, COUNTRIES, countriesOf, COUNTRY_BY_ID } from '../data/countries';
import { AnswerIndex, EMPTY_TYPING, matchTyping, type TypingState } from '../lib/matcher';
import { MapView, type MapStatus } from '../components/MapView';
import { AnswerInput, Countdown, GameButton, useGameClock, type GameProps } from '../components/gameKit';

const index = new AnswerIndex(COUNTRIES, 'country');
const TOTAL = COUNTRIES.length;
const BY_CONTINENT = CONTINENTS.map((c) => ({ continent: c, countries: countriesOf(c) }));

export function CountriesGame({ quizId, limitSec, finished, onFinish }: GameProps) {
  const [named, setNamed] = useState<string[]>([]);
  const [text, setText] = useState('');
  const [showMap, setShowMap] = useState(false);
  const { start, elapsed } = useGameClock(limitSec);
  const doneRef = useRef(false);
  const typingRef = useRef<TypingState>(EMPTY_TYPING);
  const namedSet = useMemo(() => new Set(named), [named]);
  const last = named[named.length - 1] ?? null;

  const finish = (list: string[]) => {
    if (doneRef.current) return;
    doneRef.current = true;
    const set = new Set(list);
    onFinish({
      score: {
        quizId,
        score: list.length,
        correct: list.length,
        total: TOTAL,
        bestStreak: 0,
        completedAll: list.length === TOTAL,
        timeMs: Math.round(elapsed()),
      },
      missed: COUNTRIES.filter((c) => !set.has(c.id)).map((c) => c.id),
    });
  };

  const onChange = (value: string) => {
    if (finished) return;
    const r = matchTyping(value, typingRef.current, index, namedSet);
    typingRef.current = r;
    setText(r.clear ? '' : value);
    if (!r.id) return;
    const next = [...named, r.id];
    setNamed(next);
    if (next.length === TOTAL) finish(next);
  };

  const mapStatus = useMemo(() => {
    const s: Record<string, MapStatus> = {};
    for (const id of named) s[COUNTRY_BY_ID[id].mapId] = 'found';
    if (finished) for (const c of COUNTRIES) if (!namedSet.has(c.id)) s[c.mapId] = 'missed';
    return s;
  }, [named, namedSet, finished]);

  return (
    <div>
      <div className="gamebar">
        <AnswerInput
          value={finished ? '' : text}
          onChange={onChange}
          disabled={finished}
          placeholder={finished ? 'Game over' : 'Type a country…'}
          label="Country name"
          flash={last ? 'right' : null}
          flashSeq={named.length}
        />
        <div className="counter num" aria-live="polite">
          {named.length}
          <small>/{TOTAL}</small>
        </div>
        <Countdown start={start} limitSec={limitSec} running={!finished} onExpire={() => finish(named)} />
        <GameButton className="map-toggle ghost" onClick={() => setShowMap((v) => !v)}>
          {showMap ? 'Hide map' : 'Show map'}
        </GameButton>
        {!finished && <GameButton onClick={() => finish(named)}>Give up</GameButton>}
      </div>

      <MapView status={mapStatus} flashMapId={last && !finished ? COUNTRY_BY_ID[last].mapId : null} hidden={!showMap} />

      <div className="answer-list">
        {BY_CONTINENT.map(({ continent, countries }) => {
          const got = countries.filter((c) => namedSet.has(c.id)).length;
          return (
            <section className="continent" key={continent}>
              <h3>
                {continent}
                <span className="num">
                  {got}/{countries.length}
                </span>
              </h3>
              <ol>
                {countries.map((c) => {
                  const isFound = namedSet.has(c.id);
                  const cls = isFound ? `found ${c.id === last && !finished ? 'flash' : ''}` : finished ? 'missed' : '';
                  return (
                    <li key={c.id} className={cls}>
                      {isFound || finished ? c.name : ' '}
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
