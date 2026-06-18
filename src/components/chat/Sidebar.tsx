import { memo, useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import ProfileBar from './ProfileBar';
import SearchBar from './SearchBar';
import ChatList from './ChatList';
import AddFriendModal from './AddFriendModal';
import CreateGroupModal from './CreateGroupModal';

const Sidebar = memo(function Sidebar() {
  const [activeTab, setActiveTab] = useState<'direct' | 'groups' | 'archived'>('direct');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const chats = useSelector((s: RootState) => s.chat.chats);

  // Compute whether each tab has unread messages
  const hasUnread = {
    direct:   chats.some(c => c.type === 'PRIVATE' && !c.archived && c.unreadCount > 0),
    groups:   chats.some(c => c.type === 'GROUP'   && !c.archived && c.unreadCount > 0),
    archived: chats.some(c => c.archived && c.unreadCount > 0),
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      {showAddFriend   && <AddFriendModal   onClose={() => setShowAddFriend(false)}   />}
      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}

      <div className="h-full bg-white flex flex-col border-r border-gray-200">

        <ProfileBar />

        {/* Chats heading + + button */}
        <div className="px-5 pt-4 pb-1 flex items-center justify-between flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-900">Chats</h1>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(v => !v)}
              className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white
                         flex items-center justify-center transition-colors shadow-sm"
              title="New chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
                   fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>

            {showMenu && (
              <div className="absolute right-0 top-10 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => { setShowMenu(false); setShowAddFriend(true); }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 flex items-center gap-2 transition-colors"
                >
                  <span>👤</span> Add Friend
                </button>
                <div className="h-px bg-gray-100" />
                <button
                  onClick={() => { setShowMenu(false); setShowCreateGroup(true); }}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-violet-50 hover:text-violet-700 flex items-center gap-2 transition-colors"
                >
                  <span>👥</span> Create Group
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pb-3 flex items-center gap-2 flex-shrink-0">
          {(['direct', 'groups', 'archived'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                activeTab === tab
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <span className="ml-1 text-[10px] align-middle opacity-70">•</span>
              )}

              {/* Red dot — only show on inactive tabs with unread */}
              {activeTab !== tab && hasUnread[tab] && (
                <span className="inline-block w-1 h-1 rounded-full bg-red-500 mb-1 ml-0.5" />
              )}
            </button>
          ))}
        </div>

        <SearchBar value={searchTerm} onChange={setSearchTerm} />
        <ChatList activeTab={activeTab} searchTerm={searchTerm} />
      </div>
    </>
  );
});

export default Sidebar;