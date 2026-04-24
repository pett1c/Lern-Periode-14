export default function AsyncState({ state, message, onRetry }) {
  if (!state) return null;

  return (
    <div className={`async-state async-${state}`}>
      <p>{message}</p>
      {state === 'error' && onRetry ? (
        <button className="btn btn-ghost btn-sm" type="button" onClick={onRetry}>
          Erneut versuchen
        </button>
      ) : null}
    </div>
  );
}
