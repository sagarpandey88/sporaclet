import { notFound } from 'next/navigation';
import { EventHeader } from '@/components/features/event-detail/EventHeader';
import { PredictionDetail } from '@/components/features/prediction-display/PredictionDetail';
import { HeadToHeadSection } from '@/components/features/head-to-head/HeadToHeadSection';
import { TeamRoster } from '@/components/features/team-roster/TeamRoster';
import { InjuryReport } from '@/components/features/injury-report/InjuryReport';
import { FieldVisualization } from '@/components/features/field-visualization/FieldVisualization';
import { CourtVisualization } from '@/components/features/field-visualization/CourtVisualization';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface EventDetailPageProps {
  params: {
    id: string;
  };
}

async function getEventDetail(id: string) {
  try {
    const res = await fetch(`${API_URL}/api/events/${id}`, {
      next: { revalidate: 900 }, // Revalidate every 15 minutes
    });

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch event: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching event detail:', error);
    throw error;
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const event = await getEventDetail(params.id);

  if (!event) {
    notFound();
  }

  const hasTeams = event.homeTeam && event.awayTeam;
  const isFootball = event.sport?.name === 'football';
  const isBasketball = event.sport?.name === 'basketball';

  // Extract data from snapshots
  const homeSnapshot = event.homeTeamSnapshot;
  const awaySnapshot = event.awayTeamSnapshot;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Event Header */}
        <EventHeader
          eventName={event.eventName || event.name}
          date={event.date || event.scheduledAt}
          venue={event.venue}
          league={event.league}
          status={event.status}
          sport={event.sport}
          homeTeam={event.homeTeam}
          awayTeam={event.awayTeam}
          participant1Name={event.participant1Name}
          participant2Name={event.participant2Name}
        />

        {/* Prediction Section */}
        {event.prediction && hasTeams && (
          <PredictionDetail
            prediction={{
              probabilities: event.prediction.probabilities || {
                home: 0,
                away: 0,
                draw: 0,
              },
              predictedWinner: event.prediction.predictedWinner,
              confidence: event.prediction.confidence,
              keyFactors: event.prediction.keyFactors || [],
              modelVersion: event.prediction.modelVersion,
              generatedAt: event.prediction.createdAt,
            }}
            homeTeam={{
              name: event.homeTeam.name,
              shortName: event.homeTeam.shortName,
            }}
            awayTeam={{
              name: event.awayTeam.name,
              shortName: event.awayTeam.shortName,
            }}
          />
        )}

        {/* Team Sports Layout */}
        {hasTeams && (
          <>
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Head-to-Head Stats */}
              <HeadToHeadSection
                homeTeam={{
                  id: event.homeTeam.id,
                  name: event.homeTeam.name,
                  shortName: event.homeTeam.shortName,
                }}
                awayTeam={{
                  id: event.awayTeam.id,
                  name: event.awayTeam.name,
                  shortName: event.awayTeam.shortName,
                }}
                headToHead={event.headToHead}
              />

              {/* Field/Court Visualization */}
              {isFootball && homeSnapshot && awaySnapshot && (
                <FieldVisualization
                  homeTeam={{
                    name: event.homeTeam.name,
                    shortName: event.homeTeam.shortName,
                    players: homeSnapshot.players || [],
                  }}
                  awayTeam={{
                    name: event.awayTeam.name,
                    shortName: event.awayTeam.shortName,
                    players: awaySnapshot.players || [],
                  }}
                />
              )}

              {isBasketball && (
                <CourtVisualization
                  homeTeam={{
                    name: event.homeTeam.name,
                    shortName: event.awayTeam.shortName,
                  }}
                  awayTeam={{
                    name: event.awayTeam.name,
                    shortName: event.awayTeam.shortName,
                  }}
                />
              )}
            </div>

            {/* Team Rosters */}
            {homeSnapshot && awaySnapshot && (
              <div className="grid gap-8 lg:grid-cols-2">
                <TeamRoster
                  team={{
                    name: event.homeTeam.name,
                    shortName: event.homeTeam.shortName,
                  }}
                  players={homeSnapshot.players || []}
                  isHome={true}
                />

                <TeamRoster
                  team={{
                    name: event.awayTeam.name,
                    shortName: event.awayTeam.shortName,
                  }}
                  players={awaySnapshot.players || []}
                  isHome={false}
                />
              </div>
            )}

            {/* Injury Reports */}
            {(homeSnapshot?.injuries || awaySnapshot?.injuries) && (
              <div className="grid gap-8 lg:grid-cols-2">
                {homeSnapshot?.injuries && (
                  <InjuryReport
                    team={{
                      name: event.homeTeam.name,
                      shortName: event.homeTeam.shortName,
                    }}
                    injuries={homeSnapshot.injuries}
                  />
                )}

                {awaySnapshot?.injuries && (
                  <InjuryReport
                    team={{
                      name: event.awayTeam.name,
                      shortName: event.awayTeam.shortName,
                    }}
                    injuries={awaySnapshot.injuries}
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* Individual Sports Layout */}
        {!hasTeams && (
          <div className="rounded-lg border bg-card p-8 text-center">
            <h2 className="text-2xl font-bold mb-2">
              {event.participant1Name} vs {event.participant2Name}
            </h2>
            <p className="text-muted-foreground">
              Detailed statistics for individual sports coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Generate static params for known events (optional, for static generation)
export async function generateStaticParams() {
  // This would typically fetch a list of event IDs
  // For now, return empty array to use dynamic rendering
  return [];
}

// Metadata
export async function generateMetadata({ params }: EventDetailPageProps) {
  const event = await getEventDetail(params.id);

  if (!event) {
    return {
      title: 'Event Not Found',
    };
  }

  const title = event.homeTeam && event.awayTeam
    ? `${event.homeTeam.name} vs ${event.awayTeam.name}`
    : event.eventName || 'Event Details';

  return {
    title: `${title} - Sporaclet`,
    description: `View AI predictions and detailed statistics for ${title}`,
  };
}
