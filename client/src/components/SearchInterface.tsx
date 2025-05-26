import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";

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
    "Honda Civics 2015-2020 nationwide",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 shadow-2xl border border-blue-100"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          className="relative"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.i
            className="fas fa-search absolute left-5 top-6 text-slate-400 text-xl"
            animate={{ rotate: isLoading ? 360 : 0 }}
            transition={{
              duration: 2,
              repeat: isLoading ? Infinity : 0,
              ease: "linear",
            }}
          ></motion.i>
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try: 'Show me Toyota Camrys with hail damage under $15,000 in Texas'"
            className="w-full pl-14 pr-4 py-6 text-slate-900 text-lg border-2 border-slate-200 rounded-2xl bg-white focus:bg-white focus:ring-4 focus:ring-blue-200 focus:border-blue-400 focus:outline-none transition-all resize-none shadow-inner"
            rows={3}
            disabled={isLoading}
          />
        </motion.div>

        {/* Search Button */}
        <motion.div
          className="flex justify-end mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-12 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all shadow-lg text-lg"
            >
              {isLoading ? (
                <>
                  <motion.i
                    className="fas fa-spinner mr-3"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  ></motion.i>
                  Searching...
                </>
              ) : (
                <>
                  <i className="fas fa-magic mr-3"></i>
                  Search with AI
                </>
              )}
            </Button>
          </motion.div>
        </motion.div>
      </form>

      {/* Quick Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex flex-wrap gap-3 justify-center"
      >
        {[
          {
            icon: "fas fa-car-crash",
            text: "Salvage Vehicles",
            query: "Toyota Camrys with hail damage under $15,000 in Texas",
          },
          {
            icon: "fas fa-dollar-sign",
            text: "Under $10k",
            query: "vehicles under $10,000",
          },
          {
            icon: "fas fa-truck",
            text: "Pickup Trucks",
            query: "pickup trucks",
          },
          {
            icon: "fas fa-calendar",
            text: "2020+",
            query: "2020 or newer vehicles",
          },
        ].map((filter, index) => (
          <motion.button
            key={index}
            onClick={() => setQuery(filter.query)}
            className="px-6 py-3 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg border border-slate-200 hover:border-blue-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
          >
            <i className={`${filter.icon} mr-2 text-blue-500`}></i>
            {filter.text}
          </motion.button>
        ))}
      </motion.div>

      {/* Search Suggestions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 text-center"
      >
        <span className="text-sm text-slate-500 mr-3">Popular searches:</span>
        {quickSearches.slice(0, 2).map((suggestion, index) => (
          <motion.button
            key={index}
            onClick={() => setQuery(suggestion)}
            className="text-sm text-blue-500 hover:text-blue-700 underline mr-4 transition-colors"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 + index * 0.2 }}
          >
            "{suggestion.substring(0, 30)}..."
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
