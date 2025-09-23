# Complete Installation Guide

## Prerequisites

- Node.js v14 or higher
- MySQL database (same as WordPress)
- WordPress installation
- npm or yarn package manager

## Backend Installation (Node.js API)

1. Navigate to the backend directory:
   ```bash
   cd condo360-surveys
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update database credentials to match your WordPress database
   - Set the desired port (default is 3000)

4. Initialize the database:
   - Execute the `init-db.sql` script in your MySQL database
   - This creates all required tables for the survey system

5. Start the server:
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

6. Verify the API is running:
   - Visit `http://localhost:3000/polls/health` to check if the API is active
   - Visit `http://localhost:3000/polls/api-docs` for API documentation

## WordPress Plugin Installation

1. Upload the plugin:
   - Copy the `condo360-wordpress-plugin` directory to your WordPress plugins folder (`/wp-content/plugins/`)
   - Rename the folder to `condo360-surveys`

2. Activate the plugin:
   - Go to WordPress Admin > Plugins
   - Find "Condo360 Surveys" and click "Activate"

3. Configure the API URL:
   - Add the following to your theme's `functions.php` or in a mu-plugin:
   ```php
   define('CONDO360_SURVEYS_API_URL', 'http://your-domain.com:3000/polls');
   ```
   - Replace the URL with your actual API endpoint

4. Using the shortcode:
   - Add `[condo360_surveys]` to any page or post where residents should vote
   - Only logged-in users can view and vote on surveys

5. Admin functionality:
   - Access "Cartas Consulta" in the WordPress admin menu
   - Create new surveys using the form interface
   - View survey results and manage existing surveys

## Database Schema

The system uses the following tables in your WordPress database:
- `condo360_surveys` - Stores survey information
- `condo360_questions` - Stores survey questions
- `condo360_question_options` - Stores question options
- `condo360_survey_participants` - Tracks who has voted
- `condo360_survey_responses` - Stores individual responses

All tables are created by running the `init-db.sql` script.

## Security Notes

- All form submissions are protected with WordPress nonces
- User input is sanitized before database insertion
- API communication uses JSON over HTTP
- Only logged-in WordPress users can participate in surveys
- Survey results are only visible to admins for active surveys

## Customization

### Frontend Styling
- Modify `/assets/css/surveys.css` in the plugin directory to change resident survey appearance
- Styles are designed to be compatible with the Astra theme

### Admin Styling
- Modify `/assets/css/admin.css` to change admin interface appearance

### Templates
- All frontend and admin templates can be customized in the `/templates` directory
- Copy templates to your theme directory to override default templates

## Troubleshooting

1. API not responding:
   - Check if the Node.js server is running
   - Verify the API URL configuration in WordPress
   - Check server console for error messages

2. Database connection issues:
   - Verify database credentials in `.env` file
   - Ensure the WordPress database user has proper permissions

3. Shortcode not displaying:
   - Ensure the plugin is activated
   - Check that the user is logged in
   - Verify the API is accessible

4. Survey creation issues:
   - Check that all required fields are filled
   - Verify start date is before end date
   - Check browser console for JavaScript errors