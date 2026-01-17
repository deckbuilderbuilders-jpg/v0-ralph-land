"use client"

import { motion } from "framer-motion"
import { Sparkles, Zap, Code, Rocket, ArrowRight, Github, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

const features = [
  {
    icon: Sparkles,
    title: "Describe Your Vision",
    description: "Simply tell us what you want to build in plain English. No technical knowledge required.",
  },
  {
    icon: Zap,
    title: "AI-Powered Generation",
    description: "Claude AI analyzes your requirements and generates production-ready Next.js code.",
  },
  {
    icon: Code,
    title: "Real Code, Not Templates",
    description: "Every app is custom-built for your specific needs with proper architecture.",
  },
  {
    icon: Rocket,
    title: "One-Click Deploy",
    description: "Push to GitHub and deploy to Vercel instantly. Go live in minutes.",
  },
]

const steps = [
  { step: 1, title: "Describe", time: "30 sec" },
  { step: 2, title: "Clarify", time: "2 min" },
  { step: 3, title: "Review PRD", time: "1 min" },
  { step: 4, title: "Estimate", time: "instant" },
  { step: 5, title: "Pay", time: "1 min" },
  { step: 6, title: "Build", time: "5-10 min" },
  { step: 7, title: "Deploy", time: "2 min" },
]

const exampleApps = [
  { name: "SaaS Dashboard", price: "$12", complexity: "Medium" },
  { name: "E-commerce Store", price: "$35", complexity: "Complex" },
  { name: "Blog Platform", price: "$8", complexity: "Simple" },
  { name: "Task Manager", price: "$15", complexity: "Medium" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold">Ralph Builder</span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">
                How it Works
              </a>
              <a href="#pricing" className="hover:text-foreground transition-colors">
                Pricing
              </a>
            </nav>
            <ThemeToggle />
            <Link href="/builder">
              <Button>Start Building</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
              <Sparkles className="h-4 w-4" />
              AI-Powered App Generation
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              Build Production Apps
              <br />
              <span className="text-primary">Without Writing Code</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
              Describe your app idea in plain English. Ralph uses Claude AI to generate complete, deployable Next.js
              applications in minutes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/builder">
                <Button size="lg" className="gap-2">
                  Start Building Free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline">
                  See How it Works
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16"
          >
            <div>
              <div className="text-3xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Apps Built</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">10min</div>
              <div className="text-sm text-muted-foreground">Avg Build Time</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary">$15</div>
              <div className="text-sm text-muted-foreground">Avg Cost</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Ralph Builder?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get production-ready code, not prototypes. Every app includes authentication, database integration, and
              deployment configuration.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">7 Steps to Your App</h2>
            <p className="text-muted-foreground">From idea to deployed app in under 15 minutes</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-border"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {step.step}
                </div>
                <div>
                  <div className="font-medium">{step.title}</div>
                  <div className="text-xs text-muted-foreground">{step.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pay Per Build</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              No subscriptions. Pay only for what you build. Price scales with app complexity.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {exampleApps.map((app, i) => (
              <motion.div
                key={app.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-primary mb-1">{app.price}</div>
                    <div className="font-medium mb-2">{app.name}</div>
                    <div className="text-xs text-muted-foreground">{app.complexity}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-4">
              Minimum $5 per build. Complex enterprise apps may cost $50+.
            </p>
            <Link href="/builder">
              <Button size="lg">Get Your Estimate</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Build Your App?</h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Join hundreds of entrepreneurs, developers, and businesses who have turned their ideas into reality with
                Ralph Builder.
              </p>
              <Link href="/builder">
                <Button size="lg" variant="secondary" className="gap-2">
                  Start Building <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-bold">Ralph Builder</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href="https://github.com" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground mt-8">
            Built with the Ralph Wiggum Technique and Claude AI
          </div>
        </div>
      </footer>
    </div>
  )
}
