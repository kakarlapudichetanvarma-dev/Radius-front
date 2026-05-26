import { memo } from 'react';
import ProfileBar from './ProfileBar';
import SearchBar from './SearchBar';
import ChatList from './ChatList';

// ✅ memo — Sidebar has no props that change during drag, so it never needs to re-render
const Sidebar = memo(function Sidebar() {
  return (
    <div className="h-full bg-black border-r border-yellow-500/20 flex flex-col relative">
      <ProfileBar />
      <SearchBar />
      <ChatList />
    </div>
  );
});

export default Sidebar;