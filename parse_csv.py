import csv
import json

def parse_csv_quiz(csv_path):
    """Parse the CSV file containing quiz questions"""
    questions = []
    errors = []
    
    with open(csv_path, 'r', encoding='utf-8') as file:
        csv_reader = csv.DictReader(file)
        
        for row in csv_reader:
            question_id = int(row['#'])
            question_text = row['Question'].strip()
            
            # Extract options
            options = {
                'A': row['Option A'].strip(),
                'B': row['Option B'].strip(),
                'C': row['Option C'].strip(),
                'D': row['Option D'].strip()
            }
            
            # Extract correct answer from "Correct Answer" column
            # Format is like "A) Linear attenuation coefficient"
            correct_answer_full = row['Correct Answer'].strip()
            
            # Extract the letter (first character before the parenthesis)
            correct_letter = correct_answer_full[0] if correct_answer_full else 'A'
            
            # Extract the text after the letter and parenthesis
            if ')' in correct_answer_full:
                correct_answer_text = correct_answer_full.split(')', 1)[1].strip()
            else:
                correct_answer_text = correct_answer_full[1:].strip()
            
            # Verify that the correct answer text matches the corresponding option
            if correct_letter in options:
                option_text = options[correct_letter]
                
                # Compare the texts (case-insensitive and stripped)
                if correct_answer_text.lower() != option_text.lower():
                    error_msg = f"Question {question_id}: Correct answer text mismatch!\n  Expected (from option {correct_letter}): {option_text}\n  Got (from Correct Answer column): {correct_answer_text}"
                    errors.append(error_msg)
            else:
                errors.append(f"Question {question_id}: Invalid correct answer letter '{correct_letter}'")
            
            question_obj = {
                'id': question_id,
                'question': question_text,
                'options': options,
                'correct_answer': correct_letter
            }
            
            questions.append(question_obj)
    
    return questions, errors

def main():
    csv_path = 'Medical_Biophysics_Shuffled_Quiz_v2.csv'
    
    print("Parsing CSV file...")
    questions, errors = parse_csv_quiz(csv_path)
    
    print(f"\nFound {len(questions)} questions")
    
    # Display any errors found
    if errors:
        print(f"\n⚠️  Found {len(errors)} validation error(s):")
        for error in errors[:10]:  # Show first 10 errors
            print(f"  • {error}")
        if len(errors) > 10:
            print(f"  ... and {len(errors) - 10} more errors")
    else:
        print("\n✓ All answer texts match their corresponding options perfectly!")
    
    # Show first few questions as samples
    if questions:
        print("\nFirst question:")
        print(json.dumps(questions[0], indent=2))
        
        print("\nSecond question:")
        print(json.dumps(questions[1], indent=2))
        
        print("\nLast question:")
        print(json.dumps(questions[-1], indent=2))
    
    # Verify all questions have correct answers
    questions_without_answers = [q for q in questions if 'correct_answer' not in q or not q['correct_answer']]
    if questions_without_answers:
        print(f"\n⚠️  Warning: {len(questions_without_answers)} questions don't have correct answers!")
    else:
        print(f"\n✓ All {len(questions)} questions have correct answers")
    
    # Save to quiz_data.json
    output_path = 'quiz_data.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Saved {len(questions)} questions to {output_path}")
    
    # Create backup of old data
    try:
        import shutil
        shutil.copy(output_path, 'quiz_data_backup.json')
        print("✓ Backup created at quiz_data_backup.json")
    except:
        pass
    
    if errors:
        print(f"\n⚠️  Please review the {len(errors)} validation error(s) above before deploying.")
    else:
        print("\n✅ All validations passed! Ready to deploy.")

if __name__ == "__main__":
    main()
