# Copilot Instructions for Predicto

## Project Summary
Predicto is a web application designed to provide predictions on sports events by analyzing historical data, player statistics, and various other factors. The application aims to give users insights into upcoming matches, including team forms, recent performance, and predictions.

## Schema Details
The application relies on a central `Event` type which includes the following fields:
- `team1`: Object containing details about the first team (name, logo, form).
- `team2`: Object containing details about the second team (name, logo, form).
- `sportName`: The name of the sport (e.g., Football, Basketball).
- `formattedDate`: The date when the event takes place.
- `venue`: The location of the event.
- `predictionTeam1`: Win probability percentage for team 1.
- `predictionTeam2`: Win probability percentage for team 2.
- `predictionDraw`: Win probability for draw.
- `predictionFactors`: An array of factors affecting predictions (name, team1 percentage, team2 percentage).
- Additional stats and details relevant for analysis.

## Technology Details
- **Frontend**: Built using React with TypeScript for type safety and enhanced developer experience.
- **Data Handling**: Uses context API to manage global state and provide event data throughout the application.


## Important Notes
- Ensure you have the required libraries installed (as specified in `package.json`).
- Use Replit's built-in features for easy project management and live collaboration.
- Consistently follow best practices for component structuring and state management within React.


