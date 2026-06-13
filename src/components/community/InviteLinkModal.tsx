import { useState } from 'react';
import { Copy, Link, Check } from 'lucide-react';
import { useGenerateInvite } from '../../hooks/useCommunity';

interface InviteLinkModalProps {
  communityId: string;
  onClose: () => void;
}

export default function InviteLinkModal({
  communityId,
  onClose
}: InviteLinkModalProps) {
  const generateInvite =
    useGenerateInvite();

  const [copied, setCopied] =
    useState(false);

  const handleGenerate = () => {
    generateInvite.mutate(
      communityId
    );
  };

  const inviteLink =
    generateInvite.data?.inviteLink;

  const copyLink = async () => {
    if (!inviteLink) return;

    await navigator.clipboard.writeText(
      inviteLink
    );

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      className="
        fixed inset-0
        bg-black/40
        flex items-center justify-center
        z-50
      "
    >
      <div
        className="
          bg-white
          rounded-2xl
          w-full
          max-w-md
          p-6
          shadow-xl
        "
      >
        <div className="flex items-center gap-2 mb-4">

          <Link
            size={22}
            className="text-violet-600"
          />

          <h2 className="text-lg font-semibold">
            Community Invite Link
          </h2>

        </div>

        {!inviteLink && (
          <>
            <p className="text-gray-600 text-sm mb-6">
              Generate a shareable invite
              link for this community.
            </p>

            <button
              onClick={handleGenerate}
              disabled={
                generateInvite.isPending
              }
              className="
                w-full
                bg-violet-600
                hover:bg-violet-700
                text-white
                py-3
                rounded-xl
                transition-colors
              "
            >
              {generateInvite.isPending
                ? 'Generating...'
                : 'Generate Link'}
            </button>
          </>
        )}

        {inviteLink && (
          <>
            <div
              className="
                bg-gray-100
                rounded-xl
                p-3
                break-all
                text-sm
                mb-4
              "
            >
              {inviteLink}
            </div>

            <button
              onClick={copyLink}
              className="
                w-full
                flex items-center justify-center gap-2
                bg-violet-600
                hover:bg-violet-700
                text-white
                py-3
                rounded-xl
                transition-colors
              "
            >
              {copied ? (
                <>
                  <Check size={18} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={18} />
                  Copy Link
                </>
              )}
            </button>

            {generateInvite.data?.expiresAt && (
              <p className="mt-3 text-xs text-gray-500 text-center">
                Expires:{' '}
                {new Date(
                  generateInvite.data.expiresAt
                ).toLocaleString()}
              </p>
            )}
          </>
        )}

        <button
          onClick={onClose}
          className="
            mt-4
            w-full
            border
            border-gray-300
            hover:bg-gray-50
            py-3
            rounded-xl
            transition-colors
          "
        >
          Close
        </button>
      </div>
    </div>
  );
}