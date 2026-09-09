import { motion } from "framer-motion";
import { Heart, Globe, Users } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
              About <span className="text-primary">ArogyAI</span>
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              ArogyAI was born from a simple belief — that modern technology and ancient wisdom can work together to revolutionize skin health. Our team of dermatologists, Ayurvedic practitioners, and AI engineers built a platform that honors both traditions.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We're on a mission to make expert skin health guidance accessible to everyone, blending clinical precision with holistic care.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 gap-6"
          >
            {[
              { icon: Heart, label: "Built with Care", desc: "Every feature is designed with your well-being in mind." },
              { icon: Globe, label: "East Meets West", desc: "Bridging modern science with 5,000 years of Ayurvedic wisdom." },
              { icon: Users, label: "Community First", desc: "Trusted by thousands of users across the globe." },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-secondary/50"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground">{item.label}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
