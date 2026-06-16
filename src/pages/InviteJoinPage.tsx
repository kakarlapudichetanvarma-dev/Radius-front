import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { communityService } from '../services/community.service';
import type { InvitePreviewResponse } from '../types/community.types';

export default function InviteJoinPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((s: RootState) => s.auth.isAuthenticated);

  const [status, setStatus] = useState<'loading' | 'preview' | 'joining' | 'error' | 'already'>('loading');
  const [community, setCommunity] = useState<InvitePreviewResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/community/invite/${token}`, { replace: true });
    }
  }, [isAuthenticated, token, navigate]);

  useEffect(() => {
    if (!token || !isAuthenticated) return;
    (async () => {
      try {
        const res = await communityService.previewInvite(token);
        const data: InvitePreviewResponse = res.data;

        if (!data.isValid) {
          setErrorMsg(
            data.invalidReason === 'EXPIRED'
              ? 'This invite link has expired.'
              : data.invalidReason === 'MAX_USES_REACHED'
              ? 'This invite link has reached its maximum uses.'
              : 'This invite link is invalid or has been revoked.'
          );
          setStatus('error');
          return;
        }

        setCommunity(data);
        setStatus('preview');
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'This invite link is invalid or has expired.';
        setErrorMsg(msg);
        setStatus('error');
      }
    })();
  }, [token, isAuthenticated]);

  const handleJoin = async () => {
    if (!token || !community) return;
    setStatus('joining');
    try {
      await communityService.joinViaInvite(token);
      navigate(
        community.communityId ? `/communities/${community.communityId}` : '/communities',
        { replace: true }
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || '';
      if (msg.toLowerCase().includes('already') || err?.response?.status === 409) {
        setStatus('already');
      } else {
        setErrorMsg(msg || 'Failed to join community.');
        setStatus('error');
      }
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">

        {status === 'loading' && (
          <div className="text-gray-400 text-sm py-8">Verifying invite link...</div>
        )}

        {status === 'preview' && community && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-violet-600 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              {community.communityPhotoUrl ? (
                <img
                  src={`http://localhost:8080${community.communityPhotoUrl}`}
                  alt={community.communityName}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                community.communityName.charAt(0).toUpperCase()
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">{community.communityName}</h1>
            {community.communityDescription && (
              <p className="text-sm text-gray-500 mb-2">{community.communityDescription}</p>
            )}
            <p className="text-xs text-gray-400 mb-1">{community.memberCount} members · {community.groupCount} groups</p>
            {community.createdByName && (
              <p className="text-xs text-gray-400 mb-6">Created by {community.createdByName}</p>
            )}
            <button
              onClick={handleJoin}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-medium transition"
            >
              Join Community
            </button>
            <button
              onClick={() => navigate('/chat')}
              className="mt-3 w-full border border-gray-200 hover:bg-gray-50 text-gray-600 py-3 rounded-xl text-sm transition"
            >
              Cancel
            </button>
          </>
        )}

        {status === 'joining' && (
          <div className="text-gray-400 text-sm py-8">Joining community...</div>
        )}

        {status === 'already' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">You're already a member!</h2>
            <p className="text-sm text-gray-500 mb-6">You already belong to this community.</p>
            <button
              onClick={() => {
                if (community?.communityId) {
                  navigate(`/communities/${community.communityId}`);
                } else {
                  navigate('/communities');
                }
              }}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-medium transition"
            >
              Go to Community
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Invalid Invite Link</h2>
            <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
            <button
              onClick={() => navigate('/chat')}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-medium transition"
            >
              Go to Chats
            </button>
          </>
        )}

      </div>
    </div>
  );
}