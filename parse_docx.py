import json
from docx import Document

def parse_quiz_docx(docx_path):
    """Parse the Word document containing shuffled questions and options"""
    doc = Document(docx_path)
    
    questions = []
    current_question = None
    question_number = 0
    
    for para in doc.paragraphs:
        text = para.text.strip()
        
        if not text:
            continue
            
        # Check if this is a question number line
        if text[0].isdigit() and '.' in text[:5]:
            # Save previous question if exists
            if current_question and 'question' in current_question:
                questions.append(current_question)
            
            # Start new question
            question_number += 1
            parts = text.split('.', 1)
            if len(parts) > 1:
                current_question = {
                    'id': question_number,
                    'question': parts[1].strip(),
                    'options': {}
                }
        # Check if this is an option (A., B., C., D.)
        elif current_question and len(text) >= 2 and text[0] in ['A', 'B', 'C', 'D'] and text[1] in ['.', ')']:
            option_letter = text[0]
            # Remove the letter and separator
            option_text = text[2:].strip() if len(text) > 2 else text[2:].strip()
            current_question['options'][option_letter] = option_text
            
            # Check if this option has a check mark (✔, ✓, or √)
            if '✔' in option_text or '✓' in option_text or '√' in option_text:
                # Remove the check mark from the text
                option_text = option_text.replace('✔', '').replace('✓', '').replace('√', '').strip()
                current_question['options'][option_letter] = option_text
                current_question['correct_answer'] = option_letter
    
    # Add the last question
    if current_question and 'question' in current_question:
        questions.append(current_question)
    
    return questions

def main():
    docx_path = r"C:\Users\antos\Downloads\300_Questions_AND_Options_Shuffled.docx"
    
    print("Parsing Word document...")
    questions = parse_quiz_docx(docx_path)
    
    print(f"\nFound {len(questions)} questions")
    
    # Show first question as sample
    if questions:
        print("\nFirst question sample:")
        print(json.dumps(questions[0], indent=2))
        
        print("\nLast question sample:")
        print(json.dumps(questions[-1], indent=2))
    
    # Verify all questions have correct answers
    questions_without_answers = [q for q in questions if 'correct_answer' not in q]
    if questions_without_answers:
        print(f"\nWarning: {len(questions_without_answers)} questions don't have correct answers marked!")
        print("Setting default answer 'A' for these questions.")
        for q in questions_without_answers:
            q['correct_answer'] = 'A'
    
    questions_with_answers = len([q for q in questions if 'correct_answer' in q])
    print(f"\nQuestions with correct answers: {questions_with_answers}/{len(questions)}")
    
    # Save to new file
    output_path = 'quiz_data_new.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved {len(questions)} questions to {output_path}")
    print("\nTo use this data, rename it to quiz_data.json or review it first.")

if __name__ == "__main__":
    main()
