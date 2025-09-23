const questions = questionRows.map(q => {
      let options;
      try {
        // Try to parse as JSON first
        options = JSON.parse(q.options);
      } catch (e) {
        // If parsing fails, treat as a comma-separated string or create empty array
        if (typeof q.options === 'string') {
          // If it's a comma-separated string, split it
          if (q.options.includes(',')) {
            options = q.options.split(',').map(opt => opt.trim());
          } else {
            // Otherwise, treat the whole string as a single option
            options = [q.options];
          }
        } else {
          // If it's neither JSON nor string, create empty array
          options = [];
        }
      }
      
      return {
        id: q.id,
        text: q.question_text,
        options: options
      };
    });