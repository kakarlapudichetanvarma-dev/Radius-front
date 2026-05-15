import ProfileBar from './ProfileBar';

import SearchBar from './SearchBar';

import AddFriendButton from './AddFriendButton';

import FriendRequests from './FriendRequests';

import FriendList from './FriendList';

import GroupList from './GroupList';

export default function Sidebar() {
  return (
    <div
      className="
        h-full
        bg-zinc-900
        border-r
        border-zinc-800
        flex
        flex-col
      "
    >
      <ProfileBar />

      <SearchBar />

      <AddFriendButton />

      <FriendRequests />

      <FriendList />

      <GroupList />
      
    </div>
  );
}