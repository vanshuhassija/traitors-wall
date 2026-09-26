import { useEffect, useMemo, useRef, useState } from 'react';
import { loadParticipants, subscribeToParticipants } from '../lib/storage';
import { computeGrid, getShuffleKey } from '../lib/layout';
import { playStabSound, primeAudio } from '../lib/sound';
import ParticipantCard from '../components/ParticipantCard';
import SpotlightOverlay from '../components/SpotlightOverlay';
import './UserView.css';

const SPOTLIGHT_DURATION_MS = 3000;
// Must match the cross-mark--draw animation-delay in src/styles/global.css —
// that's the moment the pop-out zoom has settled and the slash starts drawing.
const CROSS_DRAW_START_MS = 850;

export default function UserView() {
  const [participants, setParticipants] = useState(() => loadParticipants());
  const [spotlightId, setSpotlightId] = useState(null);
  const [spotlightRect, setSpotlightRect] = useState(null);
  const [spotlightSize, setSpotlightSize] = useState(0);
  const [audioReady, setAudioReady] = useState(false);
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Photos already eliminated at mount should render crossed-out immediately,
  // with no replay animation — only elimination events that arrive *while this
  // tab is open* should trigger the pop-out/stab/cross sequence.
  const knownEliminatedRef = useRef(new Set(participants.filter((p) => p.eliminated).map((p) => p.id)));
  const queueRef = useRef([]);
  const processingRef = useRef(false);
  const tileRefs = useRef(new Map());

  function setTileRef(id) {
    return (node) => {
      if (node) tileRefs.current.set(id, node);
      else tileRefs.current.delete(id);
    };
  }

  useEffect(() => {
    function onResize() {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToParticipants((updated) => {
      setParticipants(updated);
      const freshlyEliminated = updated.filter((p) => p.eliminated && !knownEliminatedRef.current.has(p.id));
      freshlyEliminated.forEach((p) => {
        knownEliminatedRef.current.add(p.id);
        queueRef.current.push(p.id);
      });
      processQueue();
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function processQueue() {
    if (processingRef.current) return;
    const nextId = queueRef.current.shift();
    if (!nextId) return;
    processingRef.current = true;

    // Capture the tile's own on-screen slot *before* popping it out, so the
    // photo can fly back to that exact position/size instead of just fading
    // to reveal the grid underneath.
    const node = tileRefs.current.get(nextId);
    if (node) {
      const { left, top, width, height } = node.getBoundingClientRect();
      setSpotlightRect({ left, top, width, height });
    } else {
      setSpotlightRect(null);
    }
    setSpotlightSize(Math.min(window.innerWidth * 0.7, window.innerHeight * 0.7, 680));
    setSpotlightId(nextId);

    // Fire the stab sound in sync with the cross starting to draw, once the
    // photo has fully zoomed in and settled — not at the instant it starts popping out.
    setTimeout(playStabSound, CROSS_DRAW_START_MS);

    setTimeout(() => {
      setSpotlightId(null);
      setSpotlightRect(null);
      processingRef.current = false;
      processQueue();
    }, SPOTLIGHT_DURATION_MS);
  }

  const ordered = useMemo(
    () => [...participants].sort((a, b) => getShuffleKey(a.id) - getShuffleKey(b.id)),
    [participants]
  );

  const { cols, rows } = useMemo(
    () => computeGrid(participants.length, viewport.width, viewport.height),
    [participants.length, viewport.width, viewport.height]
  );

  const spotlightParticipant = participants.find((p) => p.id === spotlightId) || null;

  function enableAudio() {
    primeAudio();
    setAudioReady(true);
  }

  return (
    <div className="user-view">
      {!audioReady && (
        <button className="audio-prompt" onClick={enableAudio} aria-label="Enable sound">
          🔊
        </button>
      )}

      {participants.length === 0 ? (
        <div className="empty-state">Waiting for traitors to be uploaded…</div>
      ) : (
        <div
          className={`collage ${spotlightId ? 'is-blurred' : ''}`}
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
        >
          {ordered.map((p) => (
            <ParticipantCard key={p.id} participant={p} innerRef={setTileRef(p.id)} />
          ))}
        </div>
      )}

      <SpotlightOverlay participant={spotlightParticipant} targetRect={spotlightRect} frameSize={spotlightSize} />
    </div>
  );
}
