import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface ResponsiveSelectProps {
  id: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  icon?: ReactNode;
  placeholder?: string;
}

export default function ResponsiveSelect({
  id,
  value,
  options,
  onChange,
  ariaLabel,
  icon,
  placeholder = "Select an option",
}: ResponsiveSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listboxId = `${id}-${useId().replace(/:/g, "")}-listbox`;
  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : undefined;

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (isOpen) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, isOpen]);

  const openDropdown = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    setActiveIndex(index);
    setIsOpen(true);
  };

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option) return;

    onChange(option.value);
    setActiveIndex(index);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (isOpen) {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (options.length > 0 && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
        event.preventDefault();
        const direction = event.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((current) =>
          (current + direction + options.length) % options.length
        );
        return;
      }

      if (options.length > 0 && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault();
        selectOption(activeIndex);
        return;
      }

      if (options.length > 0 && (event.key === "Home" || event.key === "End")) {
        event.preventDefault();
        setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const fallback = event.key === "ArrowDown" ? 0 : options.length - 1;
      openDropdown(selectedIndex >= 0 ? selectedIndex : fallback);
    }
  };

  const handleListboxKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      triggerRef.current?.focus();
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((current) =>
        (current + direction + options.length) % options.length
      );
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectOption(activeIndex);
      return;
    }

    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
    }
  };

  return (
    <div className="responsive-select" ref={wrapperRef}>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className="responsive-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-activedescendant={
          isOpen ? `${listboxId}-option-${activeIndex}` : undefined
        }
        onClick={() =>
          isOpen ? setIsOpen(false) : openDropdown()
        }
        onKeyDown={handleTriggerKeyDown}
      >
        {icon && <span className="responsive-select-leading-icon">{icon}</span>}
        <span className="responsive-select-value">
          {selectedOption?.label ?? placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`responsive-select-chevron${isOpen ? " is-open" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id={listboxId}
          className="responsive-select-menu"
          role="listbox"
          aria-label={ariaLabel}
          tabIndex={-1}
          onKeyDown={handleListboxKeyDown}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;

            return (
              <button
                id={`${listboxId}-option-${index}`}
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                className={`responsive-select-option${
                  isSelected ? " is-selected" : ""
                }${isActive ? " is-active" : ""}`}
                role="option"
                aria-selected={isSelected}
                tabIndex={-1}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(index)}
              >
                <span className="responsive-select-check">
                  {isSelected && <Check size={15} aria-hidden="true" />}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
