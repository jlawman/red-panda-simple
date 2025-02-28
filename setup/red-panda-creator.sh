#!/bin/bash

# Define color codes for beautiful logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
UNDERLINE='\033[4m'
RESET='\033[0m'

# Function for styled logging
log_info() {
    echo -e "${BLUE}ℹ️  ${BOLD}INFO:${RESET} $1"
}

log_success() {
    echo -e "${GREEN}✅ ${BOLD}SUCCESS:${RESET} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠️  ${BOLD}WARNING:${RESET} $1"
}

log_error() {
    echo -e "${RED}❌ ${BOLD}ERROR:${RESET} $1"
}

log_step() {
    echo -e "\n${CYAN}🔷 ${BOLD}STEP:${RESET} ${UNDERLINE}$1${RESET}"
}

log_section() {
    echo -e "\n${MAGENTA}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
    echo -e "${MAGENTA}${BOLD}  $1${RESET}"
    echo -e "${MAGENTA}${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
}

# Function to prompt for input if not provided
get_project_name() {
    while true; do
        if [ -z "$1" ]; then
            log_info "Enter a project name:"
            read PROJECT_NAME
        else
            PROJECT_NAME="$1"
        fi

        if gh repo view "jlawman/$PROJECT_NAME" &>/dev/null; then
            log_error "A repository named '$PROJECT_NAME' already exists."
            log_info "Please choose a different name."
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
        log_warning "Unable to open $1 automatically. Please visit it manually."
    fi
}

# Array of websites to open
websites=(
    "http://www.promptpromptprompt.com"
    "https://adder-analytics-ltd.sentry.io/projects/new/" #Switch to manual installation of token on general settings page
    #"https://app.usefathom.com/sites"
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
    log_section "DOPPLER TEST"
    log_info "Testing Doppler functionality..."
    if command -v doppler &> /dev/null; then
        log_success "Doppler is installed."
        
        # Test project creation
        TEST_PROJECT="test-doppler-project-$$"
        log_step "Creating test project: $TEST_PROJECT"
        doppler projects create "$TEST_PROJECT"
        
        # Test secrets operations
        log_step "Testing secrets operations..."
        echo '{"TEST_KEY":"test_value"}' > "/tmp/test_secrets_$$.json"
        
        # Import secrets to test project
        doppler secrets import --project "$TEST_PROJECT" --config dev "/tmp/test_secrets_$$.json"
        
        # Verify secrets
        log_info "Verifying secrets..."
        doppler secrets get TEST_KEY --project "$TEST_PROJECT" --config dev
        
        # Show configuration
        log_info "Current Doppler configuration:"
        doppler configure
        
        # Clean up
        log_step "Cleaning up test project..."
        doppler projects delete "$TEST_PROJECT" --yes
        rm "/tmp/test_secrets_$$.json"
        
        log_success "Doppler test completed successfully."
    else
        log_error "Doppler CLI not found. Please install Doppler CLI."
        log_info "Visit https://docs.doppler.com/docs/install-cli for installation instructions."
    fi
}

