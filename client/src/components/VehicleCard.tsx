import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-0 h-full flex flex-col">
        <div className="relative">
          <motion.img 
            src={imageUrl}
            alt={vehicle.title}
            className={`w-full h-56 object-cover transition-all duration-300 ${isImageLoading ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}
            onLoad={() => setIsImageLoading(false)}
            onError={() => setIsImageLoading(false)}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          {isImageLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse flex items-center justify-center"
            >
              <div className="text-slate-400 text-3xl">
                <i className="fas fa-car"></i>
              </div>
            </motion.div>
          )}
        
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="absolute top-4 left-4 flex flex-wrap gap-2"
          >
            {vehicle.damageType && (
              <Badge 
                className={
                  vehicle.damageType.toLowerCase().includes('clean') 
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : vehicle.damageType.toLowerCase().includes('hail')
                    ? 'bg-red-100 text-red-700 border-red-200'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                }
              >
                {vehicle.damageType}
              </Badge>
            )}
            <Badge className={`${getSourceBadgeColor(vehicle.source)} font-medium`}>
              {vehicle.source.toUpperCase()}
            </Badge>
          </motion.div>
          
          <motion.button 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-all duration-200"
            onClick={() => {
              if (isFavorite && onRemoveFavorite) {
                onRemoveFavorite();
              } else if (user) {
                addFavoriteMutation.mutate();
              }
            }}
            disabled={addFavoriteMutation.isPending}
          >
            <i className={`fa${isFavorite ? 's' : 'r'} fa-heart text-lg ${isFavorite ? 'text-red-500' : 'text-slate-600'}`}></i>
          </motion.button>
        </div>
      
        <CardContent className="p-6 flex-1 flex flex-col">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col space-y-4 h-full"
          >
            <div className="flex flex-col space-y-3">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 leading-tight line-clamp-2">
                  {vehicle.title}
                </h3>
                {vehicle.vin && (
                  <p className="text-slate-500 text-sm font-mono">VIN: {vehicle.vin}</p>
                )}
              </div>
              
              <div className="flex flex-col space-y-1">
                <p className="text-3xl font-bold text-blue-600">
                  {formatPrice(vehicle.currentBid || vehicle.buyItNowPrice)}
                </p>
                <p className="text-sm text-slate-500 font-medium">
                  {vehicle.currentBid ? 'Current Bid' : 'Buy It Now'}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 flex-1">
              {vehicle.mileage && (
                <motion.div 
                  className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg"
                  whileHover={{ backgroundColor: "rgb(241 245 249)" }}
                >
                  <i className="fas fa-tachometer-alt text-blue-500 w-4"></i>
                  <span className="font-medium">{vehicle.mileage.toLocaleString()} miles</span>
                </motion.div>
              )}
              {vehicle.location && (
                <motion.div 
                  className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg"
                  whileHover={{ backgroundColor: "rgb(241 245 249)" }}
                >
                  <i className="fas fa-map-marker-alt text-green-500 w-4"></i>
                  <span className="font-medium">{vehicle.location}</span>
                </motion.div>
              )}
              {vehicle.auctionDate && (
                <motion.div 
                  className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg"
                  whileHover={{ backgroundColor: "rgb(241 245 249)" }}
                >
                  <i className="fas fa-calendar text-purple-500 w-4"></i>
                  <span className="font-medium">{new Date(vehicle.auctionDate).toLocaleDateString()}</span>
                </motion.div>
              )}
              {vehicle.auctionEndDate && (
                <motion.div 
                  className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg"
                  whileHover={{ backgroundColor: "rgb(241 245 249)" }}
                >
                  <i className="fas fa-clock text-orange-500 w-4"></i>
                  <span className="font-medium">{formatTimeRemaining(vehicle.auctionEndDate)}</span>
                </motion.div>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 shadow-lg" 
                  onClick={() => {
                    if (vehicle.auctionUrl) {
                      window.open(vehicle.auctionUrl, '_blank', 'noopener,noreferrer');
                    } else {
                      alert('Auction link not available for this vehicle');
                    }
                  }}
                  disabled={!vehicle.auctionUrl}
                >
                  <i className="fas fa-external-link-alt mr-2"></i>
                  View Auction
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="w-12 h-12 border-2 border-slate-200 hover:border-blue-300"
                  onClick={() => {
                    if (isFavorite && onRemoveFavorite) {
                      onRemoveFavorite();
                    } else if (user) {
                      addFavoriteMutation.mutate();
                    }
                  }}
                  disabled={addFavoriteMutation.isPending}
                >
                  <i className="fas fa-bell text-slate-600"></i>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
