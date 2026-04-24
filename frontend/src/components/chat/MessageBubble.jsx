import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

export default function MessageBubble({ role, text }) {
  const isUser = role === 'user';
  
  if (text === 'loading_animation') {
    return (
      <div className={`msg-r ${isUser ? 'u' : ''}`}>
        <div className={isUser ? 'av-u' : 'av-ai'}>{isUser ? '' : '✦'}</div>
        <div className="bubble bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '40px', justifyContent: 'center' }}>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
          <div className="typing-dot"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`msg-r ${isUser ? 'u' : ''}`}>
      <div className={isUser ? 'av-u' : 'av-ai'}>{isUser ? '' : '✦'}</div>
      <div className={`bubble ${isUser ? 'bubble-user' : 'bubble-ai'}`}>
        {isUser ? text : (
          <div className="markdown-content">
            <ReactMarkdown
              components={{
                a: ({ node, ...props }) => {
                  const isInternal = props.href?.startsWith('/');
                  if (isInternal) {
                    return <Link to={props.href}>{props.children}</Link>;
                  }
                  return <a target="_blank" rel="noopener noreferrer" {...props}>{props.children}</a>;
                }
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

