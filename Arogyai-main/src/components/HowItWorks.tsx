import { motion } from "framer-motion";
import { Upload, Brain, ClipboardList } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Image",
    description: "Take a photo of the skin area you'd like analyzed and upload it securely.",
  },
  {
    icon: Brain,
    title: "AI Analyzes",
    description: "Our AI engine processes your image using advanced dermatological and Ayurvedic models.",
  },
  {
    icon: ClipboardList,
    title: "Get Your Plan",
    description: "Receive a personalized treatment plan with recommendations tailored to your needs.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Three simple steps to healthier skin
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="relative text-center group"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <step.icon className="w-9 h-9 text-primary" />
              </div>
              <div className="absolute top-10 left-[60%] w-[calc(100%-20px)] h-[2px] bg-border hidden md:block last:hidden" />
              <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground">{step.description}</p>

              <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                {i + 1}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
