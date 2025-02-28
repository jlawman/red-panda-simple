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
        echo "Doppler is installed."
        
        # Test project creation
        TEST_PROJECT="test-doppler-project-$$"
        echo "Creating test project: $TEST_PROJECT"
        doppler projects create "$TEST_PROJECT"
        
        # Test secrets operations
        echo "Testing secrets operations..."
        echo '{"TEST_KEY":"test_value"}' > /tmp/test_secrets.json
        doppler secrets upload /tmp/test_secrets.json --project "$TEST_PROJECT" --config dev
        
        # Verify secrets
        echo "Verifying secrets..."
        doppler secrets get TEST_KEY --project "$TEST_PROJECT" --config dev
        
        # Clean up
        echo "Cleaning up test project..."
        doppler projects delete "$TEST_PROJECT" --yes
        rm /tmp/test_secrets.json
        
        echo "Doppler test completed successfully."
    else
        echo "Doppler CLI not found. Please install Doppler CLI."
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
BASE_DIR="$HOME/Documents/adder/100 prototypes"
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
# Automate Vercel setup with predefined answers
echo "y" | vercel link --project "$PROJECT_NAME" --confirm
# Or more comprehensively:
# echo -e "y\nJosh Lawman's projects\nno\n$PROJECT_NAME\n./webapp" | vercel link
vercel git connect
#vercel deploy --yes

# Set up Doppler project and populate with secrets from template
echo "Setting up Doppler project..."
if command -v doppler &> /dev/null; then
    # Create a new Doppler project
    doppler projects create "$PROJECT_NAME"
    
    # Clone secrets from template project (replace TEMPLATE_PROJECT with your template project name)
    TEMPLATE_PROJECT="red-panda-simple"
    echo "Copying secrets from $TEMPLATE_PROJECT to $PROJECT_NAME..."
    
    # Export secrets from template project
    TEMP_SECRETS_FILE="/tmp/doppler_secrets_$$.json"
    doppler secrets download --project "$TEMPLATE_PROJECT" --config dev --format json > "$TEMP_SECRETS_FILE"
    
    # Import secrets to new project
    doppler secrets upload "$TEMP_SECRETS_FILE" --project "$PROJECT_NAME" --config dev
    
    # Clean up temporary file
    rm "$TEMP_SECRETS_FILE"
    
    # Set up Doppler in the project directory
    cd "$FULL_PATH" || exit
    doppler setup --project "$PROJECT_NAME" --config dev
    
    echo "Doppler project setup complete with secrets from template."
else
    echo "Doppler CLI not found. Please install Doppler CLI to set up secrets management."
    echo "Visit https://docs.doppler.com/docs/install-cli for installation instructions."
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