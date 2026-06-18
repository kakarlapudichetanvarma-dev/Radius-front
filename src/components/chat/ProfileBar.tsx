import { useState, useMemo, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useNavigate } from 'react-router-dom';

import type { AppDispatch, RootState } from '../../store';
import { openNovaChat } from '../../store/slices/chat.slice';

import ProfileModal from './ProfileModal';

import { Sparkles } from 'lucide-react';

const ProfileBar = memo(function ProfileBar() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector(
    (state: RootState) => state.auth
  );

  const [showProfile, setShowProfile] =
    useState(false);

  // Red dot: any community group chat has unread messages
  const communityGroupUnread = useSelector(
    (state: RootState) => state.community.communityGroupUnread
  );
  const hasCommunityUnread = Object.values(communityGroupUnread).some(count => count > 0);

  const avatarSrc = useMemo(
    () =>
      user?.profilePicture
        ? `http://localhost:8080${user.profilePicture}`
        : null,
    [user?.profilePicture]
  );

  return (
    <>
      {showProfile && (
        <ProfileModal
          onClose={() =>
            setShowProfile(false)
          }
        />
      )}

      <div
        className="
          h-14
          border-b
          border-gray-200
          bg-white
          flex
          items-center
          justify-around
          px-3
          w-full
        "
      >
        {/* Communities — with red dot if unread */}
        <button
          onClick={() => navigate('/communities')}
          className="
            relative
            w-10
            h-10
            rounded-full
            hover:bg-gray-100
            flex
            items-center
            justify-center
            text-gray-500
            hover:text-violet-600
            transition-colors
          "
          title="Communities"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="2.5" />
            <path d="M7.5 21v-1.5a4.5 4.5 0 019 0V21" />
            <circle cx="5" cy="9" r="2" />
            <path d="M1 20v-1a3.5 3.5 0 015.5-2.88" />
            <circle cx="19" cy="9" r="2" />
            <path d="M23 20v-1a3.5 3.5 0 00-5.5-2.88" />
          </svg>

          {/* Red dot — shown when any community group has unread messages */}
          {hasCommunityUnread && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>

        {/* AI */}
        <button
          onClick={() => dispatch(openNovaChat())}
          className="
            w-10
            h-10
            rounded-full
            hover:bg-gray-100
            flex
            items-center
            justify-center
            text-gray-500
            hover:text-violet-600
            transition-colors
          "
          title="Nova AI Assistant"
        >
          <Sparkles size={20} />
        </button>

        {/* Profile */}
        <button
          onClick={() =>
            setShowProfile(true)
          }
          className="
            focus:outline-none
            flex-shrink-0
          "
          title="Profile"
        >
          <div
            className="
              w-10
              h-10
              rounded-full
              overflow-hidden
              bg-violet-600
              flex
              items-center
              justify-center
              text-white
              font-bold
            "
          >
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user?.username}
                className="
                  w-full
                  h-full
                  object-cover
                "
                onError={(e) => {
                  (
                    e.target as HTMLImageElement
                  ).style.display = 'none';
                }}
              />
            ) : (
              user?.username
                ?.charAt(0)
                .toUpperCase() || '?'
            )}
          </div>
        </button>
      </div>
    </>
  );
});

export default ProfileBar;