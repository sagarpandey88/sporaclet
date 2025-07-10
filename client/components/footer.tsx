'use client';

import Link from 'next/link';
import { TrendingUp, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <TrendingUp className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg">SportsPro</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Advanced sports prediction platform powered by AI analytics, weather data, 
              and historical statistics. Get accurate predictions across multiple sports.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@sportspro.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>New York, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Company</h3>
            <nav className="space-y-3">
              <Link 
                href="/about" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About Us
              </Link>
              <Link 
                href="/privacy" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                href="/contact" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact Us
              </Link>
            </nav>
          </div>

          {/* Sports Categories */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Sports</h3>
            <nav className="space-y-3">
              <Link 
                href="/events?sport=football" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Football
              </Link>
              <Link 
                href="/events?sport=basketball" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Basketball
              </Link>
              <Link 
                href="/events?sport=tennis" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Tennis
              </Link>
              <Link 
                href="/events?sport=baseball" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Baseball
              </Link>
              <Link 
                href="/events?sport=american-football" 
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                American Football
              </Link>
            </nav>
          </div>

          {/* Social Media & Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Connect</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Link 
                  href="https://facebook.com/sportspro" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </Link>
                <Link 
                  href="https://twitter.com/sportspro" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Follow us on Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </Link>
                <Link 
                  href="https://instagram.com/sportspro" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </Link>
                <Link 
                  href="https://linkedin.com/company/sportspro" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
                  aria-label="Follow us on LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </Link>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Stay updated with the latest predictions and sports insights.
                </p>
                <div className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-3">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SportsPro. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/sitemap" className="hover:text-foreground transition-colors">
                Sitemap
              </Link>
              <Link href="/cookies" className="hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
              <Link href="/accessibility" className="hover:text-foreground transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}