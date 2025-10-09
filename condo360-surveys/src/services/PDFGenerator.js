const PDFDocument = require('pdfkit');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  static async generateSurveyResultsPDF(survey, votersData) {
    return new Promise(async (resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(pdfBuffer);
        });

        // Download and add logo
        try {
          const logoUrl = 'https://bonaventurecclub.com/wp-content/uploads/2025/09/cropped-1-1.png';
          const logoResponse = await axios.get(logoUrl, { 
            responseType: 'arraybuffer',
            timeout: 5000 // 5 second timeout
          });
          const logoBuffer = Buffer.from(logoResponse.data);
          
          // Add logo to PDF
          doc.image(logoBuffer, {
            fit: [281, 94],
            align: 'center'
          });
          
          doc.moveDown(0.5);
        } catch (logoError) {
          console.log('Logo not available, continuing without logo:', logoError.message);
          // Add a text-based header instead
          doc.fontSize(18)
             .fillColor('#007cba')
             .text('Bonaventure Country Club', { align: 'center' });
          
          doc.moveDown(0.3);
        }
        
        // Title
        doc.fontSize(20)
           .fillColor('#2c3e50')
           .text('Resultados de la Carta Consulta', { align: 'center' });
        
        doc.moveDown(0.5);
        
        // Survey title
        doc.fontSize(16)
           .fillColor('#007cba')
           .text(survey.title, { align: 'center' });
        
        doc.moveDown(1);

        // Survey info
        doc.fontSize(12)
           .fillColor('#333333')
           .text(`Descripción: ${survey.description || 'N/A'}`);
        
        doc.text(`Período: ${new Date(survey.start_date).toLocaleDateString('es-ES')} - ${new Date(survey.end_date).toLocaleDateString('es-ES')}`);
        doc.text(`Estado: ${survey.status === 'open' ? 'Activa' : 'Cerrada'}`);
        
        doc.moveDown(1);

        // Voters Statistics
        doc.fontSize(14)
           .fillColor('#2c3e50')
           .text('Estadísticas de Participación', { underline: true });
        
        doc.moveDown(0.5);

        const stats = votersData.statistics;
        
        // Total eligible voters
        doc.fontSize(12)
           .fillColor('#333333')
           .text(`Propietarios Habilitados: ${stats.total_eligible_voters}`);
        
        // Actual voters
        doc.text(`Votos Recibidos: ${stats.actual_voters}`);
        
        // Participation percentage
        doc.text(`Porcentaje de Participación: ${stats.participation_percentage}%`);
        
        // Visual participation bar
        const barWidth = 200;
        const barHeight = 20;
        const participationPercent = parseFloat(stats.participation_percentage);
        const fillWidth = (barWidth * participationPercent) / 100;
        
        doc.moveDown(0.5);
        doc.fontSize(10)
           .fillColor('#666666')
           .text('Barra de Participación:');
        
        const startY = doc.y + 5;
        
        // Background bar
        doc.rect(50, startY, barWidth, barHeight)
           .fillColor('#e9ecef')
           .fill();
        
        // Filled bar
        if (fillWidth > 0) {
          doc.rect(50, startY, fillWidth, barHeight)
             .fillColor('#007cba')
             .fill();
        }
        
        // Border
        doc.rect(50, startY, barWidth, barHeight)
           .strokeColor('#dee2e6')
           .stroke();
        
        doc.moveDown(2);

        // Voters List
        doc.fontSize(14)
           .fillColor('#2c3e50')
           .text('Lista de Votantes', { underline: true });
        
        doc.moveDown(0.5);

        if (votersData.voters && votersData.voters.length > 0) {
          // Table header
          doc.fontSize(10)
             .fillColor('#666666')
             .text('ID', 50, doc.y)
             .text('Usuario', 100, doc.y)
             .text('Email', 200, doc.y)
             .text('Nombre', 350, doc.y)
             .text('Fecha de Voto', 450, doc.y);
          
          // Draw line under header
          doc.moveTo(50, doc.y + 15)
             .lineTo(550, doc.y + 15)
             .strokeColor('#dee2e6')
             .stroke();
          
          doc.moveDown(0.3);

          // Voters data
          votersData.voters.forEach((voter, index) => {
            const rowY = doc.y;
            
            doc.fontSize(9)
               .fillColor('#333333')
               .text(voter.id.toString(), 50, rowY)
               .text(voter.username, 100, rowY)
               .text(voter.email, 200, rowY)
               .text(voter.display_name || 'N/A', 350, rowY)
               .text(new Date(voter.voted_at).toLocaleDateString('es-ES'), 450, rowY);
            
            // Draw line under row
            doc.moveTo(50, rowY + 12)
               .lineTo(550, rowY + 12)
               .strokeColor('#f8f9fa')
               .stroke();
            
            doc.moveDown(0.2);
          });
        } else {
          doc.fontSize(12)
             .fillColor('#666666')
             .text('No hay votantes registrados para esta encuesta.');
        }

        doc.moveDown(2);

        // Survey Results Section
        if (votersData.questions && votersData.questions.length > 0) {
          doc.fontSize(14)
             .fillColor('#2c3e50')
             .text('Resultados por Pregunta', { underline: true });
          
          doc.moveDown(0.5);

          votersData.questions.forEach((question, questionIndex) => {
            // Question title
            doc.fontSize(13)
               .fillColor('#007cba')
               .text(`${questionIndex + 1}. ${question.question_text}`);
            
            doc.moveDown(0.5);

            // Calculate total votes for this question
            const totalVotes = question.options.reduce((sum, option) => sum + option.response_count, 0);

            // Options with results
            question.options.forEach((option, optionIndex) => {
              const barWidth = 300;
              const barHeight = 20;
              const percentage = totalVotes > 0 ? (option.response_count / totalVotes) * 100 : 0;
              const fillWidth = (barWidth * percentage) / 100;

              // Option text and vote count
              doc.fontSize(11)
                 .fillColor('#333333')
                 .text(`${option.option_text}: ${option.response_count} votos (${percentage.toFixed(1)}%)`);
              
              // Bar chart representation - centered
              const startY = doc.y + 5;
              const barX = (doc.page.width - doc.page.margins.left - doc.page.margins.right - barWidth) / 2 + doc.page.margins.left;
              
              // Background bar
              doc.rect(barX, startY, barWidth, barHeight)
                 .fillColor('#e9ecef')
                 .fill();
              
              // Filled bar
              if (fillWidth > 0) {
                doc.rect(barX, startY, fillWidth, barHeight)
                   .fillColor(this.getBarColor(optionIndex))
                   .fill();
              }
              
              // Border
              doc.rect(barX, startY, barWidth, barHeight)
                 .strokeColor('#dee2e6')
                 .stroke();
              
              doc.moveDown(1.5);
            });

            doc.moveDown(1);
          });
        }

        doc.moveDown(2);

        // Footer
        doc.fontSize(10)
           .fillColor('#6c757d')
           .text(`Reporte generado por Condo360 Surveys el ${new Date().toLocaleDateString('es-ES')}`, 
                 { align: 'center' });

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  static getBarColor(index) {
    const colors = [
      '#007cba',  // Blue
      '#28a745',  // Green
      '#ffc107',  // Yellow
      '#dc3545',  // Red
      '#6f42c1',  // Purple
      '#fd7e14',  // Orange
      '#20c997',  // Teal
      '#e83e8c'   // Pink
    ];
    return colors[index % colors.length];
  }
}

module.exports = PDFGenerator;