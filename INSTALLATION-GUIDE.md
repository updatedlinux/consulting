# Condo360 Polls System Installation Guide

## Overview

This document provides instructions for installing and configuring the Condo360 Polls system, which consists of:
1. A Node.js microservice for handling poll operations
2. A WordPress plugin for frontend integration

## Prerequisites

- Node.js 14+ installed
- MySQL database (shared with WordPress)
- WordPress 5.0+ installed
- npm or yarn package manager

## Installation Steps

### 1. Set up the Node.js Microservice

1. Navigate to the `node-poll-service` directory:
   ```bash
   cd node-poll-service
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_wordpress_database_name
   PORT=4000
   ```

5. Set up the database tables by running the SQL script in `database-setup.sql`:
   ```bash
   mysql -u your_username -p your_database_name < database-setup.sql
   ```

6. Start the service:
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

### 2. Install the WordPress Plugin

1. Copy the `wordpress-plugin/condo360-polls` directory to your WordPress plugins directory:
   ```bash
   cp -r wordpress-plugin/condo360-polls /path/to/wordpress/wp-content/plugins/
   ```

2. In your WordPress admin panel, go to Plugins and activate "Condo360 Polls"

3. If your Node.js service is running on a different URL than `http://localhost:4000`, update the `$api_url` variable in `condo360-polls.php`

### 3. Using the System

#### Creating Polls

1. As an administrator, go to the WordPress admin panel
2. Navigate to "Cartas Consulta" in the main menu
3. Fill in the poll question and options (one per line)
4. Click "Crear Encuesta"

#### Displaying Polls

Use the shortcode `[condo360_polls]` in any post or page to display open polls.

#### Displaying Results

Use the shortcode `[condo360_poll_results id="X"]` where X is the poll ID to display results.

### 4. User Roles

- **Administrators**: Can create polls and view results
- **Subscribers/Residents**: Can vote on polls and view results

### 5. Troubleshooting

1. **Service won't start**: Check that your database credentials in `.env` are correct
2. **Polls not displaying**: Verify the Node.js service is running and accessible
3. **Voting not working**: Ensure users are logged in to WordPress
4. **CORS issues**: Check that the WordPress site URL matches the CORS configuration in the Node.js service

### 6. Security Notes

- The Node.js service validates all WordPress user IDs against the database
- Users can only vote once per poll
- Only administrators can create polls
- All API endpoints use proper error handling and validation