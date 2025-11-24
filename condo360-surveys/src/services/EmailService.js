const nodemailer = require('nodemailer');
const db = require('../config/database');

class EmailService {
  constructor() {
    console.log('Initializing EmailService...');
    console.log('SMTP Config:', {
      host: process.env.SMTP_HOST || 'mail.meycotravel.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true' || true,
      user: process.env.SMTP_USER || 'solicitudes@bonaventurecclub.com',
      from: process.env.MAIL_FROM || 'solicitudes@bonaventurecclub.com'
    });
    
    // Initialize email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.meycotravel.com',
      port: parseInt(process.env.SMTP_PORT) || 465,
      secure: process.env.SMTP_SECURE === 'true' || true,
      auth: {
        user: process.env.SMTP_USER || 'solicitudes@bonaventurecclub.com',
        pass: process.env.SMTP_PASS || 'P@ssw0rd'
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'true' || true
      }
    });
    
    console.log('EmailService initialized successfully');
    
    // Email queue management
    this.emailQueue = [];
    this.isProcessing = false;
    
    // Start processing queue
    this.startQueueProcessor();
  }
  
  startQueueProcessor() {
    // Process queue every 2 minutes
    setInterval(async () => {
      if (!this.isProcessing && this.emailQueue.length > 0) {
        await this.processNextBatch();
      }
    }, 2 * 60 * 1000); // 2 minutes
  }
  
  async processNextBatch() {
    if (this.isProcessing || this.emailQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      const batch = this.emailQueue.splice(0, 30); // Take up to 30 emails
      console.log(`Processing batch of ${batch.length} emails`);
      
      await this.sendEmailBatch(batch);
      
      console.log(`Successfully sent ${batch.length} emails`);
    } catch (error) {
      console.error('Error processing email batch:', error);
    } finally {
      this.isProcessing = false;
    }
  }
  
  async sendEmailBatch(emailBatch) {
    const emailPromises = emailBatch.map(emailData => 
      this.sendSingleEmail(emailData.surveyData, emailData.recipient)
    );
    
    try {
      await Promise.all(emailPromises);
      console.log(`Successfully sent ${emailBatch.length} emails`);
    } catch (error) {
      console.error('Error sending email batch:', error);
      throw error;
    }
  }
  
  async sendSingleEmail(surveyData, recipient) {
    console.log('sendSingleEmail called with recipient:', recipient);
    
    const mailOptions = {
      from: process.env.MAIL_FROM || 'solicitudes@bonaventurecclub.com',
      to: recipient.user_email,
      subject: `Nueva Carta Consulta: ${surveyData.title}`,
      html: this.generateEmailHTML(surveyData, recipient)
    };
    
    console.log('Mail options:', mailOptions);
    
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to: ${recipient.user_email}`);
    } catch (error) {
      console.error(`Failed to send email to ${recipient.user_email}:`, error);
      throw error;
    }
  }
  
  // Helper function to extract date string (YYYY-MM-DD) from various date formats
  extractDateString(dateValue) {
    if (!dateValue) return null;
    
    // If it's already a string
    if (typeof dateValue === 'string') {
      // Handle ISO format: 2025-11-25T04:00:00.000Z
      if (dateValue.includes('T')) {
        return dateValue.split('T')[0]; // Extract YYYY-MM-DD
      }
      // Handle MySQL format: 2025-11-25 00:00:00
      if (dateValue.includes(' ')) {
        return dateValue.split(' ')[0]; // Extract YYYY-MM-DD
      }
      // Already in YYYY-MM-DD format
      return dateValue;
    }
    
    // If it's a Date object
    if (dateValue instanceof Date) {
      const year = dateValue.getUTCFullYear();
      const month = String(dateValue.getUTCMonth() + 1).padStart(2, '0');
      const day = String(dateValue.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    return null;
  }

  generateEmailHTML(surveyData, recipient) {
    // Debug: Log the original dates
    console.log('Original surveyData.start_date:', surveyData.start_date);
    console.log('Original surveyData.end_date:', surveyData.end_date);
    
    // Extract date strings (YYYY-MM-DD) from various formats
    const startDateStr = this.extractDateString(surveyData.start_date);
    const endDateStr = this.extractDateString(surveyData.end_date);
    
    if (!startDateStr || !endDateStr) {
      console.error('Error: Could not extract date strings from surveyData');
      return '<p>Error al procesar las fechas de la encuesta</p>';
    }
    
    console.log('Extracted startDateStr:', startDateStr);
    console.log('Extracted endDateStr:', endDateStr);
    
    // Parse as GMT-4 date (add T00:00:00-04:00 to represent midnight GMT-4)
    // The dates in DB are stored as YYYY-MM-DD 00:00:00 in GMT-4, so we parse them as GMT-4
    const startDateObj = new Date(startDateStr + 'T00:00:00-04:00');
    const endDateObj = new Date(endDateStr + 'T00:00:00-04:00');
    
    console.log('startDateObj (GMT-4):', startDateObj);
    console.log('endDateObj (GMT-4):', endDateObj);
    
    // Format dates in Spanish (Venezuela) - dates are already in GMT-4
    const startDate = startDateObj.toLocaleDateString('es-VE', {
      timeZone: 'America/Caracas',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const endDate = endDateObj.toLocaleDateString('es-VE', {
      timeZone: 'America/Caracas',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    console.log('Converted startDate:', startDate);
    console.log('Converted endDate:', endDate);
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Carta Consulta</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background: white;
            border-radius: 8px;
            padding: 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: #ffffff;
            padding: 30px 20px;
            text-align: center;
            border-bottom: 1px solid #e9ecef;
        }
        .logo {
            max-width: 281px;
            height: 94px;
            margin-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #2c3e50;
        }
        .content {
            padding: 30px 20px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #495057;
        }
        .survey-info {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            border: 1px solid #e9ecef;
            margin: 25px 0;
        }
        .survey-title {
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 15px;
        }
        .survey-description {
            color: #6c757d;
            margin-bottom: 20px;
            line-height: 1.5;
        }
        .survey-dates {
            background: #ffffff;
            padding: 15px;
            border-radius: 6px;
            font-size: 14px;
            color: #495057;
            border: 1px solid #dee2e6;
        }
        .cta-button {
            display: inline-block;
            background: #007cba;
            color: white !important;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 25px 0;
            text-align: center;
            transition: background-color 0.3s ease;
        }
        .cta-button:hover {
            background: #005a87;
        }
        .important-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 13px;
        }
        .footer p {
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://bonaventurecclub.com/wp-content/uploads/2025/09/cropped-1-1.png" alt="Bonaventure Country Club" class="logo">
            <h1>Nueva Carta Consulta Disponible</h1>
        </div>
        
        <div class="content">
            <div class="greeting">
                <p>Estimado/a <strong>${recipient.display_name || recipient.username}</strong>,</p>
                
                <p>Se ha publicado una nueva Carta Consulta en el sistema de gestión del condominio. Su participación es importante para la toma de decisiones de la comunidad.</p>
            </div>
            
            <div class="survey-info">
                <div class="survey-title">${surveyData.title}</div>
                ${surveyData.description ? `<div class="survey-description">${surveyData.description}</div>` : ''}
                <div class="survey-dates">
                    <strong>Período de votación:</strong><br>
                    Desde: ${startDate}<br>
                    Hasta: ${endDate}
                </div>
            </div>
            
            <div class="important-note">
                <strong>⚠️ Importante:</strong> Solo podrá votar una vez por Carta Consulta. Asegúrese de revisar todas las opciones antes de enviar su respuesta.
            </div>
            
            <div style="text-align: center;">
                <a href="https://bonaventurecclub.com/polls/" class="cta-button">
                    🗳️ Participar en la Carta Consulta a partir del: ${startDate}
                </a>
            </div>
            
            <p style="color: #6c757d; font-size: 14px;">Para acceder al sistema, debe estar registrado como propietario/residente. Si tiene problemas para acceder, contacte a la administración.</p>
        </div>
        
        <div class="footer">
            <p>Este es un mensaje automático del sistema Condominio360</p>
            <p>Por favor, no responda a este correo electrónico</p>
            <p>Si no desea recibir estas notificaciones, contacte a la administración</p>
        </div>
    </div>
</body>
</html>
    `;
  }
  
  async sendSurveyNotification(surveyData) {
    try {
      console.log('sendSurveyNotification called with surveyData:', surveyData);
      
      // Get survey building_id from database
      const [surveys] = await db.execute(
        'SELECT building_id FROM condo360_surveys WHERE id = ?',
        [surveyData.id]
      );
      
      if (surveys.length === 0) {
        console.log('Survey not found');
        return { success: false, message: 'Survey not found' };
      }
      
      const buildingId = surveys[0].building_id;
      console.log('Survey building_id:', buildingId);
      
      let subscribers;
      
      // If building_id is NULL, get all subscribers
      if (buildingId === null) {
        console.log('Getting all subscribers (all buildings)');
        [subscribers] = await db.execute(`
          SELECT u.ID, u.user_login, u.user_email, u.display_name
          FROM wp_users u
          INNER JOIN wp_usermeta um ON u.ID = um.user_id
          WHERE um.meta_key = 'wp_capabilities'
          AND um.meta_value LIKE '%subscriber%'
          AND u.user_email IS NOT NULL
          AND u.user_email != ''
        `);
      } else {
        // Get building name
        const [buildings] = await db.execute(
          'SELECT nombre FROM wp_condo360_edificios WHERE id = ?',
          [buildingId]
        );
        
        if (buildings.length === 0) {
          console.log('Building not found');
          return { success: false, message: 'Building not found' };
        }
        
        const buildingName = buildings[0].nombre;
        console.log('Getting subscribers for building:', buildingName);
        
        // Get subscribers for specific building
        [subscribers] = await db.execute(`
          SELECT DISTINCT u.ID, u.user_login, u.user_email, u.display_name
          FROM wp_users u
          INNER JOIN wp_usermeta um_role ON u.ID = um_role.user_id AND um_role.meta_key = 'wp_capabilities'
          INNER JOIN wp_usermeta um_building ON u.ID = um_building.user_id AND um_building.meta_key = 'edificio'
          WHERE um_role.meta_value LIKE '%subscriber%'
          AND um_building.meta_value = ?
          AND u.user_email IS NOT NULL
          AND u.user_email != ''
        `, [buildingName]);
      }
      
      console.log('Database query executed, subscribers found:', subscribers.length);
      
      if (subscribers.length === 0) {
        console.log('No subscribers found to notify');
        return { success: false, message: 'No subscribers found' };
      }
      
      console.log(`Found ${subscribers.length} subscribers to notify`);
      console.log('Subscribers data:', subscribers);
      
      // Add emails to queue
      subscribers.forEach(recipient => {
        console.log('Processing recipient:', recipient);
        this.emailQueue.push({
          surveyData,
          recipient
        });
      });
      
      console.log(`Added ${subscribers.length} emails to queue`);
      
      return { 
        success: true, 
        recipientsCount: subscribers.length,
        message: `Email notification queued for ${subscribers.length} subscribers`
      };
      
    } catch (error) {
      console.error('Error sending survey notification:', error);
      throw error;
    }
  }
  
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async getQueueStatus() {
    return {
      waiting: this.emailQueue.length,
      active: this.isProcessing ? 1 : 0,
      completed: 0, // Not tracked in simple queue
      failed: 0 // Not tracked in simple queue
    };
  }
}

module.exports = EmailService;
