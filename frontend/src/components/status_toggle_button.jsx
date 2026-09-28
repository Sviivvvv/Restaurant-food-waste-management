import React from "react";
import { CheckCircleIcon, NoSymbolIcon } from "@heroicons/react/20/solid";

// shared activate/deactivate button so every list in the app uses the same look:
// green "Activate" when the record is inactive, red "Deactivate" when it is active
export default function StatusToggleButton({ is_active, onClick }) {
  const Icon = is_active ? NoSymbolIcon : CheckCircleIcon;
  return (
    <button type="button" className={is_active ? "btn-deactivate" : "btn-activate"} onClick={onClick}>
      <Icon className="h-3.5 w-3.5" />
      {is_active ? "Deactivate" : "Activate"}
    </button>
  );
}
