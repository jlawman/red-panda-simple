#!/bin/bash

# Function to prompt for input if not provided
get_project_name() {
    while true; do
        if [ -z "$1" ]; then
            echo "Enter a project name:"
            read PROJECT_NAME
        else
            PROJECT_NAME="$1"
        fi

        if gh repo view "jlawman/$PROJECT_NAME" &>/dev/null; then
            echo "Error: A repository named '$PROJECT_NAME' already exists."
            echo "Please choose a different name."
            set -- "" # Clear the argument to force a prompt in the next iteration
        else
            break
        fi
    done
}

# Function to open URL in default browser
open_url() {
    if command -v open &> /dev/null; then
        open "$1"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "$1"
    elif command -v start &> /dev/null; then
        start "$1"
    else
        echo "Unable to open $1 automatically. Please visit it manually."
    fi
}

# Array of websites to open
websites=(
    "http://www.promptpromptprompt.com"
    "https://adder-analytics-ltd.sentry.io/projects/new/" #Switch to manual installation of token on general settings page
    "https://app.usefathom.com/sites"
    "https://dashboard.clerk.com/apps/new"
    "https://clerk.com/docs/authentication/social-connections/google"
    #"https://console.cloud.google.com/welcome?project=redpanda-438423"
    "https://www.braintrust.dev/app/Adder"
    #"https://fal.ai/dashboard/keys"
    #"https://console.anthropic.com/settings/keys"
    #"https://console.groq.com/keys"
    #"https://platform.openai.com/api-keys"
    #"https://favicon.io/favicon-converter/"
    "https://crop-circle.imageonline.co/"
    "https://vercel.com/josh-lawmans-projects" #"https://vercel.com/new/josh-lawmans-projects"
    "https://ap.www.namecheap.com/"
    #"https://tailwindui.com/components"
    #"https://console.anthropic.com/dashboard"
    #"https://uploadthing.com/dashboard/new"
    #"https://app.pinecone.io/"
    #"https://signin.aws.amazon.com/signin?client_id=arn%3Aaws%3Asignin%3A%3A%3Aconsole%2Fcanvas&redirect_uri=https%3A%2F%2Fconsole.aws.amazon.com%2Fconsole%2Fhome%3FhashArgs%3D%2523%26isauthcode%3Dtrue%26nc2%3Dh_ct%26src%3Dheader-signin%26state%3DhashArgsFromTB_eu-north-1_8229a3adbe919477&page=resolve&code_challenge=mm8BX2OcMycsNlGtPPF0Vkvb1zOsa76NjIJQa0PVZco&code_challenge_method=SHA-256"
    #"https://dashboard.stripe.com/"
)

# Function to test Doppler setup
test_doppler() {
    echo "Testing Doppler functionality..."
    if command -v doppler &> /dev/null; then
        echo "✅ Doppler is installed."
        
        # Test project creation
        TEST_PROJECT="test-doppler-project-$$"
        echo "Creating test project: $TEST_PROJECT"
        doppler projects create "$TEST_PROJECT"
        
        # Test secrets operations
        echo "Testing secrets operations..."
        echo '{"TEST_KEY":"test_value"}' > "/tmp/test_secrets_$$.json"
        
        # Import secrets to test project
        doppler secrets import --project "$TEST_PROJECT" --config dev "/tmp/test_secrets_$$.json"
        
        # Verify secrets
        echo "Verifying secrets..."
        doppler secrets get TEST_KEY --project "$TEST_PROJECT" --config dev
        
        # Show configuration
        echo "Current Doppler configuration:"
        doppler configure
        
        # Clean up
        echo "Cleaning up test project..."
        doppler projects delete "$TEST_PROJECT" --yes
        rm "/tmp/test_secrets_$$.json"
        
        echo "✅ Doppler test completed successfully."
    else
        echo "❌ Doppler CLI not found. Please install Doppler CLI."
        echo "Visit https://docs.doppler.com/docs/install-cli for installation instructions."
    fi
}

# Function to test Vercel setup
test_vercel() {
    echo "Testing Vercel functionality..."
    if command -v vercel &> /dev/null; then
        echo "Vercel is installed."
        vercel --version
        echo "Vercel test completed."
    else
        echo "Vercel CLI not found. Please install Vercel CLI."
    fi
}

# Process command-line arguments for tests
if [ "$1" = "--test-doppler" ]; then
    test_doppler
    exit 0
elif [ "$1" = "--test-vercel" ]; then
    test_vercel
    exit 0
elif [ "$1" = "--help" ]; then
    echo "Usage:"
    echo "  $0 [project_name]         Create a new project"
    echo "  $0 --test-doppler         Test Doppler functionality"
    echo "  $0 --test-vercel          Test Vercel functionality"
    echo "  $0 --help                 Show this help message"
    exit 0
fi

# Get project name from argument or prompt
get_project_name "$1"

# Set variables
BASE_DIR="$HOME/Documents/adder/100-concepts"
FULL_PATH="$BASE_DIR"/$PROJECT_NAME
TEMPLATE="jlawman/red-panda-simple"

# Create the directory
mkdir -p "$FULL_PATH"

# Change to the new directory
cd "$BASE_DIR" || exit

# Create the GitHub repository
gh repo create "$PROJECT_NAME" --template "$TEMPLATE" --private --clone

# Display beautiful instructions for Vercel setup
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    🚀 VERCEL SETUP GUIDE 🚀                    ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  When prompted for vercel settings:                            ║"
echo "║                                                                ║"
echo "║  1. Use the default settings for most options                  ║"
echo "║  2. IMPORTANT: When asked about the directory to deploy,       ║"
echo "║     specify 'webapp' instead of the default                    ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cd "$FULL_PATH" || exit
echo "Setting up Vercel..."

