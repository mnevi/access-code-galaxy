
# Access Code

An accessible, gamified coding challenge platform designed for neurodivergent, visually impaired, hearing impaired, and motor-impaired learners. Built with React, Supabase, Flask, and Blockly.

---

## Features

- 🧠 Neurodivergent Mode: Customizable pacing, gentle feedback, and focus/break timers
- 🦻 Hearing Impairment Mode: Visual feedback, captions, and vibration alerts
- 👁️ Visual Impairment Mode: Screen reader support, high contrast, keyboard navigation
- 🦾 Motor Impairment Mode: Voice commands, large controls, switch navigation
- 🧩 Blockly-based visual coding workspace
- Real-time challenge progress and XP tracking (Supabase)
- Gamified XP, streaks, and rewards
- Accessible UI with modern design

---

## Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Flask (Python), Supabase (Postgres)
- **Blockly:** Visual programming interface
- **Authentication & DB:** Supabase

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Python 3.8+
- Supabase project (see below)

### Backend Setup

1. Install Python dependencies:
   ```sh
   cd src/backend
   pip install -r requirements.txt
   ```
2. Set your Supabase service role key as an environment variable:
   ```sh
   # On Windows (PowerShell)
   $env:SUPABASE_KEY="your-supabase-service-role-key"
   # On macOS/Linux
   export SUPABASE_KEY="your-supabase-service-role-key"
   ```
3. Start the Flask backend:
   ```sh
   python app.py
   ```

### Frontend Setup

1. In a new terminal, install Node dependencies:
   ```sh
   npm install
   ```
2. Build and start the frontend:
   ```sh
   npm run build
   npm run dev
   ```
3. Open your browser to `http://localhost:5173` (or the port shown in the terminal).

---

## Usage

- Sign up or log in (Supabase Auth)
- Select an accessibility mode (Neurodivergent, Visual, Hearing, Motor)
- Complete coding challenges in the Blockly workspace
- Track your XP, streaks, and progress
- Use settings dialogs to customize your experience

---

## Accessibility

This project is designed with accessibility as a first-class priority. All modes are tested for:

- Keyboard navigation
- Screen reader compatibility
- Color contrast and font size
- Voice and audio feedback
- Customizable UI for neurodivergent users

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Open a pull request

Please follow the code style and accessibility guidelines.

---

## Credits

Written by Max Neville and Zachary Pines