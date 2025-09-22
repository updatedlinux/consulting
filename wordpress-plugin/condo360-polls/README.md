# Condo360 Polls WordPress Plugin

WordPress plugin that integrates with the Condo360 Poll Service Node.js microservice.

## Installation

1. Upload the `condo360-polls` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Ensure the Node.js poll service is running

## Shortcodes

- `[condo360_polls]` - Display open polls
- `[condo360_poll_results id="X"]` - Display results for poll with ID X

## Configuration

The plugin assumes the Node.js service is running at `http://localhost:4000`. To change this, modify the `$api_url` variable in `condo360-polls.php`.

## Requirements

- WordPress 5.0 or higher
- Node.js poll service running
- Access to WordPress database