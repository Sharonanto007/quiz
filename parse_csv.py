import csv
import json

def parse_csv_quiz(csv_path):
    """Parse the CSV file containing quiz questions"""
    questions = []
    
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
            
            # Extract correct answer letter from "Correct Answer" column
            # Format is like "A) Linear attenuation coefficient"
            correct_answer_text = row['Correct Answer'].strip()
            correct_letter = correct_answer_text[0] if correct_answer_text else 'A'
            
            question_obj = {
                'id': question_id,
                'question': question_text,
                'options': options,
                'correct_answer': correct_letter
            }
            
            questions.append(question_obj)
    
    return questions

def main():
    csv_path = 'Medical_Biophysics_Shuffled_Quiz_v2.csv'
    
    print("Parsing CSV file...")
    questions = parse_csv_quiz(csv_path)
    
    print(f"\nFound {len(questions)} questions")
    
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
        print(f"\nWarning: {len(questions_without_answers)} questions don't have correct answers!")
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

if __name__ == "__main__":
    main()
