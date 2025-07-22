import { useEffect, useState } from "react";
import { Code, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";


const Header = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user || null);
    });
  }, []);
  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("username, avatar_url")
        .eq("id", user.id)
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 min-h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-gradient-to-r from-primary to-primary-glow rounded-lg">
            <Code className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AccessCode
            </h1>
            <p className="text-xs text-muted-foreground">Learn coding, your way</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#features" className="text-foreground hover:text-primary transition-colors">
            Features
          </a>
          <a href="#modes" className="text-foreground hover:text-primary transition-colors">
            Accessibility Modes
          </a>
          <a href="#challenges" className="text-foreground hover:text-primary transition-colors">
            Challenges
          </a>
        </nav>
        <div className="flex items-center space-x-3">
          {user && profile ? (
            <Popover>
              <PopoverTrigger asChild>
                <Avatar>
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                  <AvatarFallback>{profile.username?.charAt(0) ?? "U"}</AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent className="min-w-[180px] p-4">
                <div className="flex flex-col items-center">
                  <Avatar className="mb-2">
                    <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                    <AvatarFallback>{profile.username?.charAt(0) ?? "U"}</AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-lg">{profile.username}</span>
                  <Button className="mt-4 w-full" variant="outline" onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.reload();
                  }}>
                    Sign Out
                  </Button>
                  <Button className="mt-4 w-full" variant="outline" onClick={() => window.location.href = '/profile' }>
                    View Profile
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <>
              <Button 
                variant="outline" 
                className="hidden sm:inline-flex"
                onClick={() => window.location.href = '/auth'}
              >
                Sign In
              </Button>
              <Button 
                className="btn-hero"
                onClick={() => window.location.href = '/auth'}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;