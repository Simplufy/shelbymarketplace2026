export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fafafb] flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-[#002D72]/20 border-t-[#002D72] rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-white rounded-full"></div>
          </div>
        </div>
        <p className="text-[#565d6d] mt-6 font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
