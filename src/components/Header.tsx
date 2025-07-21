import { Code, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
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
        </div>
      </div>
    </header>
  );
};

export default Header;