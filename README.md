# Medical Biophysics Quiz Application

A professional quiz application for Medical Biophysics course at Osh State University.

## 🌐 Live Demo

**Deploy to Vercel with one click:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL)

[See full deployment guide →](DEPLOYMENT.md)

## Features

- ✅ 300 medical biophysics questions with verified answers
- 🎯 Complete quiz or custom question ranges
- 💡 **Instant feedback** - See correct answer immediately after selection
- 📊 Real-time scoring and progress tracking
- 📝 Detailed answer review with explanations
- 🚀 Fast Node.js/Express backend with RESTful API
- 🎨 Modern, responsive UI with dark theme
- ⌨️ Keyboard shortcuts support (Arrow keys, A/B/C/D)
- 💾 Auto-save progress
- 🔒 Secure answer validation (answers not exposed in frontend)
- 🌐 **Vercel-ready** for instant deployment

## Technology Stack

### Backend
- Node.js
- Express.js
- CORS enabled
- Helmet (security)
- Compression
- Morgan (logging)

### Frontend
- HTML5
- CSS3 (Modern design with animations)
- Vanilla JavaScript (ES6+)
- Fetch API for REST communication

## Installation

1. Install Node.js (v14 or higher)

2. Install dependencies:
```bash
npm install
```

## Running the Application

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Open your browser:
```
http://localhost:3001
```

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Deploy to Production (Vercel)

**Quick Deploy:**
```bash
npm install -g vercel
vercel login
vercel --prod
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## API Endpoints

### Get All Questions
```
GET /api/questions
```
Returns all questions without correct answers for security.

### Get Question by ID
```
GET /api/questions/:id
```
Returns a specific question by ID.

### Get Questions by Range
```
GET /api/questions/range/:start/:end
```
Returns questions within a specific range.

### Submit Quiz
```
POST /api/submit
Body: { "answers": ["A", "B", "C", ...] }
```
Submits quiz answers and returns score with detailed results.

### Check Single Answer
```
POST /api/check
Body: { "questionId": 1, "answer": "A" }
```
Checks if a single answer is correct.

### Get Statistics
```
GET /api/stats
```
Returns quiz statistics and question counts by category.

## Project Structure

```
quiz/
├── server.js              # Express server
├── package.json           # Dependencies
├── quiz_data.json         # 300 questions with answers
├── .env                   # Environment variables
├── public/                # Frontend files
│   ├── index.html        # Main HTML
│   ├── styles.css        # Styling
│   └── quiz.js           # Frontend logic
├── parse_pdf.py          # PDF parser script
└── README.md             # Documentation
```

## Keyboard Shortcuts

- **Arrow Left**: Previous question
- **Arrow Right**: Next question
- **A/B/C/D**: Select answer option

## Security Features

- Correct answers are never sent to the frontend
- All answer validation happens on the server
- Helmet.js for HTTP security headers
- CORS configured properly
- Input validation on all endpoints

## Development

### Adding New Questions

1. Update `quiz_data.json` with new questions
2. Restart the server
3. Questions are automatically loaded

### Customizing UI

Edit files in the `public/` directory:
- `index.html` - Structure
- `styles.css` - Styling
- `quiz.js` - Functionality

## Credits

**Institution**: Osh State University  
**Faculty**: International Medical Faculty  
**Department**: Natural Sciences and Mathematics  
**Course**: Medical Biophysics (560001 - General Medicine)  
**Academic Year**: 2025-2026

## License

MIT License - Educational purposes
