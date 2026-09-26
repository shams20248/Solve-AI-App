#!/bin/bash

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building server..."
npm --workspace apps/server run build

echo "🔨 Building web..."
npm --workspace apps/web run build

echo "✅ Build complete!"
