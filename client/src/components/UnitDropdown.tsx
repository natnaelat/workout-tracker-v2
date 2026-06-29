import { useState, useRef, useEffect } from "react";

interface UnitDropdownProps {
  value: "kg" | "lbs";
  onChange: (unit: "kg" | "lbs") => void;
}

const UnitDropdown = ({ value, onChange }: UnitDropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = (unit: "kg" | "lbs") => {
    onChange(unit);
    setOpen(false);
  };

  return (
    <div className="unit-dropdown" ref={ref}>
      <button
        type="button"
        className="unit-dropdown-trigger"
        onClick={() => setOpen((prev) => !prev)}
        >
        <span>{value}</span>
        <span className={`unit-dropdown-arrow ${open ? "open" : ""}`}>▾</span>
      </button>
      {open && (
        <div className="unit-dropdown-menu">
          <button
            type="button"
            className={`unit-dropdown-option ${value === "lbs" ? "selected" : ""}`}
            onClick={() => handleSelect("lbs")}
          >
            lbs
          </button>
          <button
            type="button"
            className={`unit-dropdown-option ${value === "kg" ? "selected" : ""}`}
            onClick={() => handleSelect("kg")}
          >
            kg
          </button>
        </div>
      )}
    </div>
  );
};

export default UnitDropdown;