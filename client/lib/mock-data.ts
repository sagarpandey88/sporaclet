export const mockEvents = [
  {
    id: '1',
    sportType: 'Football',
    eventDate: new Date('2025-01-20T15:30:00Z'),
    venue: 'Wembley Stadium',
    teamsInvolved: {
      home: { name: 'Arsenal FC', logo: '/api/placeholder/40/40', form: 'WWDWL' },
      away: { name: 'Chelsea FC', logo: '/api/placeholder/40/40', form: 'LWWWD' }
    },
    weatherConditions: {
      temperature: 12,
      humidity: 78,
      windSpeed: 15,
      condition: 'Partly Cloudy'
    },
    historicalData: {
      headToHead: { home: 45, away: 32, draws: 23 },
      lastMeeting: { date: '2024-10-15', result: 'Arsenal 2-1 Chelsea' }
    },
    league: 'Premier League',
    tournament: null,
    status: 'upcoming',
    createdAt: new Date(),
    updatedAt: new Date(),
    dreamXI: {
      formation: '4-3-3',
      players: [
        {
          position: 'GK',
          name: 'David Raya',
          team: 'Arsenal FC',
          fantasyPoints: 8.5,
          recentForm: 'WWWDW',
          keyStats: { cleanSheets: 12, saves: 89, rating: 7.8 },
          reason: 'Superior shot-stopping ability and distribution. Leading clean sheet record this season.'
        },
        {
          position: 'RB',
          name: 'Reece James',
          team: 'Chelsea FC',
          fantasyPoints: 7.2,
          recentForm: 'WLWWD',
          keyStats: { assists: 8, crosses: 156, rating: 7.5 },
          reason: 'Exceptional attacking threat from right-back with consistent crossing ability.'
        },
        {
          position: 'CB',
          name: 'William Saliba',
          team: 'Arsenal FC',
          fantasyPoints: 6.8,
          recentForm: 'WWWDL',
          keyStats: { tackles: 67, aerialWins: 78, rating: 7.9 },
          reason: 'Rock-solid defender with excellent aerial presence and ball-playing skills.'
        },
        {
          position: 'CB',
          name: 'Thiago Silva',
          team: 'Chelsea FC',
          fantasyPoints: 6.5,
          recentForm: 'LWWWD',
          keyStats: { interceptions: 45, passAccuracy: 92, rating: 7.6 },
          reason: 'Veteran leadership and exceptional reading of the game. Crucial in big matches.'
        },
        {
          position: 'LB',
          name: 'Oleksandr Zinchenko',
          team: 'Arsenal FC',
          fantasyPoints: 6.9,
          recentForm: 'WDWWL',
          keyStats: { assists: 6, keyPasses: 89, rating: 7.4 },
          reason: 'Versatile full-back who provides width and creativity in the final third.'
        },
        {
          position: 'CM',
          name: 'Declan Rice',
          team: 'Arsenal FC',
          fantasyPoints: 8.1,
          recentForm: 'WWDWL',
          keyStats: { tackles: 78, passAccuracy: 88, rating: 8.2 },
          reason: 'Dominant midfielder with exceptional work rate and leadership qualities.'
        },
        {
          position: 'CM',
          name: 'Enzo Fernández',
          team: 'Chelsea FC',
          fantasyPoints: 7.8,
          recentForm: 'LWWWD',
          keyStats: { keyPasses: 112, goals: 5, rating: 7.7 },
          reason: 'Creative playmaker with excellent vision and ability to control tempo.'
        },
        {
          position: 'CM',
          name: 'Martin Ødegaard',
          team: 'Arsenal FC',
          fantasyPoints: 9.2,
          recentForm: 'WWWDW',
          keyStats: { assists: 11, keyPasses: 134, rating: 8.5 },
          reason: 'Arsenal captain with exceptional creativity and leadership in crucial moments.'
        },
        {
          position: 'RW',
          name: 'Bukayo Saka',
          team: 'Arsenal FC',
          fantasyPoints: 9.8,
          recentForm: 'WWDWL',
          keyStats: { goals: 14, assists: 9, rating: 8.7 },
          reason: 'Consistent goal threat with pace and direct running. Key player in big games.'
        },
        {
          position: 'ST',
          name: 'Kai Havertz',
          team: 'Arsenal FC',
          fantasyPoints: 8.9,
          recentForm: 'WDWWL',
          keyStats: { goals: 12, assists: 6, rating: 8.1 },
          reason: 'Versatile forward with excellent movement and finishing in the box.'
        },
        {
          position: 'LW',
          name: 'Raheem Sterling',
          team: 'Chelsea FC',
          fantasyPoints: 8.4,
          recentForm: 'LWWWD',
          keyStats: { goals: 9, assists: 7, rating: 7.9 },
          reason: 'Experienced winger with pace and ability to create chances from wide positions.'
        }
      ],
      substitutes: [
        {
          position: 'CB',
          name: 'Gabriel Magalhães',
          team: 'Arsenal FC',
          fantasyPoints: 6.7,
          reason: 'Solid defensive alternative with strong aerial ability.'
        },
        {
          position: 'CM',
          name: 'Moisés Caicedo',
          team: 'Chelsea FC',
          fantasyPoints: 7.5,
          reason: 'Dynamic midfielder with excellent pressing and ball-winning skills.'
        },
        {
          position: 'ST',
          name: 'Nicolas Jackson',
          team: 'Chelsea FC',
          fantasyPoints: 7.9,
          reason: 'Pace and movement in the final third, good finishing ability.'
        }
      ],
      totalFantasyValue: 92.1,
      averageRating: 7.9
    },
    predictions: [
      {
        id: 'p1',
        eventId: '1',
        predictionDetails: {
          winner: 'Arsenal FC',
          score: '2-1',
          goals: { over2_5: true, btts: true }
        },
        confidenceScore: 78.5,
        factorsConsidered: {
          homeAdvantage: 15,
          currentForm: 25,
          headToHead: 20,
          playerInjuries: -5,
          weather: 3
        },
        outcome: null,
        accuracy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    id: '2',
    sportType: 'Basketball',
    eventDate: new Date('2025-01-21T20:00:00Z'),
    venue: 'Madison Square Garden',
    teamsInvolved: {
      home: { name: 'New York Knicks', logo: '/api/placeholder/40/40', form: 'WLWWL' },
      away: { name: 'Boston Celtics', logo: '/api/placeholder/40/40', form: 'WWWLW' }
    },
    weatherConditions: null,
    historicalData: {
      headToHead: { home: 38, away: 42, draws: 0 },
      lastMeeting: { date: '2024-12-10', result: 'Celtics 118-112 Knicks' }
    },
    league: 'NBA',
    tournament: null,
    status: 'upcoming',
    createdAt: new Date(),
    updatedAt: new Date(),
    dreamXI: {
      formation: 'Starting 5',
      players: [
        {
          position: 'PG',
          name: 'Jalen Brunson',
          team: 'New York Knicks',
          fantasyPoints: 45.2,
          recentForm: 'WLWWL',
          keyStats: { points: 28.5, assists: 6.8, rating: 8.9 },
          reason: 'Elite playmaker with clutch scoring ability and excellent court vision.'
        },
        {
          position: 'SG',
          name: 'Jaylen Brown',
          team: 'Boston Celtics',
          fantasyPoints: 42.8,
          recentForm: 'WWWLW',
          keyStats: { points: 25.1, rebounds: 6.2, rating: 8.5 },
          reason: 'Two-way star with explosive scoring and improved defensive consistency.'
        },
        {
          position: 'SF',
          name: 'Jayson Tatum',
          team: 'Boston Celtics',
          fantasyPoints: 48.9,
          recentForm: 'WWWLW',
          keyStats: { points: 29.8, rebounds: 8.1, rating: 9.2 },
          reason: 'Superstar forward with elite scoring from all levels and clutch gene.'
        },
        {
          position: 'PF',
          name: 'Julius Randle',
          team: 'New York Knicks',
          fantasyPoints: 41.5,
          recentForm: 'WLWWL',
          keyStats: { points: 22.4, rebounds: 10.2, rating: 8.3 },
          reason: 'Versatile big man with strong rebounding and improved three-point shooting.'
        },
        {
          position: 'C',
          name: 'Kristaps Porziņģis',
          team: 'Boston Celtics',
          fantasyPoints: 38.7,
          recentForm: 'WWLWW',
          keyStats: { points: 19.8, blocks: 1.8, rating: 8.1 },
          reason: 'Unique skill set combining size, shooting range, and rim protection.'
        }
      ],
      substitutes: [
        {
          position: 'G',
          name: 'Derrick White',
          team: 'Boston Celtics',
          fantasyPoints: 32.4,
          reason: 'Reliable two-way guard with excellent three-point shooting and defense.'
        },
        {
          position: 'F',
          name: 'OG Anunoby',
          team: 'New York Knicks',
          fantasyPoints: 35.1,
          reason: 'Elite defender with improved offensive consistency and versatility.'
        },
        {
          position: 'C',
          name: 'Mitchell Robinson',
          team: 'New York Knicks',
          fantasyPoints: 28.9,
          reason: 'Dominant rim protector with excellent rebounding and athleticism.'
        }
      ],
      totalFantasyValue: 217.1,
      averageRating: 8.6
    },
    predictions: [
      {
        id: 'p2',
        eventId: '2',
        predictionDetails: {
          winner: 'Boston Celtics',
          totalPoints: 225,
          spread: 'Celtics -4.5'
        },
        confidenceScore: 82.3,
        factorsConsidered: {
          awayForm: 30,
          headToHead: 15,
          playerStats: 25,
          restDays: 10,
          venue: -8
        },
        outcome: null,
        accuracy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    id: '3',
    sportType: 'Tennis',
    eventDate: new Date('2025-01-22T10:00:00Z'),
    venue: 'Rod Laver Arena',
    teamsInvolved: {
      player1: { name: 'Novak Djokovic', ranking: 1, country: 'Serbia' },
      player2: { name: 'Carlos Alcaraz', ranking: 2, country: 'Spain' }
    },
    weatherConditions: {
      temperature: 28,
      humidity: 45,
      windSpeed: 8,
      condition: 'Sunny'
    },
    historicalData: {
      headToHead: { player1: 3, player2: 2 },
      lastMeeting: { date: '2024-11-20', result: 'Djokovic def. Alcaraz 6-4, 7-6' }
    },
    league: null,
    tournament: 'Australian Open',
    status: 'upcoming',
    createdAt: new Date(),
    updatedAt: new Date(),
    dreamXI: {
      formation: 'Singles Match',
      players: [
        {
          position: 'Player',
          name: 'Novak Djokovic',
          team: 'Serbia',
          fantasyPoints: 95.8,
          recentForm: 'WWWWW',
          keyStats: { aces: 12.3, firstServe: 68, rating: 9.5 },
          reason: 'Unmatched mental toughness and experience in Grand Slam finals. Exceptional return game.'
        }
      ],
      substitutes: [
        {
          position: 'Alt Player',
          name: 'Carlos Alcaraz',
          team: 'Spain',
          fantasyPoints: 92.1,
          reason: 'Dynamic young talent with explosive power and court coverage. Rising star.'
        }
      ],
      totalFantasyValue: 95.8,
      averageRating: 9.5,
      note: 'Tennis is an individual sport - Dream XI concept adapted to show preferred player selection based on current form and conditions.'
    },
    predictions: [
      {
        id: 'p3',
        eventId: '3',
        predictionDetails: {
          winner: 'Novak Djokovic',
          sets: '3-1',
          totalGames: 'Over 38.5'
        },
        confidenceScore: 71.8,
        factorsConsidered: {
          experience: 25,
          currentForm: 20,
          surface: 15,
          headToHead: 10,
          weather: 5
        },
        outcome: null,
        accuracy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    id: '4',
    sportType: 'Baseball',
    eventDate: new Date('2025-01-23T19:30:00Z'),
    venue: 'Yankee Stadium',
    teamsInvolved: {
      home: { name: 'New York Yankees', logo: '/api/placeholder/40/40', form: 'WWLWW' },
      away: { name: 'Boston Red Sox', logo: '/api/placeholder/40/40', form: 'LWWLW' }
    },
    weatherConditions: {
      temperature: 22,
      humidity: 65,
      windSpeed: 12,
      condition: 'Clear'
    },
    historicalData: {
      headToHead: { home: 1278, away: 1023, draws: 0 },
      lastMeeting: { date: '2024-09-15', result: 'Yankees 8-3 Red Sox' }
    },
    league: 'MLB',
    tournament: null,
    status: 'upcoming',
    createdAt: new Date(),
    updatedAt: new Date(),
    dreamXI: {
      formation: 'Starting 9',
      players: [
        {
          position: 'C',
          name: 'Austin Wells',
          team: 'New York Yankees',
          fantasyPoints: 32.4,
          recentForm: 'WWLWW',
          keyStats: { avg: 0.285, hr: 18, rbi: 55, rating: 7.8 },
          reason: 'Strong defensive catcher with improving offensive production and game-calling ability.'
        },
        {
          position: '1B',
          name: 'Anthony Rizzo',
          team: 'New York Yankees',
          fantasyPoints: 38.7,
          recentForm: 'WWLWW',
          keyStats: { avg: 0.275, hr: 24, rbi: 78, rating: 8.1 },
          reason: 'Veteran presence with consistent power and excellent defensive skills at first base.'
        },
        {
          position: '2B',
          name: 'Gleyber Torres',
          team: 'New York Yankees',
          fantasyPoints: 35.2,
          recentForm: 'WLWWW',
          keyStats: { avg: 0.292, hr: 15, rbi: 63, rating: 7.9 },
          reason: 'Versatile infielder with good contact hitting and clutch performance in big games.'
        },
        {
          position: '3B',
          name: 'Rafael Devers',
          team: 'Boston Red Sox',
          fantasyPoints: 42.8,
          recentForm: 'LWWLW',
          keyStats: { avg: 0.295, hr: 28, rbi: 89, rating: 8.5 },
          reason: 'Elite power hitter with excellent plate discipline and consistent production.'
        },
        {
          position: 'SS',
          name: 'Anthony Volpe',
          team: 'New York Yankees',
          fantasyPoints: 34.6,
          recentForm: 'WWLWW',
          keyStats: { avg: 0.268, sb: 24, rbi: 52, rating: 7.7 },
          reason: 'Dynamic young shortstop with speed and improving offensive skills.'
        },
        {
          position: 'LF',
          name: 'Alex Verdugo',
          team: 'New York Yankees',
          fantasyPoints: 31.9,
          recentForm: 'WLWWW',
          keyStats: { avg: 0.281, hr: 12, rbi: 58, rating: 7.6 },
          reason: 'Solid contact hitter with good defensive instincts and clutch hitting ability.'
        },
        {
          position: 'CF',
          name: 'Jarren Duran',
          team: 'Boston Red Sox',
          fantasyPoints: 39.5,
          recentForm: 'LWWLW',
          keyStats: { avg: 0.295, sb: 34, hr: 14, rating: 8.2 },
          reason: 'Exceptional speed and defensive range with emerging power and contact skills.'
        },
        {
          position: 'RF',
          name: 'Juan Soto',
          team: 'New York Yankees',
          fantasyPoints: 48.9,
          recentForm: 'WWWLW',
          keyStats: { avg: 0.315, hr: 35, rbi: 95, rating: 9.1 },
          reason: 'Elite hitter with exceptional plate discipline and game-changing power.'
        },
        {
          position: 'DH',
          name: 'Giancarlo Stanton',
          team: 'New York Yankees',
          fantasyPoints: 36.8,
          recentForm: 'WLWWW',
          keyStats: { avg: 0.265, hr: 27, rbi: 72, rating: 7.9 },
          reason: 'Proven power threat with experience in clutch situations and playoff performance.'
        }
      ],
      substitutes: [
        {
          position: 'IF',
          name: 'Trevor Story',
          team: 'Boston Red Sox',
          fantasyPoints: 28.4,
          reason: 'Versatile infielder with power potential and defensive flexibility.'
        },
        {
          position: 'OF',
          name: 'Ceddanne Rafaela',
          team: 'Boston Red Sox',
          fantasyPoints: 26.7,
          reason: 'Young talent with speed and defensive versatility across multiple positions.'
        },
        {
          position: 'C',
          name: 'Connor Wong',
          team: 'Boston Red Sox',
          fantasyPoints: 24.1,
          reason: 'Solid backup catcher with improving offensive production.'
        }
      ],
      totalFantasyValue: 330.8,
      averageRating: 8.1
    },
    predictions: [
      {
        id: 'p4',
        eventId: '4',
        predictionDetails: {
          winner: 'New York Yankees',
          totalRuns: 'Over 9.5',
          spread: 'Yankees -1.5'
        },
        confidenceScore: 76.2,
        factorsConsidered: {
          homeAdvantage: 20,
          offensivePower: 25,
          pitchingMatchup: 15,
          weather: 8,
          rivalry: 12
        },
        outcome: null,
        accuracy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  },
  {
    id: '5',
    sportType: 'American Football',
    eventDate: new Date('2025-01-24T18:00:00Z'),
    venue: 'Lambeau Field',
    teamsInvolved: {
      home: { name: 'Green Bay Packers', logo: '/api/placeholder/40/40', form: 'WWWLW' },
      away: { name: 'Chicago Bears', logo: '/api/placeholder/40/40', form: 'LWLWL' }
    },
    weatherConditions: {
      temperature: -2,
      humidity: 82,
      windSpeed: 18,
      condition: 'Snow'
    },
    historicalData: {
      headToHead: { home: 105, away: 95, draws: 6 },
      lastMeeting: { date: '2024-12-08', result: 'Packers 28-19 Bears' }
    },
    league: 'NFL',
    tournament: null,
    status: 'upcoming',
    createdAt: new Date(),
    updatedAt: new Date(),
    dreamXI: {
      formation: 'Offense/Defense',
      players: [
        {
          position: 'QB',
          name: 'Jordan Love',
          team: 'Green Bay Packers',
          fantasyPoints: 24.8,
          recentForm: 'WWWLW',
          keyStats: { yards: 3498, td: 28, int: 11, rating: 8.4 },
          reason: 'Emerging quarterback with strong arm and improving decision-making in cold weather.'
        },
        {
          position: 'RB',
          name: 'Josh Jacobs',
          team: 'Green Bay Packers',
          fantasyPoints: 22.6,
          recentForm: 'WWWLW',
          keyStats: { yards: 1329, td: 14, avg: 4.8, rating: 8.2 },
          reason: 'Powerful runner with excellent vision and ability to perform in tough conditions.'
        },
        {
          position: 'WR',
          name: 'Jayden Reed',
          team: 'Green Bay Packers',
          fantasyPoints: 18.9,
          recentForm: 'WWLWW',
          keyStats: { rec: 78, yards: 1098, td: 8, rating: 7.9 },
          reason: 'Versatile receiver with excellent route-running and reliable hands in all weather.'
        },
        {
          position: 'WR',
          name: 'DJ Moore',
          team: 'Chicago Bears',
          fantasyPoints: 19.7,
          recentForm: 'LWLWL',
          keyStats: { rec: 85, yards: 1364, td: 8, rating: 8.1 },
          reason: 'Elite receiver with exceptional separation ability and consistent production.'
        },
        {
          position: 'TE',
          name: 'Tucker Kraft',
          team: 'Green Bay Packers',
          fantasyPoints: 14.2,
          recentForm: 'WWWLW',
          keyStats: { rec: 45, yards: 618, td: 6, rating: 7.5 },
          reason: 'Reliable target with good blocking ability and red zone presence.'
        },
        {
          position: 'OL',
          name: 'David Bakhtiari',
          team: 'Green Bay Packers',
          fantasyPoints: 12.8,
          recentForm: 'WWWLW',
          keyStats: { pressures: 18, penalties: 4, rating: 7.8 },
          reason: 'Elite left tackle with excellent pass protection and run blocking skills.'
        },
        {
          position: 'DL',
          name: 'Rashan Gary',
          team: 'Green Bay Packers',
          fantasyPoints: 16.4,
          recentForm: 'WWWLW',
          keyStats: { sacks: 9.5, tackles: 52, rating: 8.0 },
          reason: 'Disruptive pass rusher with excellent athleticism and motor.'
        },
        {
          position: 'LB',
          name: 'Quay Walker',
          team: 'Green Bay Packers',
          fantasyPoints: 15.1,
          recentForm: 'WWWLW',
          keyStats: { tackles: 118, int: 2, rating: 7.7 },
          reason: 'Athletic linebacker with good coverage skills and run-stopping ability.'
        },
        {
          position: 'CB',
          name: 'Jaire Alexander',
          team: 'Green Bay Packers',
          fantasyPoints: 17.3,
          recentForm: 'WWLWW',
          keyStats: { int: 4, pbu: 12, rating: 8.3 },
          reason: 'Elite cornerback with exceptional coverage skills and ball-hawking ability.'
        },
        {
          position: 'S',
          name: 'Xavier McKinney',
          team: 'Green Bay Packers',
          fantasyPoints: 18.6,
          recentForm: 'WWWLW',
          keyStats: { int: 8, tackles: 89, rating: 8.5 },
          reason: 'Versatile safety with excellent instincts and playmaking ability.'
        },
        {
          position: 'K',
          name: 'Brandon McManus',
          team: 'Green Bay Packers',
          fantasyPoints: 9.2,
          recentForm: 'WWWLW',
          keyStats: { fg: 24, xp: 32, rating: 7.4 },
          reason: 'Reliable kicker with strong leg and experience in cold weather conditions.'
        }
      ],
      substitutes: [
        {
          position: 'RB',
          name: 'DAndre Swift',
          team: 'Chicago Bears',
          fantasyPoints: 16.8,
          reason: 'Versatile back with good receiving skills and breakaway speed.'
        },
        {
          position: 'WR',
          name: 'Rome Odunze',
          team: 'Chicago Bears',
          fantasyPoints: 14.5,
          reason: 'Promising rookie receiver with good size and route-running ability.'
        },
        {
          position: 'LB',
          name: 'TJ Edwards',
          team: 'Chicago Bears',
          fantasyPoints: 13.7,
          reason: 'Solid linebacker with good instincts and tackling ability.'
        }
      ],
      totalFantasyValue: 189.6,
      averageRating: 7.9
    },
    predictions: [
      {
        id: 'p5',
        eventId: '5',
        predictionDetails: {
          winner: 'Green Bay Packers',
          totalPoints: 'Under 42.5',
          spread: 'Packers -7.5'
        },
        confidenceScore: 81.4,
        factorsConsidered: {
          homeAdvantage: 25,
          weather: 20,
          rivalry: 15,
          currentForm: 18,
          injuries: -3
        },
        outcome: null,
        accuracy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]
  }
];

export const sportTypes = [
  { value: 'all', label: 'All Sports', icon: '🏆' },
  { value: 'football', label: 'Football', icon: '⚽' },
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'tennis', label: 'Tennis', icon: '🎾' },
  { value: 'baseball', label: 'Baseball', icon: '⚾' },
  { value: 'american-football', label: 'American Football', icon: '🏈' },
  { value: 'hockey', label: 'Hockey', icon: '🏒' }
];