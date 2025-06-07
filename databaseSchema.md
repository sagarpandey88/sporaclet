# Database Schema for Predicto


## Sports Table
| Column  | Type   | Constraints              |
|---------|--------|--------------------------|
| id      | serial | Primary Key              |
| name    | text   | Not Null                 |
| icon    | text   | Not Null                 |
| color   | text   | Not Null                 |

## Teams Table
| Column  | Type   | Constraints              |
|---------|--------|--------------------------|
| id      | serial | Primary Key              |
| name    | text   | Not Null                 |
| logo    | text   |                          |
| sportId | integer| Not Null, Foreign Key    |

## Events Table
| Column                 | Type     | Constraints                     |
|-----------------------|----------|---------------------------------|
| id                    | serial   | Primary Key                     |
| title                 | text     | Not Null                        |
| sportId               | integer  | Not Null, Foreign Key           |
| dateTime              | timestamp| Not Null                        |
| venue                 | text     | Not Null                        |
| team1Id               | integer  | Not Null, Foreign Key           |
| team2Id               | integer  | Not Null, Foreign Key           |
| predictionTeam1       | integer  | Not Null                        |
| predictionTeam2       | integer  | Not Null                        |
| predictionDraw        | integer  |                                |
| featured              | boolean  | Default false                   |
| status                | text     | Default 'upcoming'              |
| matchesPlayed         | text     |                                |
| headToHead            | text     |                                |
| lastMeeting           | text     |                                |
| weatherFavorableTeam  | text     |                                |
| pitchFavorableTeam    | text     |                                |
| details               | json     | Default '{}'                    |

## Relationships
- `Sports` is linked to multiple `Teams`.
- Each `Team` can participate in multiple `Events`.
- Each `Event` involves two `Teams` and references the `Sport`.

## Important Notes
- Ensure all foreign key relationships are correctly established for integrity.
- Use appropriate indexing for optimization based on query patterns.