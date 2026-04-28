"use client";

type LoadingAnimationProps = {
  message?: string;
  sizeClassName?: string;
};

export default function LoadingAnimation({
  message = "Loading...",
  sizeClassName = "w-40 h-40 md:w-52 md:h-52",
}: LoadingAnimationProps) {
  return (
    <div className="text-center">
      <img
        src="/images/loading-shelby.gif"
        alt="Loading"
        className={`${sizeClassName} mx-auto object-contain`}
      />
      <p className="text-[#565d6d] mt-4 font-medium">{message}</p>
    </div>
  );
}
