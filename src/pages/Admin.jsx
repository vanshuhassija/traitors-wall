import { useEffect, useRef, useState } from 'react';
import { loadParticipants, saveParticipants } from '../lib/storage';
import { fileToResizedDataUrl } from '../lib/image';
import './Admin.css';

export default function Admin() {
  const [participants, setParticipants] = useState(() => loadParticipants());
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const result = saveParticipants(participants);
    if (!result.ok) {
      setError('Could not save to localStorage — it may be full. Try smaller/fewer photos.');
    }
  }, [participants]);

  async function handleUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setError('');
    const newOnes = await Promise.all(
      files.map(async (file) => ({
        id: crypto.randomUUID(),
        name: file.name.replace(/\.[^.]+$/, ''),
        image: await fileToResizedDataUrl(file),
        eliminated: false,
        eliminatedAt: null,
      }))
    );
    setParticipants((prev) => [...prev, ...newOnes]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function renameParticipant(id, name) {
    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  }

  function eliminate(id) {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, eliminated: true, eliminatedAt: Date.now() } : p))
    );
  }

  function reinstate(id) {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, eliminated: false, eliminatedAt: null } : p))
    );
  }

  function removeParticipant(id) {
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  }

  function resetGame() {
    if (window.confirm('Remove all participants and reset the game?')) {
      setParticipants([]);
    }
  }

  const remainingCount = participants.filter((p) => !p.eliminated).length;

  return (
    <div className="admin">
      <header className="admin__header">
        <h1>Traitor Elimination — Admin</h1>
        <p>
          {participants.length} traitors uploaded · {remainingCount} still in the game. Open the{' '}
          <a href="/" target="_blank" rel="noreferrer">
            User View
          </a>{' '}
          in another tab to watch eliminations play out live.
        </p>
      </header>

      <div className="admin__upload">
        <label htmlFor="upload">Upload participant photos</label>
        <input
          id="upload"
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
        />
        <button className="admin__danger" onClick={resetGame}>
          Reset game
        </button>
      </div>

      {error && <div className="admin__error">{error}</div>}

      <div className="admin__grid">
        {participants.map((p) => (
          <div key={p.id} className={`admin-row ${p.eliminated ? 'admin-row--eliminated' : ''}`}>
            <img src={p.image} alt={p.name} />
            <input
              type="text"
              value={p.name}
              onChange={(e) => renameParticipant(p.id, e.target.value)}
            />
            {p.eliminated ? (
              <>
                <span className="admin-row__badge">ELIMINATED</span>
                <button onClick={() => reinstate(p.id)}>Undo</button>
              </>
            ) : (
              <button className="admin-row__eliminate" onClick={() => eliminate(p.id)}>
                Eliminate
              </button>
            )}
            <button className="admin-row__remove" onClick={() => removeParticipant(p.id)}>
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
