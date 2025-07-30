// Written by Max Neville
// Sign-in Page with SQLite integration


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Code, Sparkles, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Form states
  // Email/password are no longer used, but keep state for possible future use
  // const [email, setEmail] = useState('');
  // const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');

  // Helper: generate UUID (for demo, use crypto.randomUUID if available)
  const generateUUID = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    // fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Sign Up: create user in backend and set localStorage userId
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!username || !displayName) {
        toast({ title: 'Missing fields', description: 'Username and display name are required.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      // Check if user already exists (by username)
      const res = await fetch(`/api/profile/username/${encodeURIComponent(username)}`);
      if (res.ok) {
        toast({ title: 'Account exists', description: 'This username is already taken. Please sign in or choose another.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      // Create new user
      const userId = generateUUID();
      const upsertRes = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userId,
          username,
          display_name: displayName,
          avatar_url: '',
          accessibility_mode: '',
        }),
      });
      if (!upsertRes.ok) throw new Error('Failed to create user');
      localStorage.setItem('userId', userId);
      toast({ title: 'Account created!', description: 'You are signed up and signed in.' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Signup failed', description: error.message || 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Sign In: look up user by username, set localStorage userId
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!username) {
        toast({ title: 'Missing username', description: 'Please enter your username.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/profile/username/${encodeURIComponent(username)}`);
      if (!res.ok) {
        toast({ title: 'User not found', description: 'No account found with that username.', variant: 'destructive' });
        setLoading(false);
        return;
      }
      const profile = await res.json();
      localStorage.setItem('userId', profile.id);
      toast({ title: 'Welcome back!', description: 'You have successfully signed in.' });
      navigate('/');
    } catch (error: any) {
      toast({ title: 'Sign in failed', description: error.message || 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // HTML
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="p-2 bg-gradient-to-r from-primary to-primary-glow rounded-lg">
              <Code className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              AccessCode
            </span>
          </div>
          <Badge className="badge-gamified mb-4">
            <Sparkles className="h-4 w-4 mr-2" />
            Inclusive Learning Platform
          </Badge>
          <h1 className="text-2xl font-bold text-foreground">Welcome</h1>
          <p className="text-muted-foreground">Sign in to continue your coding journey</p>
        </div>

        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Access Your Account</CardTitle>
            <CardDescription>
              Sign in to your existing account or create a new one to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-username">Username</Label>
                    <Input
                      id="signin-username"
                      type="text"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-hero" 
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      type="text"
                      placeholder="Your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-hero" 
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;