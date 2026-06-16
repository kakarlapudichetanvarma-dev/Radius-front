import { useEffect, useState } from 'react';
import { Copy, Link2, Check, X, RefreshCw } from 'lucide-react';
import { useGenerateInvite } from '../../hooks/useCommunity';

interface InviteLinkModalProps {
  communityId: string;
  onClose: () => void;
}

export default function InviteLinkModal({ communityId, onClose }: InviteLinkModalProps) {
  const generateInvite = useGenerateInvite();
  const [copied, setCopied] = useState(false);

  // Auto-generate on open — backend reuses existing active link, so this is safe to call every time
  useEffect(() => {
    generateInvite.mutate(communityId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityId]);

  const inviteLink = generateInvite.data?.inviteLink;

  const copyLink = async () => {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Link2 size={20} className="text-violet-600" />
            <h2 className="text-base font-semibold text-gray-900">Invite via Link</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Loading */}
        {generateInvite.isPending && !inviteLink && (
          <div className="text-sm text-gray-400 text-center py-6">Generating link...</div>
        )}

        {/* Link generated */}
        {inviteLink && (
          <>
            {/* Link box */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3">
              <p className="text-xs text-gray-400 mb-1 font-medium">Invite Link</p>
              <p className="text-sm text-gray-800 break-all leading-relaxed select-all">
                {inviteLink}
              </p>
            </div>

            {/* Never expires badge */}
            <p className="text-xs text-gray-400 mb-4 text-center">
              This link <span className="text-green-600 font-medium">never expires</span> and has unlimited uses.
            </p>

            {/* Copy */}
            <button
              onClick={copyLink}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-medium transition mb-3"
            >
              {copied
                ? <><Check size={16} /> Copied!</>
                : <><Copy size={16} /> Copy Link</>
              }
            </button>

            {/* Regenerate — creates a new token and saves it, old one stays active */}
            <button
              onClick={() => generateInvite.mutate(communityId)}
              disabled={generateInvite.isPending}
              className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:bg-gray-50 text-gray-600 py-2.5 rounded-xl text-sm transition"
            >
              <RefreshCw size={14} />
              {generateInvite.isPending ? 'Generating...' : 'Generate New Link'}
            </button>
          </>
        )}

        {generateInvite.isError && (
          <p className="mt-3 text-red-500 text-xs text-center">
            Failed to generate link. Please try again.
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-3 w-full border border-gray-200 hover:bg-gray-50 text-gray-500 py-2.5 rounded-xl text-sm transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}