# Function to test Vercel setup
test_vercel() {
    log_section "VERCEL TEST"
    log_info "Testing Vercel functionality..."
    if command -v vercel &> /dev/null; then
        log_success "Vercel is installed."
        vercel --version
        log_info "Vercel test completed."
    else
        log_error "Vercel CLI not found. Please install Vercel CLI."
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
    echo -e "${CYAN}${BOLD}Usage:${RESET}"
    echo -e "  ${BOLD}$0 [project_name]${RESET}         Create a new project"
    echo -e "  ${BOLD}$0 --test-doppler${RESET}         Test Doppler functionality"
    echo -e "  ${BOLD}$0 --test-vercel${RESET}          Test Vercel functionality"
    echo -e "  ${BOLD}$0 --help${RESET}                 Show this help message"
    exit 0
fi

# Get project name from argument or prompt
get_project_name "$1"

# Set variables
BASE_DIR="$HOME/Documents/adder/100-concepts"
FULL_PATH="$BASE_DIR"/$PROJECT_NAME
TEMPLATE="jlawman/red-panda-simple"

log_section "🚀 CREATING PROJECT: $PROJECT_NAME"

# Create the directory
log_step "Creating project directory"
mkdir -p "$FULL_PATH"

# Change to the new directory
cd "$BASE_DIR" || exit

# Create the GitHub repository
log_step "Creating GitHub repository from template"
gh repo create "$PROJECT_NAME" --template "$TEMPLATE" --private --clone

# Display beautiful instructions for Vercel setup
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo -e "║                    ${CYAN}🚀 VERCEL SETUP GUIDE 🚀${RESET}                    ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo -e "║  When prompted for vercel settings:                            ║"
echo "║                                                                ║"
echo -e "║  ${GREEN}1. Use the default settings for most options${RESET}                  ║"
echo -e "║  ${RED}2. IMPORTANT: When asked about the directory to deploy,       ║"
echo -e "║     specify 'webapp' instead of the default${RESET}                    ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

cd "$FULL_PATH" || exit
log_section "VERCEL SETUP"

# Link to Vercel project directly specifying webapp as the root directory
log_step "Linking to Vercel project with webapp as root directory"
vercel link --project "$PROJECT_NAME"
vercel git connect

# Set up Doppler project and populate with secrets from template
log_section "DOPPLER SETUP"
if command -v doppler &> /dev/null; then
    # Create a new Doppler project
    log_step "Creating Doppler project"
    doppler projects create "$PROJECT_NAME"
    
    # Clone secrets from template project using doppler-copy.sh
    TEMPLATE_PROJECT="red-panda-simple"
    log_info "Copying secrets from $TEMPLATE_PROJECT to $PROJECT_NAME..."
    
    # Get the directory where the current script is located
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    
    if [ -f "$SCRIPT_DIR/doppler-copy.sh" ]; then
        # Source the Doppler copy script to use its functions
        source "$SCRIPT_DIR/doppler-copy.sh"
        
        # Copy secrets from template project to new project
        log_step "Copying Doppler secrets from template"
        copy_doppler_secrets "$TEMPLATE_PROJECT" "$PROJECT_NAME"
        
        # Set up Doppler in the project directory
        cd "$FULL_PATH" || exit
        log_step "Configuring Doppler in project directory"
        doppler setup --project "$PROJECT_NAME" --config dev
        
        # Verify setup was successful
        log_info "Verifying Doppler setup..."
        SETUP_INFO=$(doppler configure)
        echo "$SETUP_INFO"
        
        log_success "Doppler project setup complete."
    else
        log_error "Doppler copy script not found. Please ensure doppler-copy.sh is in the same directory as this script."
        log_info "Falling back to manual secret copying..."
        
        # Get all secrets from the template project
        log_info "Fetching all secrets from template project..."
        
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
                        log_info "Setting $SECRET_NAME..."
                        doppler secrets set "$SECRET_NAME=$SECRET_VALUE" --project "$PROJECT_NAME" --config dev
                        doppler secrets set "$SECRET_NAME=$SECRET_VALUE" --project "$PROJECT_NAME" --config staging
                        doppler secrets set "$SECRET_NAME=$SECRET_VALUE" --project "$PROJECT_NAME" --config prod
                    fi
                fi
            done
            
            # Set up Doppler in the project directory
            cd "$FULL_PATH" || exit
            log_step "Configuring Doppler in project directory"
            doppler setup --project "$PROJECT_NAME" --config dev
            
            # Verify setup was successful
            log_info "Verifying Doppler setup..."
            SETUP_INFO=$(doppler configure)
            echo "$SETUP_INFO"
            
            log_success "Doppler project setup complete."
        else
            log_error "Failed to fetch secrets from template project. Please check if the template project exists and you have access to it."
        fi
    fi
else
    log_error "Doppler CLI not found. Please install Doppler CLI to set up secrets management."
    log_info "Visit https://docs.doppler.com/docs/install-cli for installation instructions."
fi

# Ask if user wants to track analytics
echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo -e "║                    ${CYAN}📊 ANALYTICS SETUP 📊${RESET}                       ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo -e "║  Would you like to set up Fathom Analytics for this project?   ║"
echo -e "║  This will create a Fathom site and add the site ID to Doppler ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
read -p "$(echo -e "${YELLOW}Set up analytics? (Y/n):${RESET} ")" setup_analytics
setup_analytics=${setup_analytics:-Y}  # Default to Y if empty

# Set up Fathom Analytics site and add to Doppler if user wants to
if [[ "$setup_analytics" =~ ^[Yy]$ ]]; then
    log_section "FATHOM ANALYTICS SETUP"
    
    # Get the directory where the current script is located
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    
    if [ -f "$SCRIPT_DIR/fathom-setup.sh" ]; then
        # Check if FATHOM_API_TOKEN is set
        if [ -z "$FATHOM_API_TOKEN" ]; then
            log_warning "FATHOM_API_TOKEN environment variable is not set."
            log_info "Skipping Fathom Analytics setup."
        else
            # Source the Fathom setup script to use its functions
            source "$SCRIPT_DIR/fathom-setup.sh"
            
            # Create Fathom site
            log_step "Creating Fathom site"
            site_id_output=$(create_fathom_site "$PROJECT_NAME" "$FATHOM_API_TOKEN")
            create_result=$?
            
            if [ $create_result -eq 0 ]; then
                # Extract the site ID from the last line of output
                SITE_ID=$(echo "$site_id_output" | tail -n 1)
                
                # Add site ID to Doppler
                log_step "Adding site ID to Doppler"
                add_to_doppler "$PROJECT_NAME" "$SITE_ID" "$FATHOM_API_TOKEN"
                
                log_success "Fathom Analytics setup complete."
            else
                log_error "Failed to create Fathom Analytics site."
            fi
        fi
    else
        log_error "Fathom setup script not found. Please ensure fathom-setup.sh is in the same directory as this script."
    fi
else
    log_info "Skipping Fathom Analytics setup as requested."
fi

# Install npm dependencies in the app folder
log_section "DEPENDENCIES INSTALLATION"
log_step "Installing npm dependencies"
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

log_section "OPENING PROJECT"
# Open the repository in GitHub Desktop
if command -v github &> /dev/null; then
    github "$FULL_PATH"
    log_success "Repository opened in GitHub Desktop."
else
    log_warning "GitHub Desktop command not found. Please ensure GitHub Desktop is installed and the CLI tool is in your PATH."
    log_info "You can open the project manually in GitHub Desktop."
fi

# Check if Cursor is installed and in PATH
if command -v cursor &> /dev/null; then
    cursor "$FULL_PATH"
    log_success "Project $PROJECT_NAME has been created and opened in Cursor."
else
    log_warning "Cursor command not found. Please ensure Cursor is installed and in your PATH."
    log_info "You can open the project manually at: $FULL_PATH"
    # Attempt to open the directory in Finder
    open "$FULL_PATH"
fi

# Open websites
log_section "OPENING WEBSITES"
log_step "Opening required websites"
for site in "${websites[@]}"; do
    open_url "$site"
    log_info "Opened: $site"
done

log_section "✨ PROJECT SETUP COMPLETE ✨"
echo -e "${GREEN}${BOLD}"
echo "  _____ _                 _____    ____        _ _     _ "
echo " |_   _(_)_ __ ___   ___|_   _|__| __ ) _   _(_) | __| |"
echo "   | | | | '_ \` _ \ / _ \ | |/ _ \  _ \| | | | | |/ _\` |"
echo "   | | | | | | | | |  __/ | | (_) | |_) | |_| | | | (_| |"
echo "   |_| |_|_| |_| |_|\___| |_|\___/|____/ \__,_|_|_|\__,_|"
echo "                                                           "
echo -e "${RESET}"
echo -e "${CYAN}${BOLD}Project Name:${RESET} ${PROJECT_NAME}"
echo -e "${CYAN}${BOLD}Location:${RESET} ${FULL_PATH}"
echo -e "${CYAN}${BOLD}Template:${RESET} ${TEMPLATE}"
echo ""