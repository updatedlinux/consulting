# Condo360 Polls System - Component Summary

## Node.js Microservice (node-poll-service)

Location: `node-poll-service/`

### Components:
1. **Package.json** - Project dependencies and scripts
2. **Database Configuration** - MySQL connection pool setup
3. **Models**:
   - Poll.js - Poll database operations
   - Vote.js - Vote database operations
4. **Services**:
   - wordpressUserService.js - WordPress user validation
5. **Controllers**:
   - pollController.js - API endpoint implementations
6. **Routes**:
   - pollRoutes.js - API route definitions
7. **Main Application**:
   - index.js - Express app setup
8. **Database Setup**:
   - database-setup.sql - SQL schema for polls and votes
9. **Configuration**:
   - .env.example - Environment variable template
10. **Documentation**:
    - README.md - Service documentation

## WordPress Plugin (wordpress-plugin/condo360-polls)

Location: `wordpress-plugin/condo360-polls/`

### Components:
1. **Main Plugin File**:
   - condo360-polls.php - Plugin initialization and shortcodes
2. **Assets**:
   - polls.js - Frontend JavaScript functionality
   - polls.css - Frontend styling
3. **Documentation**:
   - README.md - Plugin documentation

## API Endpoints

1. POST /api/polls - Create poll (admin only)
2. GET /api/polls - List open polls
3. GET /api/polls/:id - Get poll details
4. POST /api/polls/:id/vote - Vote on poll
5. GET /api/polls/:id/results - Get poll results

## WordPress Shortcodes

1. [condo360_polls] - Display open polls
2. [condo360_poll_results id="X"] - Display poll results

## Database Tables

1. condo360_polls - Poll questions and options
2. condo360_votes - User votes on polls