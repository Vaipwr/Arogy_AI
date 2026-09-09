import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  { name: "Priya S.", initials: "PS", rating: 5, text: "ArogyAI's Ayurvedic mode transformed my skincare routine. The herbal recommendations actually worked for my sensitive skin!" },
  { name: "Rahul M.", initials: "RM", rating: 5, text: "The AI analysis was incredibly accurate. It identified a condition my previous dermatologist missed. Highly recommended." },
  { name: "Ananya K.", initials: "AK", rating: 4, text: "I love switching between both modes. The dashboard makes it so easy to track my progress over the past 3 months." },
  { name: "Vikram D.", initials: "VD", rating: 5, text: "Finally a platform that respects both modern science and traditional Ayurveda. The personalized plans are excellent." },
];

const TestimonialsSection = () => {
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
            Loved by Users
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            See what our community has to say
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl bg-card border border-border/50"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-foreground mb-4 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{t.initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground">{t.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
