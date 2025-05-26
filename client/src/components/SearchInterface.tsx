import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface SearchInterfaceProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchInterface({ onSearch, isLoading }: SearchInterfaceProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const quickSearches = [
    "Toyota Camrys with hail damage under $10,000 in Texas",
    "BMW sedans under $15k with clean titles",
    "Trucks with minor damage in California",
    "Honda Civics 2015-2020 nationwide"
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try: 'Show me Toyota Camrys with hail damage under $15,000 in Texas'"
            className="w-full pl-12 pr-4 py-4 text-slate-900 text-lg border-0 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-none"
            rows={3}
            disabled={isLoading}
          />
          <Button 
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-3 bottom-3 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-colors"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Searching...
              </>
            ) : (
              <>
                <i className="fas fa-magic mr-2"></i>
                Search with AI
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Quick Filters */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center">
        <button 
          onClick={() => setQuery("Toyota Camrys with hail damage under $15,000 in Texas")}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          <i className="fas fa-car-crash mr-2"></i>Salvage Vehicles
        </button>
        <button 
          onClick={() => setQuery("vehicles under $10,000")}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          <i className="fas fa-dollar-sign mr-2"></i>Under $10k
        </button>
        <button 
          onClick={() => setQuery("pickup trucks")}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          <i className="fas fa-truck mr-2"></i>Pickup Trucks
        </button>
        <button 
          onClick={() => setQuery("2020 or newer vehicles")}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors"
        >
          <i className="fas fa-calendar mr-2"></i>2020+
        </button>
      </div>

      {/* Search Suggestions */}
      <div className="mt-4 text-center">
        <span className="text-sm text-slate-500 mr-2">Quick searches:</span>
        {quickSearches.slice(0, 2).map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setQuery(suggestion)}
            className="text-sm text-blue-500 hover:text-blue-700 underline mr-4"
          >
            "{suggestion.substring(0, 30)}..."
          </button>
        ))}
      </div>
    </div>
  );
}
