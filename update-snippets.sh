#!/bin/bash

# Repository location
REPO_DIR="$HOME/Sites/cursor-snippets"
BACKUP_DIR="$HOME/Sites/cursor-snippets-backups"

# Function to validate JSON files
validate_json() {
    local file=$1
    if ! jq empty "$file" 2>/dev/null; then
        echo "Error: $file contains invalid JSON"
        return 1
    fi
    return 0
}

# Function to create backup
create_backup() {
    local backup_dir="$BACKUP_DIR/$(date +%Y%m%d_%H%M%S)"
    echo "Creating backup in $backup_dir..."
    mkdir -p "$backup_dir"
    cp ~/Library/Application\ Support/Cursor/User/snippets/*.json "$backup_dir/" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "Backup created successfully"
        # Keep only the last 5 backups
        ls -t "$BACKUP_DIR" | tail -n +6 | xargs -I {} rm -rf "$BACKUP_DIR/{}" 2>/dev/null
    else
        echo "Warning: No existing snippets to backup"
    fi
}

# Navigate to the snippets repository
cd "$REPO_DIR"

# Create backup of existing snippets
create_backup

# Pull latest changes
echo "Pulling latest changes..."
git pull

# Validate JSON files before copying
echo "Validating JSON files..."
for file in *.json; do
    if [ -f "$file" ]; then
        if ! validate_json "$file"; then
            echo "Error: Validation failed. Aborting update."
            exit 1
        fi
    fi
done

# Copy snippets to Cursor directory
echo "Updating Cursor snippets..."
cp *.json ~/Library/Application\ Support/Cursor/User/snippets/

echo "Done! Cursor snippets have been updated."
echo "Note: You may need to restart Cursor for changes to take effect."
echo "A backup of your previous snippets was created in $BACKUP_DIR" 