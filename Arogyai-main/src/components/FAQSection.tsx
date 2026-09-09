import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "How accurate is the AI skin analysis?", a: "Our AI model has been trained on thousands of dermatological images and achieves high accuracy. However, it's designed to supplement — not replace — professional medical advice." },
  { q: "What's the difference between the two modes?", a: "Dermatology Mode uses modern clinical approaches with evidence-based treatments. Ayurvedic Mode analyzes your dosha type and suggests herbal remedies, dietary changes, and holistic routines." },
  { q: "Is my data private and secure?", a: "Absolutely. All images and health data are encrypted end-to-end. We never share your data with third parties and follow strict privacy standards." },
  { q: "Do I need to pay to use ArogyAI?", a: "We offer a free tier with basic analysis. Premium plans unlock advanced features like progress tracking, personalized plans, and unlimited consultations." },
  { q: "Can I use both modes for the same condition?", a: "Yes! Many users find value in combining both approaches. You can get a clinical perspective and an Ayurvedic one side by side." },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-border/50 rounded-xl px-6 bg-background">
                <AccordionTrigger className="text-left font-display font-semibold text-foreground hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
