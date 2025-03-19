#!/bin/bash

# Source utility scripts
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$SCRIPT_DIR/utils/logging.sh"
source "$SCRIPT_DIR/utils/browser.sh"
source "$SCRIPT_DIR/utils/doppler-utils.sh"
source "$SCRIPT_DIR/utils/interactive.sh"

# Function to display help message
show_help() {
    echo "Red Panda Creator - A setup script for Red Panda projects"
    echo ""
    echo "Usage: $0 [options] [project_name]"
    echo ""
    echo "Options:"
    echo "  -h, --help             Show this help message"
    echo "  -i, --interactive      Use interactive mode with TUI (requires whiptail or dialog)"
    echo "  --skip-github          Skip GitHub repository creation"
    echo "  --skip-vercel          Skip Vercel project setup"
    echo "  --skip-websites        Skip opening related websites"
    echo "  --skip                 Skip all optional components (GitHub, Vercel, websites)"
    echo ""
    echo "Example:"
    echo "  $0 my-project          Create a project named 'my-project'"
    echo "  $0 -i                  Run in interactive mode and prompt for project name"
    echo "  $0 --skip-github my-project   Create 'my-project' without GitHub integration"
    echo ""
    exit 0
}

# Initialize variables and flags
SKIP_GITHUB=false
SKIP_VERCEL=false
SKIP_WEBSITES=false
INTERACTIVE_MODE=false

# Parse command line arguments
for arg in "$@"; do
  if [[ "$arg" == "--help" ]] || [[ "$arg" == "-h" ]]; then
    show_help
  elif [[ "$arg" == "--skip" ]]; then
    SKIP_GITHUB=true
    SKIP_VERCEL=true
    SKIP_WEBSITES=true
    log_info "Skipping GitHub, Vercel setup, and website opening as requested"
  elif [[ "$arg" == "--skip-github" ]]; then
    SKIP_GITHUB=true
    log_info "Skipping GitHub setup as requested"
  elif [[ "$arg" == "--skip-vercel" ]]; then
    SKIP_VERCEL=true
    log_info "Skipping Vercel setup as requested"
  elif [[ "$arg" == "--skip-websites" ]]; then
    SKIP_WEBSITES=true
    log_info "Skipping website opening as requested"
  elif [[ "$arg" == "--interactive" ]] || [[ "$arg" == "-i" ]]; then
    if is_interactive_available; then
      INTERACTIVE_MODE=true
      log_info "Using interactive mode"
    else
      log_warning "Interactive mode requested but whiptail/dialog not available. Falling back to command line."
      log_info "To use interactive mode, install whiptail: 'apt-get install whiptail' or 'brew install ncurses'"
    fi
  fi
done

