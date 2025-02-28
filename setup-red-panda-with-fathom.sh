#!/bin/bash

# Setup script that integrates Fathom Analytics with the red-panda-creator

# Set variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATES_DIR="$HOME/Documents/Adder/100 Templates"

# Check if red-panda-creator.sh exists
if [ ! -f "$TEMPLATES_DIR/red-panda-simple/red-panda-creator.sh" ]; then
    echo "❌ red-panda-creator.sh not found at $TEMPLATES_DIR/red-panda-simple/"
    echo "Please ensure the red-panda-simple template is in the correct location."
    exit 1
fi

# Copy the Fathom setup script to the red-panda-simple directory
echo "Copying Fathom setup script to red-panda-simple directory..."
cp "$SCRIPT_DIR/fathom-setup.sh" "$TEMPLATES_DIR/red-panda-simple/"

# Make the script executable
chmod +x "$TEMPLATES_DIR/red-panda-simple/fathom-setup.sh"

# Check if FATHOM_API_TOKEN is set
if [ -z "$FATHOM_API_TOKEN" ]; then
    echo "⚠️ FATHOM_API_TOKEN environment variable is not set."
    echo "Please set it before running this script:"
    echo "export FATHOM_API_TOKEN=your_token_here"
    
    # Ask if the user wants to continue without Fathom integration
    read -p "Do you want to continue without Fathom integration? (y/n): " continue_without_fathom
    
    if [[ "$continue_without_fathom" != "y" && "$continue_without_fathom" != "Y" ]]; then
        echo "Exiting. Please set FATHOM_API_TOKEN and try again."
        exit 1
    fi
    
    echo "Continuing without Fathom integration..."
fi

# Run the red-panda-creator script with the provided project name
echo "Running red-panda-creator script..."
cd "$TEMPLATES_DIR/red-panda-simple" || exit
./red-panda-creator.sh "$@"

echo "Setup complete!" 