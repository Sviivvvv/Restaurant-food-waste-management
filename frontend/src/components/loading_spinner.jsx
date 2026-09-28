import React from "react";

// small spinner shown while data is being fetched
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="h-8 w-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );
}
