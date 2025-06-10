import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, User, Save, Camera, Pencil } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserProfile {
  name: string;
  age: string;
  bio: string;
  avatarUrl: string;
}

export default function AccountPage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: "",
    bio: "",
    avatarUrl: "",
  });
  const [editing, setEditing] = useState(false);

  // Load profile on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      try {
        setProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error("Failed to parse saved profile:", error);
      }
    }
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  // Handle avatar update
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert image to base64 string for storage
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({
        ...profile,
        avatarUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  // Save profile to local storage
  const saveProfile = () => {
    localStorage.setItem("user_profile", JSON.stringify(profile));
    setEditing(false);
    toast.success("Profile saved successfully");
    
    // Trigger a custom event to update bottom navigation
    window.dispatchEvent(new CustomEvent('profileUpdated'));
  };

  // Get user's first name or first initial
  const getInitials = () => {
    if (!profile.name) return "U";
    return profile.name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col pb-20 px-4 space-y-5 bg-background min-h-screen">
      <header className="mt-6 mb-2">
        <h1 className="text-2xl font-semibold text-center text-foreground">My Account</h1>
      </header>

      <Card className="bg-card shadow-sm p-6 border">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border-2 border-primary">
              {profile.avatarUrl ? (
                <AvatarImage src={profile.avatarUrl} alt={profile.name} />
              ) : (
                <AvatarFallback className="bg-primary/20 text-primary text-xl">
                  {getInitials()}
                </AvatarFallback>
              )}
            </Avatar>
            {editing && (
              <label 
                htmlFor="avatar-input" 
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer"
              >
                <Camera className="h-4 w-4" />
                <input 
                  type="file" 
                  id="avatar-input" 
                  accept="image/*" 
                  onChange={handleFileInput} 
                  className="hidden" 
                />
              </label>
            )}
          </div>

          {!editing ? (
            <div className="w-full text-center space-y-3">
              <h2 className="text-xl font-medium text-foreground">
                {profile.name || "Add Your Name"}
              </h2>
              {profile.age && (
                <p className="text-sm text-muted-foreground">Age: {profile.age}</p>
              )}
              {profile.bio && (
                <p className="text-sm text-foreground mt-4">{profile.bio}</p>
              )}
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => setEditing(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={profile.name} 
                  onChange={handleChange} 
                  placeholder="Your name" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input 
                  id="age" 
                  name="age" 
                  value={profile.age} 
                  onChange={handleChange} 
                  placeholder="Your age" 
                  type="number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  name="bio" 
                  value={profile.bio} 
                  onChange={handleChange} 
                  placeholder="A little about yourself" 
                  rows={3}
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <Button onClick={saveProfile} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="bg-card shadow-sm p-6 border">
        <h3 className="text-lg font-medium mb-4">Account Settings</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-foreground">Cycle Tracking</p>
              <p className="text-sm text-muted-foreground">Manage your cycle settings and log entries</p>
            </div>
            <Button variant="outline" className="text-primary" onClick={() => window.location.href = "/log"}>
              <Calendar className="h-4 w-4 mr-2" />
              Log & Settings
            </Button>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <p className="text-foreground">Health Data</p>
              <p className="text-sm text-muted-foreground">View and manage your health insights</p>
            </div>
            <Button variant="outline" className="text-primary" onClick={() => window.location.href = "/health"}>
              <User className="h-4 w-4 mr-2" />
              View
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
