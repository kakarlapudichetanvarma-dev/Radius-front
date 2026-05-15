export default function SearchBar() {
  return (
    <div className="p-4 border-b border-zinc-800">
      
      <input
        placeholder="Search chats..."
        className="
          w-full
          p-3
          rounded-xl
          bg-zinc-800
          outline-none
        "
      />

    </div>
  );
}