export default function SpotlightOverlay({ participant, targetRect, frameSize }) {
  if (!participant) return null;

  const size = frameSize || Math.min(window.innerWidth * 0.7, window.innerHeight * 0.7, 680);
  const dx = targetRect ? targetRect.left + targetRect.width / 2 - window.innerWidth / 2 : 0;
  const dy = targetRect ? targetRect.top + targetRect.height / 2 - window.innerHeight / 2 : 0;
  const endScaleX = targetRect ? targetRect.width / size : 0.3;
  const endScaleY = targetRect ? targetRect.height / size : 0.3;

  const frameStyle = {
    width: size,
    height: size,
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    '--end-scale-x': endScaleX,
    '--end-scale-y': endScaleY,
  };

  return (
    <div className="spotlight-overlay" key={participant.id}>
      <div className="spotlight-overlay__frame" style={frameStyle}>
        <img src={participant.image} alt={participant.name} draggable={false} />
        <svg className="cross-mark cross-mark--draw" viewBox="0 0 100 100">
          <line x1="8" y1="8" x2="92" y2="92" />
          <line x1="92" y1="8" x2="8" y2="92" />
        </svg>
      </div>
    </div>
  );
}
