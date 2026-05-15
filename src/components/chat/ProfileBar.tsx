export default function ProfileBar() {
  return (
    <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-4">
      
      <div className="flex items-center gap-3">
        
        <div className="w-10 h-10 rounded-full bg-green-600" />

        <div>
          <p className="font-semibold">
            Chetan
          </p>

          <p className="text-xs text-zinc-400">
            Online
          </p>
        </div>

      </div>

      <button className="text-zinc-400">
        ⚙️
      </button>

    </div>
  );
}