# Condo360 Surveys API

Survey management system for condominium residents built with Node.js, Express, and MySQL.

## Features

- RESTful API for survey management
- Integration with WordPress user system
- Automatic survey closing
- Swagger documentation

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env` file
4. Initialize the database using `init-db.sql`
5. Start the server:
   ```bash
   npm start
   ```

## API Documentation

Once the server is running, visit `http://localhost:3000/polls/api-docs` for Swagger documentation.

## Endpoints

- `POST /polls/surveys` - Create a new survey
- `GET /polls/surveys` - Get active surveys
- `GET /polls/surveys/:id` - Get a specific survey
- `POST /polls/surveys/:id/vote` - Submit a vote
- `GET /polls/surveys/:id/results` - Get survey results
- `PUT /polls/surveys/:id/close` - Close a survey

## Database

The system uses the same database as WordPress and requires the following tables:
- condo360_surveys
- condo360_questions
- condo360_question_options
- condo360_survey_participants
- condo360_survey_responses