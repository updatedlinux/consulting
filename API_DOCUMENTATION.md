# API Endpoints Documentation

## Base URL
All endpoints are prefixed with `/polls`

## Survey Management Endpoints

### Create a New Survey
**POST** `/polls/surveys`

Creates a new survey with questions and options.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "start_date": "YYYY-MM-DD HH:MM:SS",
  "end_date": "YYYY-MM-DD HH:MM:SS",
  "questions": [
    {
      "question_text": "string",
      "question_order": "integer (optional, default: 1)",
      "options": [
        {
          "option_text": "string"
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "message": "Survey created successfully",
  "survey_id": "integer"
}
```

**Validation:**
- All fields except description are required
- End date must be after start date
- Each question must have at least one option

### Get Active Surveys
**GET** `/polls/surveys`

Retrieves all surveys that are currently active (open status and within date range).

**Response:**
```json
[
  {
    "id": "integer",
    "title": "string",
    "description": "string",
    "start_date": "datetime",
    "end_date": "datetime",
    "status": "open|closed",
    "created_at": "datetime",
    "questions": [
      {
        "id": "integer",
        "survey_id": "integer",
        "question_text": "string",
        "question_order": "integer",
        "created_at": "datetime",
        "options": [
          {
            "id": "integer",
            "question_id": "integer",
            "option_text": "string",
            "option_order": "integer",
            "created_at": "datetime"
          }
        ]
      }
    ]
  }
]
```

### Get Specific Survey
**GET** `/polls/surveys/:id`

Retrieves a specific survey by ID.

**Response:**
Same as above but for a single survey.

### Vote in a Survey
**POST** `/polls/surveys/:id/vote`

Records a user's vote in a survey.

**Request Body:**
```json
{
  "wp_user_id": "integer",
  "responses": [
    {
      "question_id": "integer",
      "option_id": "integer"
    }
  ]
}
```

**Response:**
```json
{
  "message": "Vote recorded successfully"
}
```

**Validation:**
- User must exist in wp_users
- User must not have already participated
- All survey questions must be answered
- Survey must be open and within date range

### Get Survey Results
**GET** `/polls/surveys/:id/results`

Retrieves results for a specific survey.

**Query Parameters:**
- `admin` (optional): Set to "true" to bypass result availability checks

**Response:**
```json
{
  "survey": {
    "id": "integer",
    "title": "string",
    "description": "string",
    "status": "open|closed",
    "start_date": "datetime",
    "end_date": "datetime"
  },
  "questions": [
    {
      "id": "integer",
      "question_text": "string",
      "question_order": "integer",
      "options": [
        {
          "id": "integer",
          "option_text": "string",
          "option_order": "integer",
          "response_count": "integer"
        }
      ]
    }
  ]
}
```

**Availability:**
- Results are only available for closed surveys or when accessed by admin

### Close a Survey
**PUT** `/polls/surveys/:id/close`

Manually closes a survey.

**Response:**
```json
{
  "message": "Survey closed successfully"
}
```

### Get All Surveys (Admin)
**GET** `/polls/surveys/all`

Retrieves all surveys for admin panel with participation statistics.

**Response:**
```json
[
  {
    "id": "integer",
    "title": "string",
    "description": "string",
    "start_date": "datetime",
    "end_date": "datetime",
    "status": "open|closed",
    "created_at": "datetime",
    "participant_count": "integer",
    "question_count": "integer"
  }
]
```

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**
```json
{
  "error": "Description of the error"
}
```

**404 Not Found**
```json
{
  "error": "Resource not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Something went wrong!"
}
```

## Authentication

The API does not implement authentication itself. Instead:
- WordPress user IDs are passed in request bodies
- WordPress handles user authentication
- The API validates that user IDs exist in the wp_users table

## Rate Limiting

No rate limiting is implemented in the API. If needed, this should be handled at the server level (nginx, Apache, etc.).

## CORS

CORS is enabled for all origins to allow requests from the WordPress frontend.