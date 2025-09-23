jQuery(document).ready(function($) {
    var questionCount = 1;
    var optionCounts = {1: 2};
    
    // Add new question
    $('#add-question').on('click', function() {
        questionCount++;
        optionCounts[questionCount] = 2;
        
        var newQuestion = `
            <div class="question-group" data-question="${questionCount}">
                <h3>Question ${questionCount}</h3>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="question_${questionCount}">Question Text</label>
                        </th>
                        <td>
                            <textarea name="question_${questionCount}" id="question_${questionCount}" rows="2" class="regular-text" required></textarea>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">
                            Options
                        </th>
                        <td>
                            <div class="options-container" id="options-container-${questionCount}">
                                <div class="option-group">
                                    <input type="text" name="option_${questionCount}_1" placeholder="Option 1" required>
                                </div>
                                <div class="option-group">
                                    <input type="text" name="option_${questionCount}_2" placeholder="Option 2" required>
                                </div>
                            </div>
                            
                            <button type="button" class="button add-option" data-question="${questionCount}">
                                Add Option
                            </button>
                        </td>
                    </tr>
                </table>
                
                <input type="hidden" name="option_count_${questionCount}" id="option_count_${questionCount}" value="2">
            </div>
        `;
        
        $('#questions-container').append(newQuestion);
        $('#question_count').val(questionCount);
    });
    
    // Add new option
    $(document).on('click', '.add-option', function() {
        var questionNum = $(this).data('question');
        var optionCount = ++optionCounts[questionNum];
        
        var newOption = `
            <div class="option-group">
                <input type="text" name="option_${questionNum}_${optionCount}" placeholder="Option ${optionCount}" required>
            </div>
        `;
        
        $(`#options-container-${questionNum}`).append(newOption);
        $(`#option_count_${questionNum}`).val(optionCount);
    });
});