const PDFDocument = require('pdfkit');

class PDFGenerator {
  static async generateSurveyResultsPDF(survey, results) {
    return new Promise((resolve, reject) => {
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

        // Header
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

        // Summary
        doc.fontSize(14)
           .fillColor('#2c3e50')
           .text('Resumen General', { underline: true });
        
        doc.fontSize(12)
           .fillColor('#333333')
           .text(`Total de Votos: ${results.total_votes}`);
        
        doc.moveDown(1);

        // Questions and results
        doc.fontSize(14)
           .fillColor('#2c3e50')
           .text('Resultados por Pregunta', { underline: true });
        
        doc.moveDown(0.5);

        results.questions.forEach((question, questionIndex) => {
          // Question title
          doc.fontSize(13)
             .fillColor('#007cba')
             .text(`${questionIndex + 1}. ${question.question_text}`);
          
          doc.moveDown(0.3);

          // Options with results
          question.options.forEach((option, optionIndex) => {
            const barWidth = 200;
            const barHeight = 15;
            const percentage = option.percentage || 0;
            const fillWidth = (barWidth * percentage) / 100;

            // Option text and vote count
            doc.fontSize(11)
               .fillColor('#333333')
               .text(`${option.option_text}: ${option.response_count} votos (${percentage.toFixed(1)}%)`);
            
            // Bar chart representation
            const startY = doc.y;
            
            // Background bar
            doc.rect(50, startY, barWidth, barHeight)
               .fillColor('#e9ecef')
               .fill();
            
            // Filled bar
            if (fillWidth > 0) {
              doc.rect(50, startY, fillWidth, barHeight)
                 .fillColor(this.getBarColor(optionIndex))
                 .fill();
            }
            
            // Border
            doc.rect(50, startY, barWidth, barHeight)
               .strokeColor('#dee2e6')
               .stroke();
            
            doc.moveDown(1.2);
          });

          doc.moveDown(0.5);
        });

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