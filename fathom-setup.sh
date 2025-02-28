#!/bin/bash

# Fathom Analytics Site Creation Script
# This script creates a new Fathom Analytics site and adds the site ID to Doppler environment variables

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to prompt for input if not provided
get_project_name() {
  if [ -z "$1" ]; then
    # Instead of prompting, use a default name or exit
    echo "Error: Project name is required. Usage: ./fathom-setup.sh <project-name>"
    exit 1
  else
    PROJECT_NAME="$1"
  fi
  echo "$PROJECT_NAME"
}

# Function to get Fathom API token
get_fathom_token() {
  if [ -z "$FATHOM_API_TOKEN" ]; then
    echo "⚠️ FATHOM_API_TOKEN environment variable is not set."
    echo "Please set it before running this script:"
    echo "export FATHOM_API_TOKEN=your_token_here"
    
    # Ask if the user wants to enter the token now
    read -p "Do you want to enter your Fathom API token now? (y/n): " enter_token
    
    if [[ "$enter_token" == "y" || "$enter_token" == "Y" ]]; then
      read -p "Enter your Fathom API token: " input_token
      if [ -n "$input_token" ]; then
        export FATHOM_API_TOKEN="$input_token"
        echo "$FATHOM_API_TOKEN"
        return 0
      else
        echo "No token provided. Exiting."
        exit 1
      fi
    else
      echo "Exiting. Please set FATHOM_API_TOKEN and try again."
      exit 1
    fi
  fi
  echo "$FATHOM_API_TOKEN"
}

# Function to create a Fathom site
create_fathom_site() {
  local site_name="$1"
  local api_token="$2"
  
  echo "Creating Fathom Analytics site: $site_name"
  
  # Make API request to create site
  response=$(curl -s -X POST "https://api.usefathom.com/v1/sites" \
    -H "Authorization: Bearer $api_token" \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"$site_name\"}")
  
  # Check if the request was successful
  if echo "$response" | grep -q "error"; then
    echo "❌ Error creating Fathom site:"
    echo "$response"
    return 1
  else
    # Extract site ID from response
    site_id=$(echo "$response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Fathom site created successfully with ID: $site_id"
    echo "$site_id"
    return 0
  fi
}

# Function to add Fathom site ID to Doppler
add_to_doppler() {
  local project_name="$1"
  local site_id="$2"
  local api_token="$3"
  
  echo "Adding Fathom site ID to Doppler project: $project_name"
  
  if command_exists doppler; then
    # Use doppler secrets set instead of upload
    echo "Setting secrets in dev environment..."
    doppler secrets set NEXT_PUBLIC_FATHOM_SITE_ID="$site_id" FATHOM_API_TOKEN="$api_token" --project "$project_name" --config dev
    
    echo "Setting secrets in staging environment..."
    doppler secrets set NEXT_PUBLIC_FATHOM_SITE_ID="$site_id" FATHOM_API_TOKEN="$api_token" --project "$project_name" --config staging
    
    echo "Setting secrets in prod environment..."
    doppler secrets set NEXT_PUBLIC_FATHOM_SITE_ID="$site_id" FATHOM_API_TOKEN="$api_token" --project "$project_name" --config prod
    
    echo "✅ Fathom variables added to Doppler project"
    return 0
  else
    echo "❌ Doppler CLI not found. Please install Doppler CLI."
    echo "Visit https://docs.doppler.com/docs/install-cli for installation instructions."
    return 1
  fi
}

# Main function
main() {
  # Get project name
  PROJECT_NAME=$(get_project_name "$1")
  
  # Get Fathom API token
  FATHOM_API_TOKEN=$(get_fathom_token)
  
  # Create Fathom site
  site_id_output=$(create_fathom_site "$PROJECT_NAME" "$FATHOM_API_TOKEN")
  create_result=$?
  
  if [ $create_result -eq 0 ]; then
    # Extract the site ID from the last line of output
    SITE_ID=$(echo "$site_id_output" | tail -n 1)
    
    # Add site ID to Doppler
    add_to_doppler "$PROJECT_NAME" "$SITE_ID" "$FATHOM_API_TOKEN"
  fi
}

# Check if script is being run directly or sourced
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  # Script is being run directly
  main "$@"
fi 