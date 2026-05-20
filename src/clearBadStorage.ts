export const cleanupBase64FromStorage = () => {
  try {
    const raw = localStorage.getItem('chat_auth');
    if (!raw) return;

    const parsed = JSON.parse(raw);
    if (parsed?.user?.profilePicture?.startsWith('data:')) {
      parsed.user.profilePicture = null;
      localStorage.setItem('chat_auth', JSON.stringify(parsed));
    }
  } catch (e) {
    localStorage.removeItem('chat_auth');
  }
};