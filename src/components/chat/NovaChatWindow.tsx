import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store';
import { closeNovaChat } from '../../store/slices/chat.slice';
import { aiService } from '../../services/ai.service';
import type { AiMessageItem } from '../../types/ai.types';
import { Sparkles, X, Send } from 'lucide-react';

interface NovaMessage {
  role: 'USER' | 'MODEL';
  content: string;
  sentAt: string;
}

export default function NovaChatWindow() {
  const dispatch = useDispatch<AppDispatch>();

  const [messages, setMessages] = useState<NovaMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await aiService.getHistory('GENERAL_CHAT');
        const history = res.data.data;
        setConversationId(history.conversationId);
        setMessages(
          (history.messages || []).map((m: AiMessageItem) => ({
            role: m.role === 'MODEL' ? 'MODEL' : 'USER',
            content: m.content,
            sentAt: m.sentAt,
          }))
        );
      } catch {
        // No conversation yet — start fresh
      } finally {
        setLoadingHistory(false);
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setMessages(prev => [...prev, { role: 'USER', content: text, sentAt: new Date().toISOString() }]);
    setInput('');
    setSending(true);
    setError(null);

    try {
      const res = await aiService.sendMessage({ message: text, conversationId });
      const reply = res.data.data;
      setConversationId(reply.conversationId);
      setMessages(prev => [...prev, { role: 'MODEL', content: reply.content, sentAt: reply.sentAt }]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Nova is unavailable right now.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-violet-600 flex items-center justify-center text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Nova</p>
            <p className="text-xs text-gray-400">AI Assistant</p>
          </div>
        </div>
        <button
          onClick={() => dispatch(closeNovaChat())}
          className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors"
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">Loading…</div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center px-8">
            <Sparkles size={28} className="mb-2 text-violet-400" />
            <p className="text-sm font-medium text-gray-600">Ask Nova anything</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'USER' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                m.role === 'USER' ? 'bg-violet-600 text-white' : 'bg-white text-gray-800 border border-gray-100 shadow-sm'
              }`}>
                {m.content}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-2.5 text-sm text-gray-400">
              Nova is typing…
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-red-50 text-red-500 text-xs px-3 py-2 rounded-lg">{error}</div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-4 py-3 flex-shrink-0">
        <div className="flex items-end gap-2">
          <textarea
  value={input}
  onChange={(e) => setInput(e.target.value)}
  onKeyDown={handleKeyDown}
  placeholder="Message Nova…"
  rows={1}
  className="flex-1 resize-none rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:border-violet-300 focus:ring-1 focus:ring-violet-200 max-h-32"
/>
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white flex items-center justify-center flex-shrink-0 transition-colors"
            title="Send"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}