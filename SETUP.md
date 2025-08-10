# AI Coach Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- Python 3.8 or higher
- Git

## Quick Start

### 1. Install Dependencies

**Node.js dependencies:**
```bash
npm install
```

**Python dependencies:**
```bash
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Authentication
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-supabase-dashboard
SUPABASE_ANON_KEY=your-anon-public-key-from-supabase-dashboard

# AI Service Configuration
AI_SERVICE_URL=http://localhost:7861

# Optional: HuggingFace token for better AI models
# Get this from https://huggingface.co/settings/tokens
HF_TOKEN=your-huggingface-token

# Environment
NODE_ENV=development

# Port (optional, defaults to 3000)
PORT=3000
```

### 3. Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration files:
   - `supabase/migrations/20250808162555_bronze_wind.sql`
   - `supabase/migrations/20250808162608_square_brook.sql`
3. Copy your project URL and keys to the `.env` file

### 4. Start the Application

**Option 1: Use the startup script (Windows)**
```bash
# Double-click start.bat or run:
start.bat
```

**Option 2: Manual startup**
```bash
# Terminal 1: Start AI service
python app.py

# Terminal 2: Start web server
npm start
```

### 5. Access the Application

- **Web Application**: http://localhost:3000
- **AI Service**: http://localhost:7861

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in `.env` file
2. **Python model loading errors**: The app will fall back to basic feedback
3. **Supabase connection errors**: Check your environment variables
4. **JWT errors**: Ensure JWT_SECRET is set and unique

### Model Fallback

If the AI models fail to load, the application will automatically fall back to basic text-based feedback generation. This ensures the app remains functional even without the full AI capabilities.

## Development

- **Frontend**: `public/js/app.js`
- **Backend**: `server.js` and `routes/`
- **AI Service**: `app.py`
- **Database**: Supabase with migrations in `supabase/migrations/`

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set
3. Ensure both services are running on the correct ports
