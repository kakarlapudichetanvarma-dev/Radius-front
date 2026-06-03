import { usePresence } from '../hooks/usePresence';

interface Props {
  children: React.ReactNode;
}

export default function MainLayout({ children }: Props) {
  usePresence(); // ✅ starts presence + heartbeat when authenticated

  return (
    <div className="h-screen bg-zinc-950 text-white">
      {children}
    </div>
  );
}