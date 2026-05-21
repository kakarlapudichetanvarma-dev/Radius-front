import ProfileBar from './ProfileBar';
import SearchBar from './SearchBar';
import ChatList from './ChatList';

export default function Sidebar() {
  return (
    <div className="h-full bg-black border-r border-yellow-500/20 flex flex-col relative">
      <ProfileBar />
      <SearchBar />
      <ChatList />
    </div>
  );
}