import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Leaf } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold text-foreground">ArogyAI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo("features")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</button>
          <button onClick={() => scrollTo("how-it-works")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</button>
          <button onClick={() => scrollTo("about")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</button>
          <button onClick={() => scrollTo("faq")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">FAQ</button>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" asChild><Link to="/login">Log In</Link></Button>
          <Button asChild><Link to="/signup">Sign Up</Link></Button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
          <button onClick={() => scrollTo("features")} className="block w-full text-left py-2 text-sm font-medium text-muted-foreground">Features</button>
          <button onClick={() => scrollTo("how-it-works")} className="block w-full text-left py-2 text-sm font-medium text-muted-foreground">How It Works</button>
          <button onClick={() => scrollTo("about")} className="block w-full text-left py-2 text-sm font-medium text-muted-foreground">About</button>
          <button onClick={() => scrollTo("faq")} className="block w-full text-left py-2 text-sm font-medium text-muted-foreground">FAQ</button>
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" asChild className="flex-1"><Link to="/login">Log In</Link></Button>
            <Button asChild className="flex-1"><Link to="/signup">Sign Up</Link></Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
