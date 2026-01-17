# bqqk1
=======
# Roblox Script Commander

Modern web-based script management panel for Roblox with AI assistance.

## 🎯 Features

### 🔐 Authentication
- Place ID & User ID based entry system
- Whitelist validation for security
- Roblox API integration for user verification

### 📊 Dashboard
- Welcome message with user information
- Quick navigation to all features
- Modern dark theme with soft red glow effects

### 💻 Script Editor
- **Monaco Editor** with Luau syntax highlighting
- **Multi-tab system** (create, rename, close tabs)
- **Execute button** to send scripts to Roblox
- **Output console** with timestamped logs and icons
- **AI Assistant** powered by Groq API for code help

### 🏪 Script Hub
- Pre-made scripts organized by category:
  - **Admin**: Moderation and admin tools
  - **Troll**: Fun pranks and effects
  - **Fun**: Entertainment scripts
- One-click execution

## 🛠️ Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React
- **Database**: MongoDB
- **Editor**: Monaco Editor
- **AI**: Groq API (Llama 3.3)
- **Styling**: Tailwind CSS + Shadcn UI

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py          # FastAPI application
│   ├── .env               # Environment variables (includes GROQ_API_KEY)
│   └── requirements.txt   # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── pages/
│   │   │   ├── EntryPage.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ScriptEditor.js
│   │   │   └── ScriptHub.js
│   │   └── components/ui/  # Shadcn UI components
│   ├── package.json
│   └── .env               # Frontend environment variables
└── scripts/
    └── seed_data.py       # Database seeding script
```

## 🚀 Getting Started

### Prerequisites
- Node.js & Yarn
- Python 3.11+
- MongoDB

### Installation

1. **Install Backend Dependencies**
```bash
cd /app/backend
pip install -r requirements.txt
```

2. **Install Frontend Dependencies**
```bash
cd /app/frontend
yarn install
```

3. **Environment Setup**

Backend `.env` is already configured with:
- MongoDB connection
- Groq API key
- CORS settings

Frontend `.env` contains:
- `REACT_APP_BACKEND_URL` - Backend API URL

### Running the Application

**Backend:**
```bash
cd /app/backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Frontend:**
```bash
cd /app/frontend
yarn start
```

## 🔑 API Endpoints

### Authentication & User
- `GET /api/v1/user/{userId}` - Get Roblox user information

### Script Management
- `GET /api/v1/place?id={placeId}&user?id={userId}&auth?key={authKey}` - Get script data
- `POST /api/v1/place?id={placeId}&user?id={userId}&auth?key={authKey}` - Update script data

### Script Hub
- `GET /api/v1/scripts` - Get all scripts
- `POST /api/v1/scripts` - Create new script

### Tab Management
- `GET /api/v1/tabs?placeId={placeId}&userId={userId}` - Get user tabs
- `POST /api/v1/tabs` - Create new tab
- `PUT /api/v1/tabs/{tabId}` - Update tab
- `DELETE /api/v1/tabs/{tabId}` - Delete tab

### AI Assistant
- `POST /api/v1/ai/chat` - Send message to AI assistant

## 🔒 Security

- **Auth Key**: `Āă↺↙₥Ⅱ₲ď℉⁐ↈă﷼↙ɱə` (required for script execution)
- **Whitelist**: Only users in the whitelist can execute scripts
  - Current whitelist: `Player1`, `Player2`, `TestUser`

## 🎨 Design

- **Theme**: Dark mode with soft red accents (#ef4444)
- **Typography**: 
  - JetBrains Mono for code and headers
  - Inter for body text
  - Fira Code for code editor
- **Effects**: Glassmorphism, soft red glows, smooth transitions

## 🤖 Roblox Integration

Example Roblox script to connect with the panel:

```lua
local Http = game:GetService("HttpService")
local Auth = "Āă↺↙₥Ⅱ₲ď℉⁐ↈă﷼↙ɱə"
local WebUrl = "https://your-deployment-url.com"

-- Check if user is whitelisted
task.spawn(function()
    while true do
        for _, Player in game:GetService("Players"):GetPlayers() do
            local Url = string.format(
                "%s/api/v1/place?id=%d&user?id=%d&auth?key=%s",
                WebUrl,
                game.PlaceId,
                Player.UserId,
                Auth
            )
            
            local success, data = pcall(function()
                return Http:GetAsync(Url)
            end)
            
            if success then
                local scriptData = Http:JSONDecode(data)
                
                if scriptData.CanExecutable then
                    -- Execute the script
                    loadstring(scriptData.Source)()
                    
                    -- Reset the flag
                    Http:PostAsync(Url, Http:JSONEncode({
                        CanExecutable = false
                    }))
                end
            end
        end
        task.wait(3)
    end
end)
```

## 📝 Notes

- The whitelist is currently hardcoded in `backend/server.py`
- MongoDB collections are automatically created on first use
- Sample scripts are seeded via `/app/scripts/seed_data.py`

## 🎯 Future Enhancements

- Dashboard whitelist management UI
- Script version history
- Collaborative editing
- Advanced Luau IntelliSense
- Custom theme builder

## 📄 License

This project is for educational purposes.