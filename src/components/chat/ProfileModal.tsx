import { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store';
import { updateProfile, logout } from '../../store/slices/auth.slice';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchFriends } from '../../store/slices/friend.slice';
import { fetchChats } from '../../store/slices/chat.slice';
import { updateGroupInfo } from '../../store/slices/group.slice';

interface Props {
  onClose: () => void;

  // ✅ Optional group mode
  groupMode?: boolean;

  groupId?: string;

  groupName?: string;

  groupProfilePicture?: string | null;
}

export default function ProfileModal({
  onClose,
  groupMode = false,
  groupId,
  groupName,
  groupProfilePicture,
}: Props) {

  const dispatch = useDispatch<AppDispatch>();

  const { user, updatingProfile, updateError } = useSelector(
    (state: RootState) => state.auth
  );

  const [username, setUsername] = useState(
    groupMode
      ? groupName || ''
      : user?.username || ''
  );

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [previewPic, setPreviewPic] = useState<string | null>(
    groupMode
      ? groupProfilePicture || null
      : user?.profilePicture
        ? `http://localhost:8080${user.profilePicture}?t=${Date.now()}`
        : null
  );

  const [picFile, setPicFile] = useState<File | null>(null);

  const [successMsg, setSuccessMsg] = useState('');

  const [localError, setLocalError] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  const handlePicChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    setPicFile(file);

    setPreviewPic(URL.createObjectURL(file));
  };

  const handleSave = async () => {

    setLocalError('');

    setSuccessMsg('');

    // ✅ GROUP MODE
    if (groupMode && groupId) {

      let profilePictureBase64: string | undefined;

      if (picFile) {

        profilePictureBase64 =
          await new Promise((resolve) => {

            const reader = new FileReader();

            reader.onloadend = () => {
              resolve(reader.result as string);
            };

            reader.readAsDataURL(picFile);
          });
      }

      const result = await dispatch(
        updateGroupInfo({
          groupId,
          data: {
            name: username,
            profilePicture: profilePictureBase64,
          },
        })
      );

      if (updateGroupInfo.fulfilled.match(result)) {

        setSuccessMsg(
          'Group updated successfully!'
        );

        dispatch(fetchChats(user?.username || ''));

      } else {

        setLocalError(
          result.payload as string ||
          'Failed to update group'
        );
      }

      return;
    }

    // ✅ EXISTING USER PROFILE LOGIC

    if (newPassword && newPassword !== confirmPassword) {

      setLocalError('Passwords do not match.');

      return;
    }

    const formData = new FormData();

    formData.append('username', username);

    if (newPassword) {
      formData.append('password', newPassword);
    }

    if (picFile) {
      formData.append('profilePicture', picFile);
    }

    const result = await dispatch(
      updateProfile(formData)
    );

    if (updateProfile.fulfilled.match(result)) {

      setSuccessMsg(
        'Profile updated successfully!'
      );

      dispatch(fetchFriends());

      dispatch(fetchChats(user?.username || ''));

    } else {

      setLocalError(
        result.payload as string ||
        'Failed to update profile'
      );
    }
  };

  const handleLogout = () => {

    dispatch(logout());

    onClose();
  };

  return (
    <AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={(e) =>
          e.target === e.currentTarget &&
          onClose()
        }
      >

        <motion.div
          initial={{
            scale: 0.92,
            opacity: 0,
            y: 20
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0
          }}
          exit={{
            scale: 0.92,
            opacity: 0,
            y: 20
          }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 300
          }}
          className="bg-zinc-900 rounded-2xl w-full max-w-md shadow-2xl border border-zinc-800 overflow-hidden"
        >

          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">

            <h2 className="text-white font-semibold text-lg">
              {groupMode
                ? 'Group Settings'
                : 'Profile'}
            </h2>

            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition text-xl leading-none"
            >
              ✕
            </button>

          </div>

          <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">

            {/* Avatar */}
            <div className="flex flex-col items-center gap-3">

              <div
                className="relative w-24 h-24 rounded-full cursor-pointer group"
                onClick={() =>
                  fileRef.current?.click()
                }
              >

                {previewPic ? (

                  <img
                    key={previewPic}
                    src={previewPic}
                    alt="profile"
                    className="w-24 h-24 rounded-full object-cover border-2 border-zinc-700"
                    onError={() =>
                      setPreviewPic(null)
                    }
                  />

                ) : (

                  <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-zinc-700">

                    {username
                      ?.charAt(0)
                      .toUpperCase() || '?'}

                  </div>
                )}

                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-sm font-medium">
                  Change
                </div>

              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePicChange}
              />

              <p className="text-zinc-500 text-xs">
                Click photo to change
              </p>

            </div>

            {/* Username */}
            <div>

              <label className="text-zinc-400 text-xs mb-1 block">
                {groupMode
                  ? 'Group Name'
                  : 'Username'}
              </label>

              <input
                value={username}
                onChange={e =>
                  setUsername(e.target.value)
                }
                className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                placeholder={
                  groupMode
                    ? 'Enter group name'
                    : 'Enter username'
                }
              />

            </div>

            {/* USER ONLY */}
            {!groupMode && (

              <>

                <div className="space-y-3">

                  <div>

                    <label className="text-zinc-400 text-xs mb-1 block">
                      Email
                    </label>

                    <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-500 text-sm">
                      {user?.email}
                    </div>

                  </div>

                  <div>

                    <label className="text-zinc-400 text-xs mb-1 block">
                      Phone Number
                    </label>

                    <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-2.5 text-zinc-500 text-sm">
                      {user?.phoneNumber}
                    </div>

                  </div>

                </div>

                <div className="space-y-3">

                  <div>

                    <label className="text-zinc-400 text-xs mb-1 block">
                      New Password
                    </label>

                    <input
                      type="password"
                      value={newPassword}
                      onChange={e =>
                        setNewPassword(e.target.value)
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                      placeholder="Leave blank to keep current"
                    />

                  </div>

                  <div>

                    <label className="text-zinc-400 text-xs mb-1 block">
                      Confirm Password
                    </label>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={e =>
                        setConfirmPassword(e.target.value)
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 focus:border-green-500 rounded-xl px-4 py-2.5 text-white text-sm outline-none transition"
                      placeholder="Confirm new password"
                    />

                  </div>

                </div>

              </>

            )}

            {(localError || updateError) && (
              <p className="text-red-400 text-sm text-center">
                {localError || updateError}
              </p>
            )}

            {successMsg && (
              <p className="text-green-400 text-sm text-center">
                {successMsg}
              </p>
            )}

            <div className="space-y-2 pt-1">

              <button
                onClick={handleSave}
                disabled={updatingProfile}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm transition"
              >

                {updatingProfile
                  ? 'Saving...'
                  : groupMode
                  ? 'Save Group'
                  : 'Save Changes'}

              </button>

              {!groupMode && (

                <button
                  onClick={handleLogout}
                  className="w-full bg-zinc-800 hover:bg-red-600/20 border border-zinc-700 hover:border-red-500/50 text-zinc-400 hover:text-red-400 py-2.5 rounded-xl font-medium text-sm transition"
                >
                  Logout
                </button>

              )}

            </div>

          </div>

        </motion.div>

      </motion.div>

    </AnimatePresence>
  );
}