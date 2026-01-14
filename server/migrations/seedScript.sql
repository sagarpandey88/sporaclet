-- Sample SQL script to insert events and predictions for the next 5 days (Jan 15-19, 2026)
-- This script creates fictional sports events across various sports and generates predictions for each.

-- Insert events for Jan 15, 2026
INSERT INTO public.events (
    "externalId", "eventName", date, status, venue, league, season, round, sport, "homeTeam", "awayTeam", description
) VALUES
(
    'evt-20260115-001',
    'Manchester United vs Liverpool',
    '2026-01-15 20:00:00',
    'upcoming',
    'Old Trafford',
    'Premier League',
    '2025-2026',
    'Round 20',
    '{"name": "Soccer", "category": "Football"}',
    '{"name": "Manchester United", "id": "mu"}',
    '{"name": "Liverpool", "id": "liv"}',
    'A highly anticipated match in the Premier League.'
),
(
    'evt-20260115-002',
    'Los Angeles Lakers vs Golden State Warriors',
    '2026-01-15 22:30:00',
    'upcoming',
    'Crypto.com Arena',
    'NBA',
    '2025-2026',
    'Regular Season',
    '{"name": "Basketball", "category": "NBA"}',
    '{"name": "Los Angeles Lakers", "id": "lal"}',
    '{"name": "Golden State Warriors", "id": "gsw"}',
    'NBA showdown between two historic rivals.'
);

-- Insert predictions for Jan 15 events
INSERT INTO public.predictions (
    "eventId", "probabilities", "predictedWinner", "confidence", "keyFactors", "modelVersion", "generatedAt"
) VALUES
(
    (SELECT id FROM public.events WHERE "externalId" = 'evt-20260115-001'),
    '{"home": 0.45, "away": 0.35, "draw": 0.20}',
    'home',
    'medium',
    '["Home advantage", "Recent form", "Player injuries"]',
    'v1.0',
    '2026-01-14 12:00:00'
),
(
    (SELECT id FROM public.events WHERE "externalId" = 'evt-20260115-002'),
    '{"home": 0.50, "away": 0.50}',
    'home',
    'low',
    '["Star player performance", "Team chemistry"]',
    'v1.0',
    '2026-01-14 12:00:00'
);

-- Insert events for Jan 16, 2026
INSERT INTO public.events (
    "externalId", "eventName", "date", "status", "venue", "league", "season", "round", "sport", "homeTeam", "awayTeam", "description"
) VALUES
(
    'evt-20260116-001',
    'Real Madrid vs Barcelona',
    '2026-01-16 21:00:00',
    'upcoming',
    'Santiago Bernabéu',
    'La Liga',
    '2025-2026',
    'Round 18',
    '{"name": "Soccer", "category": "Football"}',
    '{"name": "Real Madrid", "id": "rm"}',
    '{"name": "Barcelona", "id": "bar"}',
    'El Clásico: The biggest rivalry in Spanish football.'
),
(
    'evt-20260116-002',
    'New England Patriots vs Buffalo Bills',
    '2026-01-16 18:00:00',
    'upcoming',
    'Gillette Stadium',
    'NFL',
    '2025',
    'Week 18',
    '{"name": "American Football", "category": "NFL"}',
    '{"name": "New England Patriots", "id": "ne"}',
    '{"name": "Buffalo Bills", "id": "buf"}',
    'AFC East rivalry game.'
);

-- Insert predictions for Jan 16 events
INSERT INTO public.predictions (
    "eventId", "probabilities", "predictedWinner", "confidence", "keyFactors", "modelVersion", "generatedAt"
) VALUES
(
    (SELECT id FROM public.events WHERE "externalId" = 'evt-20260116-001'),
    '{"home": 0.40, "away": 0.40, "draw": 0.20}',
    'draw',
    'high',
    '["Historical data", "Defensive strength"]',
    'v1.0',
    '2026-01-14 12:00:00'
),
(
    (SELECT id FROM public.events WHERE "externalId" = 'evt-20260116-002'),
    '{"home": 0.55, "away": 0.45}',
    'home',
    'medium',
    '["Home field advantage", "Quarterback stats"]',
    'v1.0',
    '2026-01-14 12:00:00'
);

