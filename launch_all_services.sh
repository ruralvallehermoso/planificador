#!/bin/bash

# Function to launch in a new terminal window/tab
launch_service() {
    local dir="$1"
    local cmd="$2"
    local title="$3"
    
    echo "🚀 Launching $title..."
    osascript -e "tell application \"Terminal\" 
        do script \"cd '$dir' && echo 'Starting $title...' && $cmd\"
    end tell"
}

echo "Starting all Planificador services..."

# 1. Main Planificador App (Port 3000)
launch_service "/Users/ct/PERSONAL/Proyectos/Planificador" "npm run dev" "Planificador Main"

# 2. Hogar Microfrontend (Port 3003)
launch_service "/Users/ct/PERSONAL/Proyectos/Planificador/microfrontends/hogar-web" "npm run dev" "Hogar Web"

# 3. Casa Rural Contabilidad (Port 3002)
launch_service "/Users/ct/PERSONAL/Proyectos/CasaRural-Contabilidad/casa-rural-web" "npm run dev" "Casa Rural"

# 4. Portfolio Master Backend (Port 8000)
# Adjusting path to venv since it is in parent dir of backend
launch_service "/Users/ct/PERSONAL/Proyectos/Finanzas/backend" "../.venv/bin/uvicorn main:app --reload --port 8000" "Portfolio Backend"

# 5. Portfolio Master Frontend (Port 5173 - default Vite)
launch_service "/Users/ct/PERSONAL/Proyectos/Finanzas/frontend/dashboard" "npm run dev" "Portfolio Frontend"

# 6. Dashboard Financiero (Port 8501)
launch_service "/Users/ct/PERSONAL/Proyectos/DashboardFinancieroReal" "streamlit run dashboard_financiero_real.py" "Dashboard Financiero"

echo "✅ All start commands issued."
