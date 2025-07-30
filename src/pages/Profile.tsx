// Created by Max Neville
// Profile page with database configuration

import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import avatar1 from "@/assets/avatar1.webp";
import avatar2 from "@/assets/avatar2.webp";
import avatar3 from "@/assets/avatar3.jpg";
import avatar4 from "@/assets/avatar4.webp";


const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState<string | null>(null);
  const avatarOptions = [avatar1, avatar2, avatar3, avatar4];
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Local user account creation for demo purposes.
    // For production, replace with real authentication/session logic.
    async function loadProfileData() {
      setError(null);
      let userId = localStorage.getItem('userId');
      if (!userId) {
        userId = crypto.randomUUID();
        localStorage.setItem('userId', userId);
      }
      try {
        // Fetch user profile from Flask backend
        const res = await fetch(`/api/profile/${userId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch profile: ${res.status}`);
        }
        const profileData = await res.json();

        // Fetch challenge progress and count completed
        const res2 = await fetch(`/api/progress/${userId}`);
        if (!res2.ok) {
          throw new Error(`Failed to fetch progress: ${res2.status}`);
        }
        const progressList = await res2.json();
        const completedChallenges = Array.isArray(progressList)
          ? progressList.filter((p: any) => p.completed).length
          : 0;

        setProfile({
          ...profileData,
          completedChallenges,
        });
      } catch (err: any) {
        setError(err.message || 'An unknown error occurred.');
      }
    }
    loadProfileData();
  }, []);
  
  // error handling
  const handleSaveAvatar = async () => {
    if (!selectedAvatar || !profile) return;
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name,
          avatar_url: selectedAvatar,
          accessibility_mode: profile.accessibility_mode,
        }),
      });
      if (!res.ok) {
        throw new Error(`Failed to update profile: ${res.status}`);
      }
      const result = await res.json();
      if (result.status !== 'profile upserted') {
        throw new Error('Failed to update profile');
      } else {
        setProfile({ ...profile, avatar_url: selectedAvatar });
        setSelectedAvatar(null);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    }
    setIsSaving(false);
  };


  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-red-600">
        <div className="mb-4 font-bold text-lg">Error</div>
        <div className="mb-4">{error}</div>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

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
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-white/80 dark:bg-background/80 rounded-xl p-6 text-center shadow border border-border backdrop-blur-sm">
            <div className="text-lg font-semibold">XP Points</div>
            <div className="text-3xl font-bold text-primary">{profile.xp_points?.toLocaleString()}</div>
          </div>
          <div className="bg-white/80 dark:bg-background/80 rounded-xl p-6 text-center shadow border border-border backdrop-blur-sm">
            <div className="text-lg font-semibold">Challenges Completed</div>
            <div className="text-3xl font-bold text-primary">{profile.completedChallenges}</div>
          </div>
          <div className="bg-white/80 dark:bg-background/80 rounded-xl p-6 text-center shadow border border-border backdrop-blur-sm">
            <div className="text-lg font-semibold">Current Streak</div>
            <div className="text-3xl font-bold text-primary">{profile.current_streak} day{profile.current_streak !== 1 ? 's' : ''}</div>
          </div>
        </div>
        <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4 text-primary">Settings</h3>
        <div className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Accessibility Mode</label>
            <select
              className="w-full border rounded px-4 py-2 bg-background"
              value={profile._pending_accessibility_mode ?? profile.accessibility_mode ?? "none"}
              onChange={e => {
                const newMode = e.target.value;
                setProfile({ ...profile, _pending_accessibility_mode: newMode });
              }}
              disabled={isSaving}
            >
              <option value="none">None</option>
              <option value="neurodivergent">Neurodivergent</option>
              <option value="visual">Visual Impairment</option>
              <option value="hearing">Hearing Impairment</option>
              <option value="motor">Motor Impairment</option>
            </select>
          </div>
          {/* Add more settings fields here as needed */}
        </div>
      </div>
      <Button
        className="w-full"
        variant="outline"
        disabled={
          isSaving ||
          (profile._pending_accessibility_mode === undefined || profile._pending_accessibility_mode === profile.accessibility_mode)
        }
        onClick={async () => {
          if (!profile._pending_accessibility_mode || profile._pending_accessibility_mode === profile.accessibility_mode) return;
          setIsSaving(true);
          setError(null);
          try {
            const res = await fetch('/api/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: profile.id,
                username: profile.username,
                display_name: profile.display_name,
                avatar_url: profile.avatar_url,
                accessibility_mode: profile._pending_accessibility_mode,
              }),
            });
            if (!res.ok) throw new Error(`Failed to update profile: ${res.status}`);
            const result = await res.json();
            if (result.status !== 'profile upserted') throw new Error('Failed to update profile');
            setProfile({ ...profile, accessibility_mode: profile._pending_accessibility_mode, _pending_accessibility_mode: undefined });
          } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
          }
          setIsSaving(false);
        }}
      >
        {isSaving ? 'Saving...' : 'Confirm Mode Change'}
      </Button>
      </div>
    </div>
  );
};

export default Profile;
