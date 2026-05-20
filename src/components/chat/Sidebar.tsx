import ProfileBar from './ProfileBar';
import SearchBar from './SearchBar';
import ChatList from './ChatList';

export default function Sidebar() {
  return (
    <div className="h-full bg-zinc-900 border-r border-zinc-800 flex flex-col relative">
      <ProfileBar />
      <SearchBar />
      <ChatList />
    </div>
  );
}