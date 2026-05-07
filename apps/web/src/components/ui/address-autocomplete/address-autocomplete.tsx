"use client";

import {
  useEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import Input from "@/components/ui/design-system/input/input";
import {
  searchFrenchAddresses,
  type FrenchAddressSuggestion,
} from "@/lib/address-autocomplete";

type AddressAutocompleteProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "value"
> & {
  className?: string;
  containerClassName?: string;
  error?: string;
  helperText?: string;
  inputWrapperClassName?: string;
  label?: string;
  leftIcon?: ReactNode;
  onAddressSelect?: (suggestion: FrenchAddressSuggestion) => void;
  onValueChange: (value: string) => void;
  rightElement?: ReactNode;
  value: string;
};

export default function AddressAutocomplete({
  containerClassName = "",
  onAddressSelect,
  onValueChange,
  rightElement,
  value,
  ...inputProps
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<FrenchAddressSuggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchIdRef = useRef(0);

  useEffect(() => {
    const query = value.trim();
    const searchId = searchIdRef.current + 1;
    searchIdRef.current = searchId;

    if (!isFocused || query.length < 5) {
      return;
    }

    const debounceId = window.setTimeout(() => {
      setIsLoading(true);
      void searchFrenchAddresses(query)
        .then((nextSuggestions) => {
          if (searchIdRef.current === searchId) {
            setSuggestions(nextSuggestions);
          }
        })
        .catch(() => {
          if (searchIdRef.current === searchId) {
            setSuggestions([]);
          }
        })
        .finally(() => {
          if (searchIdRef.current === searchId) {
            setIsLoading(false);
          }
        });
    }, 250);

    return () => {
      window.clearTimeout(debounceId);
    };
  }, [isFocused, value]);

  function handleSelect(suggestion: FrenchAddressSuggestion) {
    const label = suggestion.properties.label ?? "";
    onValueChange(label);
    onAddressSelect?.(suggestion);
    setSuggestions([]);
    setIsFocused(false);
  }

  function handleValueChange(nextValue: string) {
    onValueChange(nextValue);

    if (nextValue.trim().length < 5) {
      setSuggestions([]);
      setIsLoading(false);
    }
  }

  return (
    <div className={`relative ${containerClassName}`.trim()}>
      <Input
        {...inputProps}
        value={value}
        onChange={(event) => handleValueChange(event.target.value)}
        onFocus={(event) => {
          setIsFocused(true);
          inputProps.onFocus?.(event);
        }}
        onBlur={(event) => {
          window.setTimeout(() => {
            setIsFocused(false);
            setSuggestions([]);
            setIsLoading(false);
          }, 120);
          inputProps.onBlur?.(event);
        }}
        containerClassName=""
        rightElement={
          isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[#7ebb2b]" />
          ) : (
            rightElement
          )
        }
      />

      {isFocused && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-[7000] max-h-56 overflow-y-auto rounded-[0.9rem] border border-[#dbe4d2] bg-white p-1 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
          {suggestions.map((suggestion) => {
            const label = suggestion.properties.label ?? "";

            return (
              <button
                key={`${suggestion.properties.postcode}-${label}`}
                type="button"
                className="block w-full rounded-[0.65rem] px-3 py-2.5 text-left text-[0.82rem] leading-snug text-slate-800 transition hover:bg-[#f1f8e8]"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(suggestion)}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
