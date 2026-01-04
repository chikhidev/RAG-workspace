#!/bin/bash


echo "🚀 Initializing RAG Workspace..."

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js (v18 or higher) to continue."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm to continue."
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
else
    echo "✅ Node dependencies already installed."
fi

echo "✨ Starting development server..."
npm run dev
