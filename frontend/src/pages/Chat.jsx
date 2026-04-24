import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/chat/ChatWindow';

export default function ChatPage() {
  return (
    <main className="page-shell">
      <Navbar />
      <div className="layout-with-sidebar">
        <Sidebar />
        <section className="content-fluid" style={{ padding: 0 }}>
          <ChatWindow />
        </section>
      </div>
    </main>
  );
}

