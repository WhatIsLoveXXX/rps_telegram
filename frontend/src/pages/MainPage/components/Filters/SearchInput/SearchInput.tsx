import { Input } from "@/components/Input/Input";
import React, { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { SearchIcon } from "@/assets/icons/SearchIcon";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search by username...",
  debounceMs = 500,
}) => {
  const [inputValue, setInputValue] = useState(value);

  const debouncedOnChange = useDebouncedCallback(onChange, debounceMs);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    debouncedOnChange(val);
  };

  return (
    <div className="mt-4 relative">
      <Input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
      />
      <SearchIcon className="absolute top-1/2 right-3 transform -translate-y-1/2 text-blue-500" />
    </div>
  );
};
