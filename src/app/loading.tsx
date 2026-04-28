import LoadingAnimation from "@/components/global/LoadingAnimation";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fafafb] flex items-center justify-center">
      <LoadingAnimation />
    </div>
  );
}
