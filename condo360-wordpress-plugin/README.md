# Condo360 Surveys WordPress Plugin

WordPress plugin for managing condominium surveys with resident voting capabilities.

## Features

- Resident survey voting through shortcode
- Admin dashboard for survey management
- Survey creation interface
- Results visualization
- Integration with WordPress user system

## Installation

1. Upload the plugin folder to `/wp-content/plugins/condo360-surveys`
2. Activate the plugin through the WordPress plugins screen
3. Configure the API URL in your theme's `functions.php`:
   ```php
   define('CONDO360_SURVEYS_API_URL', 'http://your-domain.com:3000/polls');
   ```

## Usage

### Frontend

Use the shortcode `[condo360_surveys]` to display available surveys to residents.

### Admin

Access the "Cartas Consulta" menu in the WordPress admin to:
- View all surveys
- Create new surveys
- View survey results

## Requirements

- WordPress 5.0 or higher
- Node.js API backend running
- MySQL database (shared with WordPress)

## Templates

The plugin includes customizable templates in the `/templates` folder:
- `frontend-surveys.php` - Resident survey display
- `admin-dashboard.php` - Admin survey overview
- `admin-create-survey.php` - Survey creation form
- `admin-select-survey.php` - Survey selection for results
- `admin-survey-results.php` - Survey results display

## Styles

The plugin includes CSS files in `/assets/css`:
- `surveys.css` - Frontend styles (compatible with Astra theme)
- `admin.css` - Admin interface styles

## JavaScript

The plugin includes JavaScript files in `/assets/js`:
- `surveys.js` - Frontend survey interaction
- `admin.js` - Admin dynamic form functionality