-- Insert events for Jan 17, 2026
INSERT INTO public.events (
    "externalId", "eventName", "date", "status", "venue", "league", "season", "round", "sport", "homeTeam", "awayTeam", "description"
) VALUES
(
    'evt-20260117-001',
    'Toronto Maple Leafs vs Montreal Canadiens',
    '2026-01-17 19:00:00',
    'upcoming',
    'Scotiabank Arena',
    'NHL',
    '2025-2026',
    'Regular Season',
    '{"name": "Ice Hockey", "category": "NHL"}',
    '{"name": "Toronto Maple Leafs", "id": "tor"}',
    '{"name": "Montreal Canadiens", "id": "mtl"}',
    'Classic NHL rivalry in Canada.'
);

-- Insert predictions for Jan 17 events
INSERT INTO public.predictions (
    "eventId", "probabilities", "predictedWinner", "confidence", "keyFactors", "modelVersion", "generatedAt"
) VALUES
(
    (SELECT id FROM public.events WHERE "externalId" = 'evt-20260117-001'),
    '{"home": 0.60, "away": 0.40}',
    'home',
    'high',
    '["Recent performance", "Goaltender stats"]',
    'v1.0',
    '2026-01-14 12:00:00'
);

-- Insert events for Jan 18, 2026
INSERT INTO public.events (
    "externalId", "eventName", "date", "status", "venue", "league", "season", "round", "sport", "homeTeam", "awayTeam", "description"
) VALUES
(
    'evt-20260118-001',
    'India vs Australia',
    '2026-01-18 09:30:00',
    'upcoming',
    'Melbourne Cricket Ground',
    'Test Cricket',
    '2025-2026',
    '2nd Test',
    '{"name": "Cricket", "category": "Test"}',
    '{"name": "Australia", "id": "aus"}',
    '{"name": "India", "id": "ind"}',
    'Second Test match in the series.'
);

-- Insert predictions for Jan 18 events
INSERT INTO public.predictions (
    "eventId", "probabilities", "predictedWinner", "confidence", "keyFactors", "modelVersion", "generatedAt"
) VALUES
(
    (SELECT id FROM public.events WHERE "externalId" = 'evt-20260118-001'),
    '{"home": 0.52, "away": 0.48}',
    'home',
    'medium',
    '["Pitch conditions", "Team composition"]',
    'v1.0',
    '2026-01-14 12:00:00'
);

-- Insert events for Jan 19, 2026
INSERT INTO public.events (
    "externalId", "eventName", "date", "status", "venue", "league", "season", "round", "sport", "homeTeam", "awayTeam", "description"
) VALUES
(
    'evt-20260119-001',
    'Serena Williams vs Naomi Osaka',
    '2026-01-19 14:00:00',
    'upcoming',
    'Arthur Ashe Stadium',
    'WTA',
    '2026',
    'Quarterfinals',
    '{"name": "Tennis", "category": "Singles"}',
    '{"name": "Serena Williams", "id": "sw"}',
    '{"name": "Naomi Osaka", "id": "no"}',
    'Tennis quarterfinal match.'
);

-- Insert predictions for Jan 19 events
INSERT INTO public.predictions (
    "eventId", "probabilities", "predictedWinner", "confidence", "keyFactors", "modelVersion", "generatedAt"
) VALUES
(
    (SELECT id FROM public.events WHERE "externalId" = 'evt-20260119-001'),
    '{"home": 0.65, "away": 0.35}',
    'home',
    'high',
    '["Experience", "Current ranking"]',
    'v1.0',
    '2026-01-14 12:00:00'
);

