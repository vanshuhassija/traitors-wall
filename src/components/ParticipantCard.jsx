export default function ParticipantCard({ participant, innerRef }) {
  const { name, image, eliminated } = participant;
  return (
    <div ref={innerRef} className={`participant-card ${eliminated ? 'is-eliminated' : ''}`}>
      <img src={image} alt={name} draggable={false} />
      {eliminated && (
        <svg className="cross-mark cross-mark--static" viewBox="0 0 100 100">
          <line x1="8" y1="8" x2="92" y2="92" />
          <line x1="92" y1="8" x2="8" y2="92" />
        </svg>
      )}
    </div>
  );
}
