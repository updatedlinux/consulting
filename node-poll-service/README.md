# Condo360 Poll Service

A Node.js microservice for handling polling functionality in Condo360, integrated with WordPress.

## Features

- REST API for creating and managing polls
- Integration with WordPress users and database
- Role-based access control (admins can create polls, residents can vote)
- CORS support for WordPress frontend integration
- Swagger UI documentation
- SSL offloading support for reverse proxy configurations

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Set up the database tables using `database-setup.sql`
5. Start the service:
   ```bash
   npm start
   ```

## API Endpoints

All endpoints are prefixed with `/api`:

- `POST /api/polls` - Create a new poll (admin only)
- `GET /api/polls` - Get all open polls
- `GET /api/polls/{id}` - Get poll details
- `POST /api/polls/{id}/vote` - Vote on a poll
- `GET /api/polls/{id}/results` - Get poll results

## Swagger Documentation

When running in development mode or with `ENABLE_SWAGGER=true`, Swagger UI is available at:
- `http://localhost:4000/api-docs` (development)
- `https://api.bonaventurecclub.com/api-docs` (production)

## Environment Variables

- `DB_HOST` - MySQL host
- `DB_USER` - MySQL user
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - WordPress database name
- `PORT` - Service port (default: 4000)
- `ENABLE_SWAGGER` - Set to "true" to enable Swagger UI in production
- `NODE_ENV` - Environment (development/production)