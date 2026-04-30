export type FrenchAddressSuggestion = {
  properties: {
    city?: string;
    label?: string;
    name?: string;
    postcode?: string;
  };
};

type FrenchAddressApiResponse = {
  features?: FrenchAddressSuggestion[];
};

type AddressAutocompleteOptions = {
  minLength?: number;
  onSelect?: (suggestion: FrenchAddressSuggestion) => void;
};

const ADDRESS_API_ENDPOINT = "https://api-adresse.data.gouv.fr/search/";

export async function searchFrenchAddresses(query: string, signal?: AbortSignal) {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 5) {
    return [];
  }

  const url = new URL(ADDRESS_API_ENDPOINT);
  url.searchParams.set("q", trimmedQuery);
  url.searchParams.set("limit", "5");
  url.searchParams.set("type", "housenumber");

  const response = await fetch(url.toString(), { signal });

  if (!response.ok) {
    throw new Error("Recherche d'adresse indisponible.");
  }

  const data = (await response.json()) as FrenchAddressApiResponse;
  return data.features ?? [];
}

export function attachAddressAutocomplete(
  field: HTMLInputElement | HTMLTextAreaElement | null,
  options: AddressAutocompleteOptions = {},
) {
  if (!field) {
    return () => {};
  }

  const targetField = field;
  const minLength = options.minLength ?? 5;
  const wrapper = targetField.parentElement;
  let abortController: AbortController | null = null;
  let debounceId: number | null = null;

  const dropdown = document.createElement("div");
  dropdown.style.display = "none";
  dropdown.style.position = "absolute";
  dropdown.style.left = "0";
  dropdown.style.right = "0";
  dropdown.style.top = "calc(100% + 6px)";
  dropdown.style.zIndex = "7000";
  dropdown.style.maxHeight = "14rem";
  dropdown.style.overflowY = "auto";
  dropdown.style.border = "1px solid #dbe4d2";
  dropdown.style.borderRadius = "14px";
  dropdown.style.background = "#ffffff";
  dropdown.style.boxShadow = "0 18px 45px rgba(15, 23, 42, 0.16)";
  dropdown.style.padding = "4px";

  if (wrapper) {
    wrapper.style.position = wrapper.style.position || "relative";
    wrapper.appendChild(dropdown);
  }

  function closeDropdown() {
    dropdown.style.display = "none";
    dropdown.replaceChildren();
  }

  function selectSuggestion(suggestion: FrenchAddressSuggestion) {
    const label = suggestion.properties.label ?? "";

    targetField.value = label;
    targetField.dispatchEvent(new Event("input", { bubbles: true }));
    targetField.dispatchEvent(new Event("change", { bubbles: true }));
    options.onSelect?.(suggestion);
    closeDropdown();
  }

  function renderSuggestions(suggestions: FrenchAddressSuggestion[]) {
    dropdown.replaceChildren();

    if (suggestions.length === 0) {
      closeDropdown();
      return;
    }

    suggestions.forEach((suggestion) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = suggestion.properties.label ?? "";
      button.style.display = "block";
      button.style.width = "100%";
      button.style.border = "0";
      button.style.borderRadius = "10px";
      button.style.background = "transparent";
      button.style.padding = "10px 12px";
      button.style.textAlign = "left";
      button.style.color = "#1e293b";
      button.style.fontSize = "13px";
      button.style.lineHeight = "1.35";
      button.style.cursor = "pointer";
      button.addEventListener("mouseenter", () => {
        button.style.background = "#f1f8e8";
      });
      button.addEventListener("mouseleave", () => {
        button.style.background = "transparent";
      });
      button.addEventListener("mousedown", (event) => {
        event.preventDefault();
      });
      button.addEventListener("click", () => selectSuggestion(suggestion));
      dropdown.appendChild(button);
    });

    dropdown.style.display = "block";
  }

  async function fetchSuggestions(query: string) {
    if (query.trim().length < minLength) {
      closeDropdown();
      return;
    }

    abortController?.abort();
    abortController = new AbortController();

    try {
      const suggestions = await searchFrenchAddresses(
        query,
        abortController.signal,
      );
      renderSuggestions(suggestions);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      closeDropdown();
    }
  }

  function handleInput() {
    if (debounceId) {
      window.clearTimeout(debounceId);
    }

    debounceId = window.setTimeout(() => {
      void fetchSuggestions(targetField.value);
    }, 250);
  }

  function handleBlur() {
    window.setTimeout(closeDropdown, 120);
  }

  targetField.addEventListener("input", handleInput);
  targetField.addEventListener("blur", handleBlur);

  return () => {
    if (debounceId) {
      window.clearTimeout(debounceId);
    }

    abortController?.abort();
    targetField.removeEventListener("input", handleInput);
    targetField.removeEventListener("blur", handleBlur);
    dropdown.remove();
  };
}
