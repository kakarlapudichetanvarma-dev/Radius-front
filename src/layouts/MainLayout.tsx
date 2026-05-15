interface Props {
  children: React.ReactNode;
}

export default function MainLayout({
  children
}: Props) {
  return (
    <div className="h-screen bg-zinc-950 text-white">
      {children}
    </div>
  );
}