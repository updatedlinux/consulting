const puppeteer = require('puppeteer');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

class PDFGenerator {
  static async generateSurveyResultsPDF(surveyData, resultsData) {
    try {
      // Generate charts for each question
      const charts = await this.generateCharts(resultsData);
      
      // Create HTML content
      const htmlContent = this.generateHTML(surveyData, resultsData, charts);
      
      // Generate PDF using Puppeteer
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm'
        }
      });
      
      await browser.close();
      
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }
  
  static async generateCharts(resultsData) {
    const charts = [];
    const width = 400;
    const height = 300;
    
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height });
    
    for (const question of resultsData.questions) {
      const labels = question.options.map(option => option.option_text);
      const data = question.options.map(option => option.response_count);
      const backgroundColor = this.generateColors(question.options.length);
      
      const configuration = {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: backgroundColor,
            borderWidth: 2,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
                usePointStyle: true
              }
            },
            title: {
              display: true,
              text: question.question_text,
              font: {
                size: 16,
                weight: 'bold'
              },
              padding: 20
            }
          }
        }
      };
      
      const chartBuffer = await chartJSNodeCanvas.renderToBuffer(configuration);
      charts.push({
        questionId: question.id,
        questionText: question.question_text,
        chartBuffer: chartBuffer.toString('base64')
      });
    }
    
    return charts;
  }
  
  static generateColors(count) {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];
    
    const result = [];
    for (let i = 0; i < count; i++) {
      result.push(colors[i % colors.length]);
    }
    
    return result;
  }
  
  static generateHTML(surveyData, resultsData, charts) {
    const totalVotes = resultsData.total_votes || 0;
    const currentDate = new Date().toLocaleDateString('es-ES');
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resultados de Carta Consulta</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
            color: #333;
        }
        .header {
            text-align: center;
            background: linear-gradient(135deg, #0073aa, #005a87);
            color: white;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header .subtitle {
            margin-top: 10px;
            font-size: 16px;
            opacity: 0.9;
        }
        .survey-info {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .survey-info h2 {
            color: #0073aa;
            margin-top: 0;
            border-bottom: 2px solid #0073aa;
            padding-bottom: 10px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #0073aa;
        }
        .info-label {
            font-weight: bold;
            color: #666;
            font-size: 14px;
        }
        .info-value {
            font-size: 16px;
            color: #333;
            margin-top: 5px;
        }
        .question-section {
            background: white;
            margin-bottom: 30px;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .question-header {
            background: #f8f9fa;
            padding: 20px;
            border-bottom: 1px solid #dee2e6;
        }
        .question-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin: 0;
        }
        .question-content {
            padding: 20px;
        }
        .chart-container {
            text-align: center;
            margin-bottom: 20px;
        }
        .chart-container img {
            max-width: 100%;
            height: auto;
            border-radius: 5px;
        }
        .results-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        .results-table th {
            background: #0073aa;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }
        .results-table td {
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
        }
        .results-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        .percentage-bar {
            width: 100%;
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 5px;
        }
        .percentage-fill {
            height: 100%;
            background: linear-gradient(90deg, #0073aa, #005a87);
            border-radius: 10px;
            transition: width 0.3s ease;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            color: #666;
            font-size: 14px;
        }
        .summary-stats {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        .stat-item {
            text-align: center;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #0073aa;
        }
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #0073aa;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Resultados de Carta Consulta</h1>
        <div class="subtitle">Generado el ${currentDate}</div>
    </div>
    
    <div class="survey-info">
        <h2>${surveyData.title}</h2>
        ${surveyData.description ? `<p style="color: #666; margin-bottom: 20px;">${surveyData.description}</p>` : ''}
        
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Fecha de Inicio</div>
                <div class="info-value">${new Date(surveyData.start_date).toLocaleDateString('es-ES')}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Fecha de Fin</div>
                <div class="info-value">${new Date(surveyData.end_date).toLocaleDateString('es-ES')}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Estado</div>
                <div class="info-value">${surveyData.status === 'open' ? 'Activa' : 'Cerrada'}</div>
            </div>
            <div class="info-item">
                <div class="info-label">Total de Votos</div>
                <div class="info-value">${totalVotes}</div>
            </div>
        </div>
    </div>
    
    <div class="summary-stats">
        <h2 style="color: #0073aa; margin-top: 0;">Resumen General</h2>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${resultsData.questions.length}</div>
                <div class="stat-label">Preguntas</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${totalVotes}</div>
                <div class="stat-label">Total Votos</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${surveyData.status === 'open' ? 'Activa' : 'Cerrada'}</div>
                <div class="stat-label">Estado</div>
            </div>
        </div>
    </div>
    
    ${resultsData.questions.map((question, index) => `
        <div class="question-section">
            <div class="question-header">
                <h3 class="question-title">Pregunta ${index + 1}: ${question.question_text}</h3>
            </div>
            <div class="question-content">
                <div class="chart-container">
                    <img src="data:image/png;base64,${charts.find(c => c.questionId === question.id)?.chartBuffer || ''}" alt="Gráfico de resultados">
                </div>
                
                <table class="results-table">
                    <thead>
                        <tr>
                            <th>Opción</th>
                            <th>Votos</th>
                            <th>Porcentaje</th>
                            <th>Visualización</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${question.options.map(option => `
                            <tr>
                                <td>${option.option_text}</td>
                                <td>${option.response_count}</td>
                                <td>${((option.response_count / totalVotes) * 100).toFixed(1)}%</td>
                                <td>
                                    <div class="percentage-bar">
                                        <div class="percentage-fill" style="width: ${(option.response_count / totalVotes) * 100}%"></div>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `).join('')}
    
    <div class="footer">
        <p>Este documento fue generado automáticamente por el sistema Condo360 Surveys</p>
        <p>Fecha de generación: ${currentDate}</p>
    </div>
</body>
</html>
    `;
  }
}

module.exports = PDFGenerator;
