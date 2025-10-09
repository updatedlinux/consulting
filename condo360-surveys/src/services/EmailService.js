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
    const mailOptions = {
      from: process.env.MAIL_FROM || 'solicitudes@bonaventurecclub.com',
      to: recipient.email,
      subject: `Nueva Carta Consulta: ${surveyData.title}`,
      html: this.generateEmailHTML(surveyData, recipient)
    };
    
    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent to: ${recipient.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${recipient.email}:`, error);
      throw error;
    }
  }
  
  generateEmailHTML(surveyData, recipient) {
    const startDate = new Date(surveyData.start_date).toLocaleDateString('es-ES');
    const endDate = new Date(surveyData.end_date).toLocaleDateString('es-ES');
    
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
            color: white;
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
            <img src="https://bonaventurecclub.com/wp-content/uploads/2025/09/2-e1759267603471.png" alt="Bonaventure Country Club" class="logo">
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
                <a href="${process.env.WORDPRESS_SITE_URL || 'https://bonaventurecclub.com'}/cartas-consulta" class="cta-button">
                    🗳️ Participar en la Carta Consulta
                </a>
            </div>
            
            <p style="color: #6c757d; font-size: 14px;">Para acceder al sistema, debe estar registrado como propietario/residente. Si tiene problemas para acceder, contacte a la administración.</p>
        </div>
        
        <div class="footer">
            <p>Este es un mensaje automático del sistema Condo360 Surveys</p>
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
      
      // Get all subscribers (WordPress users with subscriber role)
      const [subscribers] = await db.execute(`
        SELECT u.ID, u.user_login, u.user_email, u.display_name
        FROM wp_users u
        INNER JOIN wp_usermeta um ON u.ID = um.user_id
        WHERE um.meta_key = 'wp_capabilities'
        AND um.meta_value LIKE '%subscriber%'
        AND u.user_email IS NOT NULL
        AND u.user_email != ''
      `);
      
      console.log('Database query executed, subscribers found:', subscribers.length);
      
      if (subscribers.length === 0) {
        console.log('No subscribers found to notify');
        return { success: false, message: 'No subscribers found' };
      }
      
      console.log(`Found ${subscribers.length} subscribers to notify`);
      
      // Add emails to queue
      subscribers.forEach(recipient => {
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
