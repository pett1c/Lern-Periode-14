import Navbar from '../components/Navbar';
import ChatWindow from '../components/chat/ChatWindow';

export default function ChatPage() {
  return (
    <main className="page-shell">
      <Navbar />
      <section className="content">
        <ChatWindow />
      </section>
    </main>
  );
}
