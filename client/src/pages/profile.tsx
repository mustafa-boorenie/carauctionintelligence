import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    location: "",
    bio: "",
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    instantAlerts: true,
  });

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({ title: "Profile updated successfully!" });
    } catch (error) {
      toast({ title: "Failed to update profile", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast({ 
        title: "Account deletion requested", 
        description: "We'll send you a confirmation email within 24 hours." 
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="max-w-md mx-auto pt-20">
          <Card>
            <CardContent className="pt-6 text-center">
              <i className="fas fa-lock text-4xl text-slate-400 mb-4"></i>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Authentication Required</h2>
              <p className="text-slate-600 mb-4">Please sign in to access your profile settings.</p>
              <Button onClick={() => window.location.href = '/auth'}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Profile Settings</h1>
            <p className="text-slate-600">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-center">Profile Picture</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <Avatar className="w-24 h-24 mx-auto">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
                    <AvatarFallback className="text-2xl">
                      {user.displayName?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-camera mr-2"></i>
                      Change Photo
                    </Button>
                    <Button variant="ghost" className="w-full text-red-500 hover:text-red-600">
                      Remove Photo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Main Settings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input
                          id="displayName"
                          value={profileData.displayName}
                          onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                          placeholder="Your display name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                          placeholder="City, State"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Notification Preferences */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-slate-500">Receive updates about your searches and favorites</p>
                      </div>
                      <Switch
                        checked={profileData.emailNotifications}
                        onCheckedChange={(checked) => setProfileData({...profileData, emailNotifications: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-slate-500">Get instant alerts for new vehicle matches</p>
                      </div>
                      <Switch
                        checked={profileData.smsNotifications}
                        onCheckedChange={(checked) => setProfileData({...profileData, smsNotifications: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Marketing Emails</Label>
                        <p className="text-sm text-slate-500">Receive tips, news, and special offers</p>
                      </div>
                      <Switch
                        checked={profileData.marketingEmails}
                        onCheckedChange={(checked) => setProfileData({...profileData, marketingEmails: checked})}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Instant Alerts</Label>
                        <p className="text-sm text-slate-500">Real-time notifications for saved search matches</p>
                      </div>
                      <Switch
                        checked={profileData.instantAlerts}
                        onCheckedChange={(checked) => setProfileData({...profileData, instantAlerts: checked})}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Security & Privacy */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Security & Privacy</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">Change Password</h4>
                        <p className="text-sm text-slate-500">Update your account password</p>
                      </div>
                      <Button variant="outline">
                        <i className="fas fa-key mr-2"></i>
                        Change
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-slate-500">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline">
                        <i className="fas fa-shield-alt mr-2"></i>
                        Enable
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">Privacy Settings</h4>
                        <p className="text-sm text-slate-500">Control your data and privacy</p>
                      </div>
                      <Button variant="outline">
                        <i className="fas fa-cog mr-2"></i>
                        Manage
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Danger Zone */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                      <div>
                        <h4 className="font-medium text-red-900">Delete Account</h4>
                        <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive" onClick={handleDeleteAccount}>
                        <i className="fas fa-trash mr-2"></i>
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-end space-x-4"
              >
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      Save Changes
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}