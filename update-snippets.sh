#!/bin/bash

# Navigate to the snippets repository
cd "$(dirname "$0")"

# Pull latest changes
echo "Pulling latest changes..."
git pull

# Copy snippets to Cursor directory
echo "Updating Cursor snippets..."
cp *.json ~/Library/Application\ Support/Cursor/User/snippets/

echo "Done! Cursor snippets have been updated."
echo "Note: You may need to restart Cursor for changes to take effect." 