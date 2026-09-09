import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated gradient blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute top-40 right-20 w-96 h-96 bg-emerald/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-sage/20 rounded-full blur-3xl animate-pulse-soft" />
      </div>

      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            AI-Powered Skin Health Platform
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-display font-bold text-foreground leading-tight mb-6">
            Modern Dermatology
            <br />
            <span className="text-primary">Meets Ayurveda</span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Get personalized skin analysis with the power of AI — choose between modern dermatological insights or time-tested Ayurvedic wisdom.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="text-base px-8 py-6 rounded-xl" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 rounded-xl"
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>

        {/* Decorative leaves */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ delay: 1 }}
          className="absolute bottom-10 left-10 text-primary text-8xl select-none pointer-events-none"
        >
          🌿
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ delay: 1.2 }}
          className="absolute top-32 right-10 text-6xl select-none pointer-events-none"
        >
          🍃
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
