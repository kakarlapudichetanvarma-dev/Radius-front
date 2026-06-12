export default function SearchBar() {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search chats..."
        className="w-full h-9 pl-9 pr-4 rounded-xl bg-gray-100 border border-gray-200
                   text-gray-700 text-sm placeholder:text-gray-400
                   focus:outline-none focus:border-violet-300 focus:bg-white transition-colors"
      />
    </div>
  );
}