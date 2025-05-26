import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface VehicleCardProps {
  vehicle: {
    id: number;
    title: string;
    make: string;
    model: string;
    year: number;
    vin?: string;
    mileage?: number;
    currentBid?: string;
    buyItNowPrice?: string;
    damageType?: string;
    location?: string;
    auctionDate?: string;
    auctionEndDate?: string;
    imageUrls?: string[];
    auctionUrl?: string;
    source: string;
  };
  isFavorite?: boolean;
  onRemoveFavorite?: () => void;
}

export function VehicleCard({ vehicle, isFavorite = false, onRemoveFavorite }: VehicleCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isImageLoading, setIsImageLoading] = useState(true);

  const addFavoriteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-uid': user?.uid || '',
        },
        body: JSON.stringify({ vehicleId: vehicle.id }),
      });
      if (!response.ok) throw new Error('Failed to add favorite');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      toast({ title: "Added to favorites" });
    },
    onError: () => {
      toast({ title: "Failed to add to favorites", variant: "destructive" });
    },
  });

  const getSourceBadgeColor = (source: string) => {
    const colors = {
      'copart': 'bg-orange-100 text-orange-800',
      'iaai': 'bg-purple-100 text-purple-800',
      'manheim': 'bg-indigo-100 text-indigo-800',
      'adesa': 'bg-gray-100 text-gray-800',
      'ebay': 'bg-green-100 text-green-800',
    };
    return colors[source as keyof typeof colors] || 'bg-blue-100 text-blue-800';
  };

  const formatPrice = (price?: string) => {
    if (!price) return 'N/A';
    const num = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatTimeRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const imageUrl = vehicle.imageUrls?.[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img 
          src={imageUrl}
          alt={vehicle.title}
          className={`w-full h-48 object-cover transition-opacity duration-200 ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setIsImageLoading(false)}
          onError={() => setIsImageLoading(false)}
        />
        {isImageLoading && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
            <i className="fas fa-image text-slate-400 text-2xl"></i>
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex space-x-2">
          {vehicle.damageType && (
            <Badge 
              className={
                vehicle.damageType.toLowerCase().includes('clean') 
                  ? 'bg-green-100 text-green-700'
                  : vehicle.damageType.toLowerCase().includes('hail')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }
            >
              {vehicle.damageType}
            </Badge>
          )}
          <Badge className={getSourceBadgeColor(vehicle.source)}>
            {vehicle.source.toUpperCase()}
          </Badge>
        </div>
        
        <button 
          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
          onClick={() => {
            if (isFavorite && onRemoveFavorite) {
              onRemoveFavorite();
            } else if (user) {
              addFavoriteMutation.mutate();
            }
          }}
          disabled={addFavoriteMutation.isPending}
        >
          <i className={`fa${isFavorite ? 's' : 'r'} fa-heart ${isFavorite ? 'text-red-500' : 'text-slate-600'}`}></i>
        </button>
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{vehicle.title}</h3>
            {vehicle.vin && (
              <p className="text-slate-600 text-sm">VIN: {vehicle.vin}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-blue-500">
              {formatPrice(vehicle.currentBid || vehicle.buyItNowPrice)}
            </p>
            <p className="text-xs text-slate-500">
              {vehicle.currentBid ? 'Current Bid' : 'Buy It Now'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 mb-4">
          {vehicle.mileage && (
            <div className="flex items-center">
              <i className="fas fa-tachometer-alt text-slate-400 mr-2"></i>
              <span>{vehicle.mileage.toLocaleString()} miles</span>
            </div>
          )}
          {vehicle.location && (
            <div className="flex items-center">
              <i className="fas fa-map-marker-alt text-slate-400 mr-2"></i>
              <span>{vehicle.location}</span>
            </div>
          )}
          {vehicle.auctionDate && (
            <div className="flex items-center">
              <i className="fas fa-calendar text-slate-400 mr-2"></i>
              <span>{new Date(vehicle.auctionDate).toLocaleDateString()}</span>
            </div>
          )}
          {vehicle.auctionEndDate && (
            <div className="flex items-center">
              <i className="fas fa-clock text-slate-400 mr-2"></i>
              <span>{formatTimeRemaining(vehicle.auctionEndDate)}</span>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <Button 
            className="flex-1" 
            onClick={() => vehicle.auctionUrl && window.open(vehicle.auctionUrl, '_blank')}
          >
            <i className="fas fa-external-link-alt mr-2"></i>
            View Auction
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => {
              if (isFavorite && onRemoveFavorite) {
                onRemoveFavorite();
              } else if (user) {
                addFavoriteMutation.mutate();
              }
            }}
            disabled={addFavoriteMutation.isPending}
          >
            <i className="fas fa-bell"></i>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