# Function to prompt for input if not provided
get_project_name() {
    while true; do
        if [ -z "$1" ] || [[ "$1" == --* ]]; then
            if [ "$INTERACTIVE_MODE" = true ]; then
                PROJECT_NAME=$(get_input "Project Setup" "Enter a project name (no spaces allowed):" "")
                [ $? -ne 0 ] && exit 1  # User cancelled
            else
                log_info "Enter a project name (no spaces allowed):"
                read PROJECT_NAME
            fi
        else
            PROJECT_NAME="$1"
        fi
        
        # Check for spaces in the project name
        if [[ "$PROJECT_NAME" == *" "* ]]; then
            if [ "$INTERACTIVE_MODE" = true ]; then
                show_message "Error" "Project name '$PROJECT_NAME' contains spaces.\nPlease enter a name without spaces."
            else
                log_error "Project name '$PROJECT_NAME' contains spaces."
                log_info "Please enter a name without spaces."
            fi
            set -- "" # Clear the argument to force a prompt in the next iteration
            continue
        fi

        # Only check for existing repo if we're not skipping GitHub
        if [ "$SKIP_GITHUB" = false ] && gh repo view "jlawman/$PROJECT_NAME" &>/dev/null; then
            if [ "$INTERACTIVE_MODE" = true ]; then
                show_message "Error" "A repository named '$PROJECT_NAME' already exists.\nPlease choose a different name."
            else
                log_error "A repository named '$PROJECT_NAME' already exists."
                log_info "Please choose a different name."
            fi
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

# Get project name from argument or prompt
# Filter out any --skip arguments
ARGS=()
for arg in "$@"; do
    if [[ ! "$arg" == --* ]]; then
        ARGS+=("$arg")
    fi
done
get_project_name "${ARGS[0]}"

# Set variables
BASE_DIR="$HOME/Documents/adder/100-concepts"
FULL_PATH="$BASE_DIR"/$PROJECT_NAME
TEMPLATE="jlawman/red-panda-simple"

log_section "🚀 CREATING PROJECT: $PROJECT_NAME"

# If in interactive mode, show welcome screen and configuration options
if [ "$INTERACTIVE_MODE" = true ]; then
    show_welcome
    
    # Configuration menu
    OPTIONS=(
        "github" "Setup GitHub repository" 
        "vercel" "Setup Vercel deployment" 
        "websites" "Open related websites after setup"
    )
    
    SELECTED=$(show_checklist "Configuration" "Select which components to include:" \
        "github" "GitHub repository setup" "ON" \
        "vercel" "Vercel deployment setup" "ON" \
        "websites" "Open websites after setup" "ON")
    
    # Parse selected options
    [[ "$SELECTED" != *"github"* ]] && SKIP_GITHUB=true
    [[ "$SELECTED" != *"vercel"* ]] && SKIP_VERCEL=true
    [[ "$SELECTED" != *"websites"* ]] && SKIP_WEBSITES=true
    
    # Show progress updates as we go
    PROGRESS=0
    show_progress "Setup Progress" $PROGRESS "Creating project directory..."
fi

# Create the directory
log_step "Creating project directory"
mkdir -p "$FULL_PATH"

# Change to the new directory
cd "$BASE_DIR" || exit

# Update progress if in interactive mode
if [ "$INTERACTIVE_MODE" = true ]; then
    PROGRESS=10
    show_progress "Setup Progress" $PROGRESS "Setting up GitHub repository..."
fi

# Create the GitHub repository if not skipped
if [ "$SKIP_GITHUB" = false ]; then
    log_section "GITHUB SETUP"
    log_step "Creating GitHub repository from template"
    gh repo create "$PROJECT_NAME" --template "$TEMPLATE" --private --clone
    
    # Update progress if in interactive mode
    if [ "$INTERACTIVE_MODE" = true ]; then
        PROGRESS=25
        show_progress "Setup Progress" $PROGRESS "GitHub repository created..."
    fi
else
    log_info "Skipping GitHub repository creation"
    # If we're skipping GitHub, we need to manually clone the template
    log_step "Cloning template repository"
    git clone "https://github.com/$TEMPLATE.git" "$PROJECT_NAME"
    # Remove the .git directory to disconnect from the template repo
    rm -rf "$PROJECT_NAME/.git"
    # Initialize a new git repository
    cd "$PROJECT_NAME" || exit
    git init
    git add .
    git commit -m "Initial commit from template"
    cd "$BASE_DIR" || exit
    
    # Update progress if in interactive mode
    if [ "$INTERACTIVE_MODE" = true ]; then
        PROGRESS=25
        show_progress "Setup Progress" $PROGRESS "Template repository cloned..."
    fi
fi

# Only show Vercel setup instructions and perform Vercel setup if not skipped
if [ "$SKIP_VERCEL" = false ]; then
    cd "$FULL_PATH" || exit
    log_section "VERCEL SETUP"

    # Create Vercel configuration
    log_step "Creating Vercel configuration for frontend directory"
    
    # Create a .vercel directory with project configuration
    mkdir -p "$FULL_PATH/.vercel"
    
    # Generate a project ID - not ideal but will be replaced by Vercel
    PROJECT_ID=$(openssl rand -hex 16)
    
    # Create project.json with required configurations
    cat > "$FULL_PATH/.vercel/project.json" << EOF
{
  "projectId": "$PROJECT_ID",
  "orgId": null,
  "settings": {
    "framework": "nextjs",
    "devCommand": "npm run dev",
    "installCommand": "npm install",
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "rootDirectory": "frontend",
    "directoryListing": false
  }
}
EOF
    
    log_info "Pre-configured Vercel to use frontend as the root directory"

    # Link to Vercel project
    log_step "Linking to Vercel project"
    cd "$FULL_PATH" || exit
    vercel link --confirm
    
    # Set up Git integration
    log_step "Setting up Git integration with Vercel"
    vercel git connect --confirm

    # Create vercel.json in root to ensure consistent configuration
    cat > "$FULL_PATH/vercel.json" << EOF
{
  "rootDirectory": "frontend"
}
EOF
    
    # Deploy to ensure settings are applied (only if project setup is complete)
    if [ -d "$FULL_PATH/frontend" ] && [ -f "$FULL_PATH/frontend/package.json" ]; then
        log_step "Making initial deployment to finalize settings"
        cd "$FULL_PATH" || exit
        vercel --yes
    else
        log_info "Skipping initial deployment - frontend directory not fully set up yet"
    fi
    
    # Update progress if in interactive mode
    if [ "$INTERACTIVE_MODE" = true ]; then
        PROGRESS=40
        show_progress "Setup Progress" $PROGRESS "Vercel project configured with frontend as root..."
    fi
else
    log_info "Skipping Vercel setup"
    cd "$FULL_PATH" || exit
    
    # Update progress if in interactive mode
    if [ "$INTERACTIVE_MODE" = true ]; then
        PROGRESS=40
        show_progress "Setup Progress" $PROGRESS "Proceeding with Doppler setup..."
    fi
fi

# Set up Doppler project and populate with secrets from template
log_section "DOPPLER SETUP"
if command -v doppler &> /dev/null; then
    setup_doppler "$PROJECT_NAME" "$FULL_PATH" "red-panda-simple"
    
    # Update progress if in interactive mode
    if [ "$INTERACTIVE_MODE" = true ]; then
        PROGRESS=60
        show_progress "Setup Progress" $PROGRESS "Doppler setup completed..."
    fi
else
    log_error "Doppler CLI not found. Please install Doppler CLI to set up secrets management."
    log_info "Visit https://docs.doppler.com/docs/install-cli for installation instructions."
    
    # Update progress if in interactive mode
    if [ "$INTERACTIVE_MODE" = true ]; then
        PROGRESS=60
        show_progress "Setup Progress" $PROGRESS "Doppler setup skipped (not installed)..."
    fi
fi

# Push Doppler secrets to Vercel if requested
if [ "$SKIP_VERCEL" = false ]; then
    log_section "PUSHING SECRETS TO VERCEL"
    
    if [ "$INTERACTIVE_MODE" = true ]; then
        ask_yes_no "Vercel Secrets" "Would you like to push Doppler secrets to Vercel?" "yes"
        push_secrets=$?  # 0 for yes, 1 for no
        push_secrets=$((1-push_secrets))  # Invert to match our script logic (1=yes, 0=no)
    else
        log_info "Would you like to push Doppler secrets to Vercel?"
        read -p "$(echo -e "${YELLOW}Push secrets to Vercel? (Y/n):${RESET} ")" push_secrets_input
        push_secrets_input=${push_secrets_input:-Y}  # Default to Y if empty
        [[ "$push_secrets_input" =~ ^[Yy]$ ]] && push_secrets=1 || push_secrets=0
    fi

    if [ $push_secrets -eq 1 ]; then
        push_doppler_to_vercel "$PROJECT_NAME" "dev"
        
        # Update progress if in interactive mode and push secrets to Vercel
        if [ "$INTERACTIVE_MODE" = true ]; then
            PROGRESS=70
            show_progress "Setup Progress" $PROGRESS "Doppler secrets pushed to Vercel..."
        fi
    else
        log_info "Skipping secrets push to Vercel."
    fi
fi

# Ask if user wants to track analytics
if [ "$INTERACTIVE_MODE" = true ]; then
    ask_yes_no "Analytics Setup" "Would you like to set up Fathom Analytics for this project?\nThis will create a Fathom site and add the site ID to Doppler." "yes"
    setup_analytics=$?
    setup_analytics=$((1-setup_analytics))  # Invert to match our script logic
else
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
    read -p "$(echo -e "${YELLOW}Set up analytics? (Y/n):${RESET} ")" setup_analytics_input
    setup_analytics_input=${setup_analytics_input:-Y}  # Default to Y if empty
    [[ "$setup_analytics_input" =~ ^[Yy]$ ]] && setup_analytics=1 || setup_analytics=0
fi

# Set up Fathom Analytics site and add to Doppler if user wants to
if [ $setup_analytics -eq 1 ]; then
    log_section "FATHOM ANALYTICS SETUP"
    
    # Get the directory where the current script is located
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    
    # Try multiple possible locations for the fathom-setup.sh file
    FATHOM_SCRIPT=""
    
    # Check in the same directory as this script
    if [ -f "$SCRIPT_DIR/fathom-setup.sh" ]; then
        FATHOM_SCRIPT="$SCRIPT_DIR/fathom-setup.sh"
    # Check in the setup directory relative to the current directory
    elif [ -f "./setup/fathom-setup.sh" ]; then
        FATHOM_SCRIPT="./setup/fathom-setup.sh"
    # Check in the parent directory's setup folder
    elif [ -f "../setup/fathom-setup.sh" ]; then
        FATHOM_SCRIPT="../setup/fathom-setup.sh"
    fi
    
    if [ -n "$FATHOM_SCRIPT" ]; then
        # Check if FATHOM_API_TOKEN is set
        if [ -z "$FATHOM_API_TOKEN" ]; then
            log_warning "FATHOM_API_TOKEN environment variable is not set."
            
            # Try to get the token from Doppler
            if command -v doppler &> /dev/null; then
                log_info "Attempting to get Fathom API token from Doppler..."
                FATHOM_API_TOKEN=$(doppler secrets get FATHOM_API_KEY --plain 2>/dev/null || echo "")
                
                if [ -n "$FATHOM_API_TOKEN" ]; then
                    log_success "Successfully retrieved Fathom API token from Doppler."
                else
                    log_info "Could not retrieve Fathom API token from Doppler."
                    log_info "Skipping Fathom Analytics setup."
                fi
            else
                log_info "Doppler CLI not found. Cannot retrieve Fathom API token."
                log_info "Skipping Fathom Analytics setup."
            fi
        fi
        
        # Only proceed if we have a token
        if [ -n "$FATHOM_API_TOKEN" ]; then
            # Source the Fathom setup script to use its functions
            log_step "Using Fathom setup script: $FATHOM_SCRIPT"
            source "$FATHOM_SCRIPT"
            
            # Create Fathom site
            log_step "Creating Fathom site"
            
            # Check if create-fathom-site.sh exists in the same directory as fathom-setup.sh
            CREATE_SCRIPT_DIR=$(dirname "$FATHOM_SCRIPT")
            CREATE_SCRIPT="$CREATE_SCRIPT_DIR/create-fathom-site.sh"
            
            if [ ! -f "$CREATE_SCRIPT" ]; then
                log_error "Failed to find create-fathom-site.sh script at $CREATE_SCRIPT"
                log_info "This script is required to create a Fathom Analytics site."
                log_info "Please ensure create-fathom-site.sh is in the same directory as fathom-setup.sh."
                continue
            fi
            
            # Check if the script is executable
            if [ ! -x "$CREATE_SCRIPT" ]; then
                log_warning "create-fathom-site.sh is not executable. Attempting to make it executable..."
                chmod +x "$CREATE_SCRIPT"
                if [ ! -x "$CREATE_SCRIPT" ]; then
                    log_error "Failed to make create-fathom-site.sh executable."
                    log_info "Please run: chmod +x $CREATE_SCRIPT"
                    continue
                fi
            fi
            
            # Run the create_fathom_site function with debug output
            log_info "Executing create_fathom_site function with project name: $PROJECT_NAME"
            site_id_output=$(create_fathom_site "$PROJECT_NAME" 2>&1)
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
                log_info "Error details:"
                echo "$site_id_output" | sed 's/^/    /'
                log_info "To debug, try running these commands manually:"
                log_info "    cd $FULL_PATH"
                log_info "    $FATHOM_SCRIPT $PROJECT_NAME"
            fi
        fi
    else
        log_error "Fathom setup script not found. Please ensure fathom-setup.sh is in the setup directory."
        log_info "Looked in: $SCRIPT_DIR, ./setup/, and ../setup/"
    fi
else
    log_info "Skipping Fathom Analytics setup as requested."
fi

# Update progress if in interactive mode and set up Fathom Analytics
if [ "$INTERACTIVE_MODE" = true ] && [ $setup_analytics -eq 1 ]; then
    PROGRESS=80
    show_progress "Setup Progress" $PROGRESS "Analytics setup completed..."
elif [ "$INTERACTIVE_MODE" = true ]; then
    PROGRESS=80
    show_progress "Setup Progress" $PROGRESS "Proceeding with dependency installation..."
fi

# Install npm dependencies in the app folder
log_section "DEPENDENCIES INSTALLATION"
log_step "Installing npm dependencies"

if [ "$INTERACTIVE_MODE" = true ]; then
    # Show a message that this might take a while
    show_message "Dependencies" "Now installing npm dependencies...\n\nThis may take a few minutes. Please wait."
    
    # Update progress
    PROGRESS=85
    show_progress "Setup Progress" $PROGRESS "Installing dependencies..."
fi

cd "$FULL_PATH/frontend" || exit
npm i
cd "$FULL_PATH" || exit

# Update progress if in interactive mode after npm install
if [ "$INTERACTIVE_MODE" = true ]; then
    PROGRESS=95
    show_progress "Setup Progress" $PROGRESS "Dependencies installed, finalizing..."
fi

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

# Only open websites if not skipped
if [ "$SKIP_WEBSITES" = false ]; then
    log_section "OPENING WEBSITES"
    log_step "Opening required websites"
    open_websites
else
    log_info "Skipping website opening as requested."
fi

# Update progress if in interactive mode just before completion
if [ "$INTERACTIVE_MODE" = true ]; then
    PROGRESS=100
    show_progress "Setup Progress" $PROGRESS "Setup complete!"
    sleep 1  # Give the user a moment to see 100%
fi

# Show completion message
if [ "$INTERACTIVE_MODE" = true ]; then
    show_completion "$PROJECT_NAME" "$FULL_PATH"
else
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
fi