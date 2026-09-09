import { motion } from "framer-motion";
import { ScanFace, LayoutDashboard, TrendingUp, FileText, ShoppingBag, Shield } from "lucide-react";

const features = [
  { icon: ScanFace, title: "AI Skin Analysis", desc: "Advanced image recognition for accurate skin condition identification." },
  { icon: LayoutDashboard, title: "Health Dashboard", desc: "Track your skin health journey with intuitive charts and insights." },
  { icon: TrendingUp, title: "Progress Tracking", desc: "Monitor improvements over time with before/after comparisons." },
  { icon: FileText, title: "Personalized Plans", desc: "Custom treatment plans tailored to your unique skin profile." },
  { icon: ShoppingBag, title: "Product Suggestions", desc: "Curated recommendations for products that work for you." },
  { icon: Shield, title: "Prevention Tips", desc: "Proactive guidance to maintain healthy, radiant skin." },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A comprehensive toolkit for your skin health journey
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-xl bg-background border border-border/50 hover:shadow-lg hover:shadow-primary/5 transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
