import { useState, useMemo, memo } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import type { RootState } from '../../store';

import ProfileModal from './ProfileModal';

import { Phone, Sparkles } from 'lucide-react';

const ProfileBar = memo(function ProfileBar() {
  const navigate = useNavigate();

  const { user } = useSelector(
    (state: RootState) => state.auth
  );

  const [showProfile, setShowProfile] =
    useState(false);

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
        {/* Calls */}

        <button
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
          title="Calls"
        >
          <Phone size={20} />
        </button>

        {/* Communities */}

        <button
          onClick={() =>
            navigate('/communities')
          }
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
        </button>

        {/* AI */}

        <button
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
          title="AI Assistant"
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