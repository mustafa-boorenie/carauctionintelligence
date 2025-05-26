import { Header } from "@/components/Header";
import { VehicleCard } from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savedSearches = [] } = useQuery({
    queryKey: ['/api/saved-searches'],
    enabled: !!user,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: !!user,
  });

  const { data: searchHistory = [] } = useQuery({
    queryKey: ['/api/search/history'],
    enabled: !!user,
  });

  const deleteSavedSearchMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/saved-searches/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-uid': user?.uid || '',
        },
      });
      if (!response.ok) throw new Error('Failed to delete saved search');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/saved-searches'] });
      toast({ title: "Saved search deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete saved search", variant: "destructive" });
    },
  });

  const runSavedSearchMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/saved-searches/${id}/run`, {
        method: 'POST',
        headers: {
          'x-user-uid': user?.uid || '',
        },
      });
      if (!response.ok) throw new Error('Failed to run saved search');
      return response.json();
    },
    onSuccess: (data) => {
      toast({ 
        title: "Search completed", 
        description: `Found ${data.count} results`
      });
    },
    onError: () => {
      toast({ title: "Failed to run search", variant: "destructive" });
    },
  });

  const removeFavoriteMutation = useMutation({
    mutationFn: async (vehicleId: number) => {
      const response = await fetch(`/api/favorites/${vehicleId}`, {
        method: 'DELETE',
        headers: {
          'x-user-uid': user?.uid || '',
        },
      });
      if (!response.ok) throw new Error('Failed to remove favorite');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({ title: "Vehicle removed from favorites" });
    },
    onError: () => {
      toast({ title: "Failed to remove from favorites", variant: "destructive" });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardContent className="pt-6 text-center">
              <i className="fas fa-lock text-4xl text-slate-400 mb-4"></i>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Authentication Required</h2>
              <p className="text-slate-600 mb-4">Please sign in to access your dashboard.</p>
              <Button onClick={() => window.location.href = '/auth'}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const trialDaysLeft = user.trialEndDate ? 
    Math.max(0, Math.ceil((new Date(user.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Trial Status Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Free Trial Active</h3>
              <p className="text-slate-600">
                <span className="font-medium text-emerald-600">{trialDaysLeft} days</span> remaining in your trial
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-full bg-slate-200 rounded-full h-2 max-w-48">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full" 
                  style={{ width: `${Math.min(100, (trialDaysLeft / 182) * 100)}%` }}
                ></div>
              </div>
              <Button>View Plans</Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="searches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="searches">Saved Searches</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="history">Search History</TabsTrigger>
          </TabsList>

          <TabsContent value="searches" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Saved Searches</h2>
              <Button>
                <i className="fas fa-plus mr-2"></i>
                New Search
              </Button>
            </div>

            {savedSearches.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <i className="fas fa-search text-4xl text-slate-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No saved searches yet</h3>
                  <p className="text-slate-600 mb-4">Create your first saved search to get alerts when new matching vehicles are available.</p>
                  <Button>Create Saved Search</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedSearches.map((search: any) => (
                  <Card key={search.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{search.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => runSavedSearchMutation.mutate(search.id)}
                            disabled={runSavedSearchMutation.isPending}
                          >
                            <i className="fas fa-play"></i>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => deleteSavedSearchMutation.mutate(search.id)}
                            disabled={deleteSavedSearchMutation.isPending}
                          >
                            <i className="fas fa-trash text-red-500"></i>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 text-sm mb-3">{search.query}</p>
                      <div className="flex justify-between items-center">
                        <Badge variant={search.alertsEnabled ? "default" : "secondary"}>
                          {search.alertsEnabled ? "Alerts On" : "Alerts Off"}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {search.lastRunAt 
                            ? `Last run ${new Date(search.lastRunAt).toLocaleDateString()}`
                            : "Never run"
                          }
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Favorite Vehicles</h2>
              <span className="text-slate-600">{favorites.length} saved</span>
            </div>

            {favorites.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <i className="fas fa-heart text-4xl text-slate-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No favorites yet</h3>
                  <p className="text-slate-600 mb-4">Save vehicles you're interested in to keep track of them.</p>
                  <Button>Start Searching</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites.map((vehicle: any) => (
                  <VehicleCard 
                    key={vehicle.id} 
                    vehicle={vehicle} 
                    isFavorite={true}
                    onRemoveFavorite={() => removeFavoriteMutation.mutate(vehicle.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Search History</h2>
              <span className="text-slate-600">{searchHistory.length} searches</span>
            </div>

            {searchHistory.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <i className="fas fa-clock text-4xl text-slate-400 mb-4"></i>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No search history</h3>
                  <p className="text-slate-600 mb-4">Your search history will appear here once you start searching.</p>
                  <Button>Start Searching</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {searchHistory.map((search: any) => (
                  <Card key={search.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 mb-1">{search.query}</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <span>{search.resultCount} results</span>
                            <span>{new Date(search.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <i className="fas fa-redo mr-2"></i>
                            Run Again
                          </Button>
                          <Button size="sm" variant="outline">
                            <i className="fas fa-save mr-2"></i>
                            Save
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
