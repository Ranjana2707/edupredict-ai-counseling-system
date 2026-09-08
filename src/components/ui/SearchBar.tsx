import { useState, FormEvent } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from './Button';

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

export function SearchBar({ placeholder = 'Search records...', onSearch, className }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className={`relative flex items-center w-full ${className}`}>
      <div className="absolute left-3.5 flex items-center justify-center text-outline/80">
        <Search className="h-4.5 w-4.5" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-container-lowest border border-outline-variant rounded-default py-2.5 pl-10 pr-12 font-sans text-sm text-on-surface placeholder:text-outline/60 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-12 flex items-center justify-center h-7 w-7 text-outline/80 hover:text-on-surface hover:bg-surface-container-low rounded-full transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <Button
        type="submit"
        variant="ghost"
        className="absolute right-1.5 h-8 w-8 p-0 rounded-full text-outline hover:text-primary hover:bg-primary/5"
      >
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
}
