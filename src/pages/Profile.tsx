

import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import avatar1 from "@/assets/avatar1.webp";
import avatar2 from "@/assets/avatar2.webp";
import avatar3 from "@/assets/avatar3.jpg";
import avatar4 from "@/assets/avatar4.webp";


const Profile = () => {
  const [profile, setProfile] = useState(null);
  const avatarOptions = [avatar1, avatar2, avatar3, avatar4];
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data?.user;
      if (user) {
        supabase
          .from("profiles")
          .select("username, display_name, avatar_url, accessibility_mode, xp_points, current_streak")
          .eq("id", user.id)
          .single()
          .then(({ data }) => setProfile(data));
      }
    });
  }, []);

  const handleSaveAvatar = async () => {
    if (!selectedAvatar || !profile) return;
    setIsSaving(true);
    // Update profile with selected avatar
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: selectedAvatar })
      .eq('username', profile.username);
    if (updateError) {
      alert('Failed to update profile');
    } else {
      setProfile({ ...profile, avatar_url: selectedAvatar });
      setSelectedAvatar(null);
    }
    setIsSaving(false);
  };

  if (!profile) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Gradient Background Only */}
      <div className="fixed inset-0 z-0 pointer-events-none w-screen h-screen">
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 via-background/80 to-accent/20 backdrop-blur-md" />
      </div>
      <div className="max-w-xl mx-auto mt-10 p-8 rounded-2xl shadow-2xl relative z-10 overflow-hidden bg-white/80 dark:bg-background/80 border border-border backdrop-blur-sm">
      <Button variant="outline" className="mb-6" onClick={() => window.location.href = './' }>
        ← Go Back
      </Button>
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          <Avatar className="w-28 h-28 mb-2 ring-4 ring-primary shadow-lg">
            <AvatarImage src={selectedAvatar || profile.avatar_url || undefined} alt={profile.username} />
            <AvatarFallback>{profile.username?.charAt(0) ?? "U"}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex gap-4 mt-4 flex-wrap justify-center">
          {avatarOptions.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={`w-14 h-14 rounded-full border-2 ${selectedAvatar === img ? 'border-primary' : 'border-transparent'} focus:outline-none focus:ring-2 focus:ring-primary transition`}
              onClick={() => setSelectedAvatar(img)}
            >
              <img src={img} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover rounded-full" />
            </button>
          ))}
        </div>
        <h2 className="text-3xl font-bold mb-1 text-primary">{profile.display_name || profile.username}</h2>
        <span className="text-muted-foreground">@{profile.username}</span>
        {selectedAvatar && (
          <Button className="mt-4" variant="default" disabled={isSaving} onClick={handleSaveAvatar}>
            {isSaving ? "Saving..." : "Save Avatar"}
          </Button>
        )}
      </div>
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-white/80 dark:bg-background/80 rounded-xl p-6 text-center shadow border border-border backdrop-blur-sm">
          <div className="text-lg font-semibold">XP Points</div>
          <div className="text-3xl font-bold text-primary">{profile.xp_points}</div>
        </div>
          <div className="bg-white/80 dark:bg-background/80 rounded-xl p-6 text-center shadow border border-border backdrop-blur-sm">
          <div className="text-lg font-semibold">Current Streak</div>
          <div className="text-3xl font-bold text-primary">{profile.current_streak}</div>
        </div>
      </div>
        <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-primary">Settings</h3>
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Accessibility Mode</label>
            <input
              type="text"
              className="w-full border rounded px-4 py-2 bg-background"
              value={profile.accessibility_mode || ""}
              readOnly
            />
          </div>
          {/* Add more settings fields here as needed */}
        </div>
      </div>
      <Button className="w-full" variant="outline">Edit Profile</Button>
      </div>
    </div>
  );
};

export default Profile;
