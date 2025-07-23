import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import AccessibilityModeCard from "@/components/AccessibilityModeCard";
import ChallengeCard from "@/components/ChallengeCard";
import StatsCard from "@/components/StatsCard";
import { ChallengeService } from "@/services/challengeService";
import { supabase } from "@/integrations/supabase/client";
import { useAccessibility, accessibilityModes } from "@/contexts/AccessibilityContext";
import { useNeurodivergentMode } from "@/hooks/useNeurodivergentMode";
import NeurodivergentModeIndicator from "@/components/NeurodivergentModeIndicator";
import NeurodivergentModeSettingsDialog from "@/components/NeurodivergentModeSettingsDialog";
import { 
  Zap, 
  Trophy, 
  Target, 
  BookOpen, 
  Sparkles,
  ChevronRight,
  Users,
  Heart,
  Shield
} from "lucide-react";

// Import generated images
import heroImage from "@/assets/hero-image.jpg";
import neurodivergentIcon from "@/assets/neurodivergent-icon.jpg";
import blindIcon from "@/assets/blind-icon.jpg";
import deafIcon from "@/assets/deaf-icon.jpg";
import fmsIcon from "@/assets/fms-icon.jpg";

const Index = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [challenges, setChallenges] = useState([]);
  const [userStats, setUserStats] = useState({ xpPoints: 0, challengesCompleted: 0, currentStreak: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const { setMode } = useAccessibility();
  const { isActive } = useNeurodivergentMode();

  const uiAccessibilityModes = [
    {
      id: "neurodivergent",
      title: "Neurodivergent",
      description: "Tailored for ADHD, autism, dyslexia, and other neurodivergent conditions",
      icon: neurodivergentIcon,
      features: [
        "Clear, structured layouts",
        "Reduced cognitive load",
        "Customizable pacing",
        "Visual learning aids"
      ]
    },
    {
      id: "visual",
      title: "Visual Impairment",
      description: "Optimized for blind and low-vision learners",
      icon: blindIcon,
      features: [
        "Screen reader optimized",
        "High contrast modes",
        "Keyboard navigation",
        "Audio descriptions"
      ]
    },
    {
      id: "hearing",
      title: "Hearing Impairment",
      description: "Designed for deaf and hard-of-hearing learners",
      icon: deafIcon,
      features: [
        "Visual feedback",
        "Captions and transcripts",
        "Sign language support",
        "Vibration alerts"
      ]
    },
    {
      id: "motor",
      title: "Motor Impairment",
      description: "Adapted for fine motor skill limitations",
      icon: fmsIcon,
      features: [
        "Large clickable areas",
        "Voice commands",
        "Switch navigation",
        "Customizable controls"
      ]
    }
  ];

  const handleModeSelection = (modeId: string) => {
    const newSelectedMode = modeId === selectedMode ? null : modeId;
    setSelectedMode(newSelectedMode);
    
    // Set accessibility mode in context using context modes
    if (newSelectedMode) {
      const contextMode = accessibilityModes.find(m => m.id === newSelectedMode);
      if (contextMode) {
        setMode(contextMode);
      }
    } else {
      setMode(null);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Load challenges with progress
        const challengesWithProgress = await ChallengeService.getChallengesWithProgress(user.id);
        setChallenges(challengesWithProgress);

        // Load user stats
        const { data: profile } = await supabase
          .from('profiles')
          .select('xp_points, current_streak')
          .eq('id', user.id)
          .single();

        if (profile) {
          const { data: completedChallenges } = await supabase
            .from('challenge_progress')
            .select('id')
            .eq('user_id', user.id)
            .eq('completed', true);

          setUserStats({
            xpPoints: profile.xp_points || 0,
            challengesCompleted: completedChallenges?.length || 0,
            currentStreak: profile.current_streak || 0
          });
        }
      } else {
        // Load default challenges for non-authenticated users
        setChallenges([
          {
            title: "HTML Basics",
            description: "Learn the fundamental building blocks of web development",
            difficulty: "Beginner" as const,
            estimatedTime: "45 min",
            progress: 0,
            xpReward: 100,
            isCompleted: false,
            isLocked: false
          },
          {
            title: "CSS Styling",
            description: "Master the art of styling web pages with CSS",
            difficulty: "Beginner" as const,
            estimatedTime: "60 min",
            progress: 0,
            xpReward: 150,
            isCompleted: false,
            isLocked: false
          },
          {
            title: "JavaScript Functions",
            description: "Dive into programming logic with JavaScript",
            difficulty: "Intermediate" as const,
            estimatedTime: "90 min",
            progress: 0,
            xpReward: 200,
            isCompleted: false,
            isLocked: true
          }
        ]);
      }
    };

    loadUserData();
  }, []);

  const staticChallenges = [
    {
      title: "HTML Basics",
      description: "Learn the fundamental building blocks of web development",
      difficulty: "Beginner" as const,
      estimatedTime: "45 min",
      progress: 75,
      xpReward: 100,
      isCompleted: false,
      isLocked: false
    },
    {
      title: "CSS Styling",
      description: "Master the art of styling web pages with CSS",
      difficulty: "Beginner" as const,
      estimatedTime: "60 min",
      progress: 0,
      xpReward: 150,
      isCompleted: false,
      isLocked: false
    },
    {
      title: "JavaScript Functions",
      description: "Dive into programming logic with JavaScript",
      difficulty: "Intermediate" as const,
      estimatedTime: "90 min",
      progress: 0,
      xpReward: 200,
      isCompleted: false,
      isLocked: true
    }
  ];

  return (
    <div className={`min-h-screen bg-background ${showSettings ? 'overflow-hidden' : ''}`}>
      {/* Background Blur Overlay for Settings - Higher z-index for proper layering */}
      {showSettings && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-lg z-50" style={{ backdropFilter: 'blur(20px) saturate(180%)' }} />
      )}
      
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <Badge className="badge-gamified">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Inclusive Learning Platform
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                  Code{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    Without Barriers
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Master programming with personalized learning experiences designed for every ability. 
                  Choose your accessibility mode and start your coding journey today.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="btn-hero"
                  onClick={() => window.location.href = '/auth'}
                >
                  Start Learning
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline">
                  Explore Modes
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">10K+</div>
                  <div className="text-sm text-muted-foreground">Learners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">95%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>

            <div className="relative lg:pl-8">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl float-animation">
                <img
                  src={heroImage}
                  alt="Diverse learners using accessible coding platform"
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <StatsCard
              title="Total XP Earned"
              value={userStats.xpPoints.toLocaleString()}
              subtitle="Keep learning to earn more!"
              progress={Math.min(100, (userStats.xpPoints / 1000) * 100)}
              icon={<Zap className="h-6 w-6" />}
              color="primary"
            />
            <StatsCard
              title="Challenges Completed"
              value={userStats.challengesCompleted}
              subtitle={`${Math.max(0, 3 - userStats.challengesCompleted)} more to go!`}
              progress={Math.min(100, (userStats.challengesCompleted / 3) * 100)}
              icon={<Trophy className="h-6 w-6" />}
              color="success"
            />
            <StatsCard
              title="Current Streak"
              value={`${userStats.currentStreak} day${userStats.currentStreak !== 1 ? 's' : ''}`}
              subtitle={userStats.currentStreak > 0 ? "Keep it up!" : "Start your streak!"}
              progress={Math.min(100, (userStats.currentStreak / 7) * 100)}
              icon={<Target className="h-6 w-6" />}
              color="warning"
            />
          </div>
        </div>
      </section>

      {/* Accessibility Modes Section */}
      <section id="modes" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="badge-gamified">
              <Shield className="h-4 w-4 mr-2" />
              Accessibility First
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Choose Your Learning Mode
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform adapts to your specific needs, ensuring everyone can learn coding effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {uiAccessibilityModes.map((mode) => (
              <AccessibilityModeCard
                key={mode.id}
                title={mode.title}
                description={mode.description}
                icon={mode.icon}
                features={mode.features}
                isSelected={selectedMode === mode.id}
                onClick={() => handleModeSelection(mode.id)}
              />
            ))}
          </div>

          {selectedMode && (
            <div className="text-center animate-bounce-in">
              <Button
                size="lg"
                className="btn-success"
                onClick={() => window.location.href = '/challenge'}
              >
                Continue with {uiAccessibilityModes.find(m => m.id === selectedMode)?.title}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Challenges Section */}
      <section id="challenges" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="badge-gamified">
              <BookOpen className="h-4 w-4 mr-2" />
              Interactive Learning
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Featured Challenges
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Progress through carefully crafted coding challenges designed for your learning style
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {challenges.map((challenge, index) => (
              <ChallengeCard 
                key={challenge.id || index} 
                {...challenge} 
                onClick={() => window.location.href = `/challenge?id=${challenge.id || 'html-basics'}`}
              />
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              View All Challenges
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="badge-gamified">
              <Heart className="h-4 w-4 mr-2" />
              Built for Everyone
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Why Choose AccessCode?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-elevated text-center">
              <div className="p-4 bg-gradient-to-r from-primary to-primary-glow rounded-xl w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Inclusive Design</h3>
              <p className="text-muted-foreground">
                Every feature is designed with accessibility in mind, ensuring no one is left behind
              </p>
            </div>

            <div className="card-elevated text-center">
              <div className="p-4 bg-gradient-to-r from-success to-accent rounded-xl w-fit mx-auto mb-4">
                <Target className="h-8 w-8 text-success-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Personalized Learning</h3>
              <p className="text-muted-foreground">
                Adaptive learning paths that adjust to your pace and learning style
              </p>
            </div>

            <div className="card-elevated text-center">
              <div className="p-4 bg-gradient-to-r from-warning to-yellow-400 rounded-xl w-fit mx-auto mb-4">
                <Trophy className="h-8 w-8 text-warning-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Gamified Progress</h3>
              <p className="text-muted-foreground">
                Earn XP, unlock achievements, and track your coding journey with engaging rewards
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-primary-glow">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to Start Your Coding Journey?
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Join thousands of learners who are mastering programming with our accessible platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => window.location.href = '/auth'}
              >
                Create Free Account
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-primary to-primary-glow rounded-lg">
                <BookOpen className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                AccessCode
              </span>
            </div>
            <p className="text-muted-foreground">
              Empowering everyone to learn coding, regardless of ability
            </p>
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Neurodivergent Mode Indicator */}
      {isActive && (
        <NeurodivergentModeIndicator 
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Neurodivergent Mode Settings Dialog */}
      <NeurodivergentModeSettingsDialog 
        open={showSettings}
        onOpenChange={setShowSettings}
      />
    </div>
  );
};

export default Index;