# Link to Vercel project directly specifying webapp as the root directory
echo "Linking to Vercel project with webapp as root directory..."
vercel link --project "$PROJECT_NAME"
vercel git connect

# Set up Doppler project and populate with secrets from template
echo "Setting up Doppler project..."
if command -v doppler &> /dev/null; then
    # Create a new Doppler project
    doppler projects create "$PROJECT_NAME"
    
    # Clone secrets from template project
    TEMPLATE_PROJECT="red-panda-simple"
    echo "Copying secrets from $TEMPLATE_PROJECT to $PROJECT_NAME..."
    
    # Get all secrets from the template project
    echo "Fetching all secrets from template project..."
    
    # Get a list of all secret names from the template project
    SECRET_NAMES=$(doppler secrets --project "$TEMPLATE_PROJECT" --config dev --only-names 2>/dev/null)
    
    if [ $? -eq 0 ] && [ -n "$SECRET_NAMES" ]; then
        # Copy each secret one by one
        echo "$SECRET_NAMES" | while read -r SECRET_NAME; do
            if [ -n "$SECRET_NAME" ]; then
                # Get the secret value from the template project
                SECRET_VALUE=$(doppler secrets get "$SECRET_NAME" --project "$TEMPLATE_PROJECT" --config dev --plain 2>/dev/null)
                
                # If the secret exists and has a value, set it in the new project
                if [ -n "$SECRET_VALUE" ]; then
                    echo "Setting $SECRET_NAME..."
                    doppler secrets set "$SECRET_NAME=$SECRET_VALUE" --project "$PROJECT_NAME" --config dev
                    doppler secrets set "$SECRET_NAME=$SECRET_VALUE" --project "$PROJECT_NAME" --config staging
                    doppler secrets set "$SECRET_NAME=$SECRET_VALUE" --project "$PROJECT_NAME" --config prod
                fi
            fi
        done
        
        # Set up Doppler in the project directory
        cd "$FULL_PATH" || exit
        echo "Configuring Doppler in project directory..."
        doppler setup --project "$PROJECT_NAME" --config dev
        
        # Verify setup was successful
        echo "Verifying Doppler setup..."
        SETUP_INFO=$(doppler configure)
        echo "$SETUP_INFO"
        
        echo "✅ Doppler project setup complete."
    else
        echo "❌ Failed to fetch secrets from template project. Please check if the template project exists and you have access to it."
    fi
else
    echo "Doppler CLI not found. Please install Doppler CLI to set up secrets management."
    echo "Visit https://docs.doppler.com/docs/install-cli for installation instructions."
fi

# Ask if user wants to track analytics
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    📊 ANALYTICS SETUP 📊                       ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  Would you like to set up Fathom Analytics for this project?   ║"
echo "║  This will create a Fathom site and add the site ID to Doppler ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
read -p "Set up analytics? (Y/n): " setup_analytics
setup_analytics=${setup_analytics:-Y}  # Default to Y if empty

# Set up Fathom Analytics site and add to Doppler if user wants to
if [[ "$setup_analytics" =~ ^[Yy]$ ]]; then
    echo "Setting up Fathom Analytics site..."
    if [ -f "./fathom-setup.sh" ]; then
        # Check if FATHOM_API_TOKEN is set
        if [ -z "$FATHOM_API_TOKEN" ]; then
            echo "⚠️ FATHOM_API_TOKEN environment variable is not set."
            echo "Skipping Fathom Analytics setup."
        else
            # Source the Fathom setup script to use its functions
            source ./fathom-setup.sh
            
            # Create Fathom site
            site_id_output=$(create_fathom_site "$PROJECT_NAME" "$FATHOM_API_TOKEN")
            create_result=$?
            
            if [ $create_result -eq 0 ]; then
                # Extract the site ID from the last line of output
                SITE_ID=$(echo "$site_id_output" | tail -n 1)
                
                # Add site ID to Doppler
                add_to_doppler "$PROJECT_NAME" "$SITE_ID" "$FATHOM_API_TOKEN"
                
                echo "✅ Fathom Analytics setup complete."
            else
                echo "❌ Failed to create Fathom Analytics site."
            fi
        fi
    else
        echo "❌ Fathom setup script not found. Please ensure fathom-setup.sh is in the same directory."
    fi
else
    echo "Skipping Fathom Analytics setup as requested."
fi

# Install npm dependencies in the app folder
echo "Installing npm dependencies..."
cd "$FULL_PATH/webapp" || exit
npm i
cd "$FULL_PATH" || exit

#vercel.json starting point - but broke things
# {
#     "builds": [
#       {
#         "src": "app/**/*",
#         "use": "@vercel/next"
#       }
#     ]
#   }

# Open the repository in GitHub Desktop
if command -v github &> /dev/null; then
    github "$FULL_PATH"
    echo "Repository opened in GitHub Desktop."
else
    echo "GitHub Desktop command not found. Please ensure GitHub Desktop is installed and the CLI tool is in your PATH."
    echo "You can open the project manually in GitHub Desktop."
fi

# Check if Cursor is installed and in PATH
if command -v cursor &> /dev/null; then
    cursor "$FULL_PATH"
    echo "Project $PROJECT_NAME has been created and opened in Cursor."
else
    echo "Cursor command not found. Please ensure Cursor is installed and in your PATH."
    echo "You can open the project manually at: $FULL_PATH"
    # Attempt to open the directory in Finder
    open "$FULL_PATH"
fi

# Open websites
echo "Opening websites..."
for site in "${websites[@]}"; do
    open_url "$site"
    echo "Opened: $site"
done

echo "Project setup complete."