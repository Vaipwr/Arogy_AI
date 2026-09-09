import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Sparkles, Leaf, Activity, Calendar, ShieldCheck, ArrowRight, User, LogIn, CheckCircle2 } from 'lucide-react';

interface WelcomeScreenProps {
  onSignup: () => void;
  onLogin: () => void;
  hasProfile: boolean;
}

export function WelcomeScreen({ onSignup, onLogin }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">

      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Arogyai
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={onLogin} className="text-slate-600 hover:text-emerald-600 font-medium">
              <LogIn className="w-4 h-4 mr-2" />
              Login
            </Button>
            <Button onClick={onSignup} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-md shadow-emerald-500/20">
              <User className="w-4 h-4 mr-2" />
              Sign Up
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            {/* Hero Text */}
            <div className="flex-1 max-w-2xl text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-8 border border-emerald-100">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Dermatologist
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight text-slate-900">
                Radiant Skin, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  Powered by AI
                </span>
              </h1>

              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Experience the perfect fusion of modern dermatology and Ayurvedic wisdom. Get a personalized skincare analysis and routine in seconds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Button
                  onClick={onSignup}
                  size="lg"
                  className="h-14 px-8 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg shadow-emerald-500/30"
                >
                  Start Free Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  onClick={onLogin}
                  variant="outline"
                  size="lg"
                  className="h-14 px-8 text-lg border-2 border-slate-200 rounded-full text-slate-700 hover:bg-slate-50"
                >
                  I have an account
                </Button>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>98% Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Dermatologist Approved</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Privacy First</span>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 w-full relative">
              <div className="absolute top-10 right-10 w-64 h-64 bg-emerald-200/50 rounded-full blur-3xl -z-10"></div>
              <div className="absolute bottom-10 left-10 w-64 h-64 bg-teal-200/50 rounded-full blur-3xl -z-10"></div>

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] lg:aspect-square max-w-lg mx-auto">
                <img
                  src="https://images.unsplash.com/photo-1596462502278-27bfdd403cc2?auto=format&fit=crop&q=80&w=800"
                  alt="Glowing skin portrait"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase mb-2">Capabilities</h2>
            <p className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Why Choose Arogyai?</p>
            <p className="text-lg text-slate-600">
              We combine advanced computer vision with holistic care to give you the most comprehensive skin health platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Activity className="w-6 h-6 text-white" />}
              iconBg="bg-blue-500"
              title="AI Analysis"
              description="Instant clinical-grade analysis of skin conditions using our proprietary computer vision models."
              image="https://images.unsplash.com/photo-1551816230-ef5deaed4a26?auto=format&fit=crop&q=80&w=600"
            />
            <FeatureCard
              icon={<Leaf className="w-6 h-6 text-white" />}
              iconBg="bg-emerald-500"
              title="Ayurvedic Care"
              description="Natural, time-tested remedies tailored to your specific skin type and dosha profile."
              image="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600"
            />
            <FeatureCard
              icon={<Calendar className="w-6 h-6 text-white" />}
              iconBg="bg-purple-500"
              title="Daily Routines"
              description="Smart schedules and reminders to help you build and maintain healthy skincare habits."
              image="https://images.unsplash.com/photo-1512290923902-8a9281ec9363?auto=format&fit=crop&q=80&w=600"
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 order-2 lg:order-1 relative w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-video lg:aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
                  alt="Clinical care"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Stats Card */}
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl border border-slate-100 hidden lg:block">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-full">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-slate-900">50k+</p>
                    <p className="text-sm text-slate-500 font-medium">Scans Analyzed</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 order-1 lg:order-2">
              <h2 className="text-base text-emerald-600 font-semibold tracking-wide uppercase mb-2">Our Mission</h2>
              <div className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Bridging Science <br /> & Nature
              </div>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                Arogyai was born from a simple question: Why choose between modern dermatological science and holistic natural care when you can have both?
              </p>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                We are democratizing expert skin care. By leveraging artificial intelligence, we make professional-grade skin analysis accessible to everyone, everywhere.
              </p>

              <Button variant="link" className="text-emerald-600 hover:text-emerald-700 p-0 h-auto font-semibold text-lg">
                Read our story <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Arogyai</span>
            </div>

            <div className="text-slate-500 text-sm">
              © 2024 Arogyai Skin Health. All rights reserved.
            </div>

            <div className="flex space-x-6 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-emerald-600 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, iconBg, title, description, image }: { icon: React.ReactNode, iconBg: string, title: string, description: string, image: string }) {
  return (
    <Card className="overflow-hidden rounded-2xl border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group bg-white flex flex-col h-full">
      <div className="h-48 overflow-hidden relative">
        <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10" />
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className={`absolute top-4 right-4 w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center shadow-lg z-20`}>
          {icon}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-3 text-slate-900">{title}</h3>
        <p className="text-slate-600 leading-relaxed text-sm mb-4 flex-grow">
          {description}
        </p>
        <div className="flex items-center text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 mt-auto">
          Learn more <ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </div>
    </Card>
  );
}