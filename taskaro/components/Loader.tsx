import React from "react";

export default function Loader({ className = "" }: { className?: string }) {
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-4 border-(--color-border) border-t-(--color-primary) ${className}`}
    />
  );
}

