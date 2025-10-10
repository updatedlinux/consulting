const cron = require('node-cron');
const db = require('../config/database');

// Schedule a task to run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running hourly survey status check...');
  
  try {
    const [result] = await db.execute(
      `UPDATE condo360_surveys 
       SET status = 'closed' 
       WHERE status = 'open' 
       AND end_date < UTC_TIMESTAMP()`
    );
    
    if (result.affectedRows > 0) {
      console.log(`Closed ${result.affectedRows} expired surveys`);
    }
  } catch (error) {
    console.error('Error closing expired surveys:', error);
  }
});

console.log('Survey cron job scheduled to run every hour');