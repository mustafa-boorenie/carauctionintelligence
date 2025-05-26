import { Header } from "@/components/Header";
import { SearchInterface } from "@/components/SearchInterface";
import { VehicleCard } from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface SearchResult {
  query: string;
  parsedFilters: Record<string, any>;
  results: any[];
  count: number;
}

export default function Home() {
  const { user } = useAuth();
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchHistory } = useQuery({
    queryKey: ['/api/search/history'],
    enabled: !!user,
  });

  const { data: savedSearches } = useQuery({
    queryKey: ['/api/saved-searches'],
    enabled: !!user,
  });

  const handleSearch = async (query: string) => {
    if (!user || !query.trim()) {
      if (!user) {
        // Redirect to auth if not logged in
        window.location.href = '/auth';
        return;
      }
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-uid': user.uid,
        },
        body: JSON.stringify({ query }),
      });
      
      if (response.ok) {
        const results = await response.json();
        console.log('Search API Response:', results);
        setSearchResults(results);
      } else {
        const error = await response.json();
        console.error('Search API Error:', error);
        throw new Error(error.error || 'Search failed');
      }
    } catch (error: any) {
      console.error('Search failed:', error);
      // You could add a toast notification here for better UX
      alert(`Search failed: ${error.message || 'Please try again'}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find Your Perfect Deal with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 ml-2">
              AI Search
            </span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Search across Copart, IAAI, Manheim, ADESA, and eBay Motors using and
            let AI find the best deals for you.
          </p>

          <SearchInterface onSearch={handleSearch} isLoading={isSearching} />

          {/* Auction Sources */}
          <div className="mt-12">
            <p className="text-slate-400 text-sm mb-4">Searching across all major auction platforms</p>
            <div className="flex justify-center items-center space-x-8 opacity-60">
              {['Copart', 'IAAI', 'Manheim', 'ADESA', 'eBay Motors'].map((source) => (
                <div key={source} className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-2">
                    <i className="fas fa-car text-white"></i>
                  </div>
                  <span className="text-xs">{source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Search Results */}
      {searchResults && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Search Results</h2>
                <p className="text-slate-600">
                  Found <span className="font-semibold text-blue-500">{searchResults.count}</span> vehicles matching your criteria
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>Sort by: Best Match</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Auction Date</option>
                  <option>Mileage</option>
                </select>
              </div>
            </div>

            {/* Active Filters */}
            {searchResults.parsedFilters && Object.keys(searchResults.parsedFilters).length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.entries(searchResults.parsedFilters).map(([key, value]) => (
                  <Badge key={key} variant="secondary" className="bg-blue-100 text-blue-700">
                    {key}: {String(value)}
                  </Badge>
                ))}
              </div>
            )}

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.results.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>

            {searchResults.results.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <i className="fas fa-search text-4xl text-slate-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No results found</h3>
                  <p className="text-slate-600">Try adjusting your search criteria or use different keywords.</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Saved Searches Preview */}
      {user && savedSearches && Array.isArray(savedSearches) && savedSearches.length > 0 && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-slate-900">Your Saved Searches</h3>
              <Button variant="outline">View All</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.isArray(savedSearches) && savedSearches.slice(0, 3).map((search: any) => (
                <Card key={search.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-slate-900 mb-2">{search.name}</h4>
                    <p className="text-sm text-slate-600 mb-3">{search.query}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-emerald-600">Ready to run</span>
                      <Button size="sm" variant="ghost">
                        <i className="fas fa-play mr-2"></i>Run
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Choose Car Auction AI?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Our AI-powered platform saves you time and money by finding the best deals across all major auction platforms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-robot text-blue-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-xl text-slate-900 mb-2">AI-Powered Search</h3>
              <p className="text-slate-600">Search using natural language. No complex filters or technical jargon required.</p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-database text-emerald-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-xl text-slate-900 mb-2">Multiple Sources</h3>
              <p className="text-slate-600">Search across Copart, IAAI, Manheim, ADESA, and eBay Motors simultaneously.</p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-bell text-orange-600 text-2xl"></i>
              </div>
              <h3 className="font-semibold text-xl text-slate-900 mb-2">Smart Alerts</h3>
              <p className="text-slate-600">Get notified instantly when new vehicles matching your criteria become available.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <i className="fas fa-car text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold">Car Auction AI</span>
              </div>
              <p className="text-slate-400 text-sm">
                AI-powered search across all major car auction platforms. 
                Find your perfect vehicle deal with natural language search.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Search</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Dashboard</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Saved Searches</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Alerts</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Auction Sources</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Copart</a></li>
                <li><a href="#" className="hover:text-white transition-colors">IAAI</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Manheim</a></li>
                <li><a href="#" className="hover:text-white transition-colors">ADESA</a></li>
                <li><a href="#" className="hover:text-white transition-colors">eBay Motors</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 mt-8 text-center text-sm text-slate-400">
            <p>&copy; 2024 Car Auction AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
