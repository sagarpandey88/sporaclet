import Link from 'next/link';
import { Header } from '@/components/features/header/Header';
import { Button } from '@/components/ui/button';
import { TrendingUp, Calendar, BarChart3 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero section */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>AI-Powered Sports Predictions</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              Discover Sports Events
              <br />
              <span className="text-primary">with AI Insights</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Get comprehensive AI-powered predictions, head-to-head statistics, and detailed insights
              for upcoming sports events across Football, Basketball, Cricket, and Tennis.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/events/upcoming">
                <Button size="lg" className="min-h-[48px] px-8">
                  <Calendar className="mr-2 h-5 w-5" />
                  Browse Upcoming Events
                </Button>
              </Link>
              <Link href="/events/past">
                <Button size="lg" variant="outline" className="min-h-[48px] px-8">
                  <BarChart3 className="mr-2 h-5 w-5" />
                  View Past Events
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">AI Predictions</h3>
                <p className="text-muted-foreground">
                  Advanced machine learning models analyze team performance, injuries, and historical data
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Detailed Statistics</h3>
                <p className="text-muted-foreground">
                  Access comprehensive head-to-head records, team rosters, and injury reports
                </p>
              </div>

              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Multi-Sport Coverage</h3>
                <p className="text-muted-foreground">
                  Track events across Football, Basketball, Cricket, and Tennis
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Sporaclet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
