import { motion } from "framer-motion";
import { Stethoscope, Leaf, Check } from "lucide-react";

const modes = [
  {
    icon: Stethoscope,
    title: "Dermatology Mode",
    subtitle: "Modern Clinical Analysis",
    features: [
      "Evidence-based skin condition identification",
      "Clinical treatment recommendations",
      "Product ingredient analysis",
      "Progress tracking with metrics",
    ],
    gradient: "from-primary/10 to-emerald/5",
    iconBg: "bg-primary/15",
  },
  {
    icon: Leaf,
    title: "Ayurvedic Mode",
    subtitle: "Traditional Holistic Healing",
    features: [
      "Dosha-based skin type analysis",
      "Herbal remedy suggestions",
      "Dietary & lifestyle tips",
      "Natural skincare routines",
    ],
    gradient: "from-accent/10 to-sage/10",
    iconBg: "bg-accent/15",
  },
];

const ModesSection = () => {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Two Powerful Modes
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Choose the approach that resonates with you — or use both
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {modes.map((mode, i) => (
            <motion.div
              key={mode.title}
              initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -8 }}
              className={`p-8 rounded-2xl bg-gradient-to-br ${mode.gradient} border border-border/50 cursor-default`}
            >
              <div className={`w-14 h-14 rounded-xl ${mode.iconBg} flex items-center justify-center mb-6`}>
                <mode.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-display font-bold text-foreground mb-1">{mode.title}</h3>
              <p className="text-muted-foreground mb-6">{mode.subtitle}</p>
              <ul className="space-y-3">
                {mode.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-foreground">
                    <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ModesSection;
