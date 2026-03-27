export default function MessageBubble({ role, text }) {
  const isUser = role === 'user';
  return (
    <div className={`msg-r ${isUser ? 'u' : ''}`}>
      <div className={isUser ? 'av-u' : 'av-ai'}>{isUser ? '' : '✦'}</div>
      <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-ai'}`}>{text}</div>
    </div>
  );
}
