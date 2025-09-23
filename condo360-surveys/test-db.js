const SurveyModel = require('./src/models/SurveyModel');

// Test the database connection and model functionality
async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test getting all surveys (should work even with empty DB)
    const surveys = await SurveyModel.getAllSurveys();
    console.log('Database connection successful!');
    console.log(`Found ${surveys.length} surveys`);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Database test failed:', error.message);
  }
}

testDatabase();