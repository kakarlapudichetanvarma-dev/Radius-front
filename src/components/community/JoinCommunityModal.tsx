import { useState } from 'react';
import { Link2, X, Users, MessageCircle, Plus } from 'lucide-react';
import { communityService } from '../../services/community.service';
import { useJoinViaInvite } from '../../hooks/useCommunity';
import { extractInviteToken } from '../../utils/invite.utils';
import type { InvitePreviewResponse } from '../../types/community.types';

interface JoinCommunityModalProps {
  onClose: () => void;
  onJoined?: (communityId: string) => void;
}

export default function JoinCommunityModal({ onClose, onJoined }: JoinCommunityModalProps) {
  const [link, setLink] = useState('');
  const [preview, setPreview] = useState<InvitePreviewResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const joinViaInvite = useJoinViaInvite();

  const handleCheck = async () => {
    if (!link.trim()) return;
    setError('');
    setPreview(null);
    setChecking(true);

    // extractInviteToken handles both full URLs and raw tokens
    const extractedToken = extractInviteToken(link.trim());

    try {
      const response = await communityService.previewInvite(extractedToken);
      const data: InvitePreviewResponse = response.data;

      if (!data.isValid) {
        setError(
          data.invalidReason === 'EXPIRED'
            ? 'This invite link has expired.'
            : data.invalidReason === 'MAX_USES_REACHED'
            ? 'This invite link has reached its maximum uses.'
            : 'This invite link is invalid or has been revoked.'
        );
        return;
      }

      setPreview(data);
      setToken(extractedToken);
    } catch {
      setError('Could not find a community with that link. Please check and try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleJoin = async () => {
    if (!token || !preview) return;
    setError('');
    try {
      await joinViaInvite.mutateAsync(token);
      onJoined?.(preview.communityId);
      onClose();
    } catch (e: any) {
      const msg = e?.response?.data?.message || '';
      if (msg.toLowerCase().includes('already') || e?.response?.status === 409) {
        // Already a member — still navigate to community
        onJoined?.(preview.communityId);
        onClose();
      } else {
        setError('Failed to join community. Please try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Link2 size={22} className="text-violet-600" />
            <h2 className="text-lg font-semibold">Join Community</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <label className="text-gray-500 text-xs font-medium mb-1 block">Invite Link</label>
        <input
          value={link}
          onChange={e => {
            setLink(e.target.value);
            setPreview(null);
            setToken(null);
            setError('');
          }}
          onKeyDown={e => e.key === 'Enter' && !preview && handleCheck()}
          placeholder="Paste the community invite link here"
          className="w-full bg-gray-50 border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 rounded-xl px-4 py-2.5 text-sm outline-none transition"
        />

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 border border-red-100 rounded-xl py-2 mt-3">
            {error}
          </p>
        )}

        {!preview && (
          <button
            onClick={handleCheck}
            disabled={!link.trim() || checking}
            className="mt-4 w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium text-sm transition"
          >
            {checking ? 'Checking...' : 'Check Link'}
          </button>
        )}

        {preview && (
          <div className="mt-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-violet-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {preview.communityPhotoUrl ? (
                  <img
                    src={`http://localhost:8080${preview.communityPhotoUrl}`}
                    alt={preview.communityName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  preview.communityName.charAt(0).toUpperCase()
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{preview.communityName}</h3>
                <p className="text-xs text-gray-500 truncate">
                  {preview.communityDescription || 'No description'}
                </p>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users size={12} /> {preview.memberCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} /> {preview.groupCount}
                  </span>
                </div>
              </div>

              <button
                onClick={handleJoin}
                disabled={joinViaInvite.isPending}
                title="Join community"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white transition flex-shrink-0"
              >
                <Plus size={18} />
              </button>
            </div>

            {preview.createdByName && (
              <p className="text-xs text-gray-400 text-center mt-2">
                Created by {preview.createdByName}
              </p>
            )}

            {/* Allow trying a different link */}
            <button
              onClick={() => {
                setPreview(null);
                setToken(null);
                setLink('');
              }}
              className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 transition"
            >
              Try a different link
            </button>
          </div>
        )}
      </div>
    </div>
  );
}