#!/bin/bash

# Interactive mode utilities for Red Panda Creator
# This script provides TUI (Text User Interface) functions using whiptail or dialog

# Determine which TUI tool is available
if command -v whiptail &> /dev/null; then
    TUI_TOOL="whiptail"
elif command -v dialog &> /dev/null; then
    TUI_TOOL="dialog"
else
    TUI_TOOL="none"
fi

# Function to check if interactive mode is available
is_interactive_available() {
    [ "$TUI_TOOL" != "none" ]
    return $?
}

# Function to display a message box
show_message() {
    local TITLE="$1"
    local MESSAGE="$2"
    local HEIGHT=${3:-10}
    local WIDTH=${4:-60}
    
    if [ "$TUI_TOOL" = "whiptail" ]; then
        whiptail --title "$TITLE" --msgbox "$MESSAGE" $HEIGHT $WIDTH
    elif [ "$TUI_TOOL" = "dialog" ]; then
        dialog --title "$TITLE" --msgbox "$MESSAGE" $HEIGHT $WIDTH
    else
        echo -e "\n=== $TITLE ===\n$MESSAGE\n"
    fi
}

# Function to get user input
get_input() {
    local TITLE="$1"
    local PROMPT="$2"
    local DEFAULT="$3"
    local HEIGHT=${4:-10}
    local WIDTH=${5:-60}
    local RESULT=""
    
    if [ "$TUI_TOOL" = "whiptail" ]; then
        RESULT=$(whiptail --title "$TITLE" --inputbox "$PROMPT" $HEIGHT $WIDTH "$DEFAULT" 3>&1 1>&2 2>&3)
    elif [ "$TUI_TOOL" = "dialog" ]; then
        RESULT=$(dialog --title "$TITLE" --inputbox "$PROMPT" $HEIGHT $WIDTH "$DEFAULT" 3>&1 1>&2 2>&3)
    else
        echo -e "\n=== $TITLE ===\n$PROMPT"
        read -p "[default: $DEFAULT] " input
        RESULT=${input:-$DEFAULT}
    fi
    
    echo "$RESULT"
}

# Function to display a yes/no question
ask_yes_no() {
    local TITLE="$1"
    local QUESTION="$2"
    local DEFAULT=${3:-"yes"}
    local HEIGHT=${4:-10}
    local WIDTH=${5:-60}
    local RESULT=0
    
    if [ "$TUI_TOOL" = "whiptail" ]; then
        if [ "$DEFAULT" = "yes" ]; then
            whiptail --title "$TITLE" --yesno "$QUESTION" $HEIGHT $WIDTH --defaultno
        else
            whiptail --title "$TITLE" --yesno "$QUESTION" $HEIGHT $WIDTH
        fi
        RESULT=$?
    elif [ "$TUI_TOOL" = "dialog" ]; then
        if [ "$DEFAULT" = "yes" ]; then
            dialog --title "$TITLE" --yesno "$QUESTION" $HEIGHT $WIDTH --defaultno
        else
            dialog --title "$TITLE" --yesno "$QUESTION" $HEIGHT $WIDTH
        fi
        RESULT=$?
    else
        echo -e "\n=== $TITLE ===\n$QUESTION"
        local default_prompt="[Y/n]"
        if [ "$DEFAULT" = "no" ]; then
            default_prompt="[y/N]"
        fi
        
        read -p "$default_prompt " input
        if [ "$DEFAULT" = "yes" ]; then
            [[ "$input" =~ ^[Nn]$ ]] && RESULT=1 || RESULT=0
        else
            [[ "$input" =~ ^[Yy]$ ]] && RESULT=0 || RESULT=1
        fi
    fi
    
    return $RESULT
}

# Function to display a menu with options
show_menu() {
    local TITLE="$1"
    local PROMPT="$2"
    shift 2
    local OPTIONS=("$@")
    local HEIGHT=$(( ${#OPTIONS[@]} / 2 + 10 ))
    local WIDTH=60
    local RESULT=""
    
    if [ "$TUI_TOOL" = "whiptail" ]; then
        RESULT=$(whiptail --title "$TITLE" --menu "$PROMPT" $HEIGHT $WIDTH ${#OPTIONS[@]} "${OPTIONS[@]}" 3>&1 1>&2 2>&3)
    elif [ "$TUI_TOOL" = "dialog" ]; then
        RESULT=$(dialog --title "$TITLE" --menu "$PROMPT" $HEIGHT $WIDTH ${#OPTIONS[@]} "${OPTIONS[@]}" 3>&1 1>&2 2>&3)
    else
        echo -e "\n=== $TITLE ===\n$PROMPT\n"
        for (( i=0; i<${#OPTIONS[@]}; i+=2 )); do
            echo "$((i/2+1)). ${OPTIONS[i]}: ${OPTIONS[i+1]}"
        done
        
        local max_option=$((${#OPTIONS[@]}/2))
        while true; do
            read -p "Enter option (1-$max_option): " opt
            if [[ "$opt" =~ ^[0-9]+$ ]] && [ "$opt" -ge 1 ] && [ "$opt" -le $max_option ]; then
                RESULT=${OPTIONS[($opt-1)*2]}
                break
            else
                echo "Invalid option. Please try again."
            fi
        done
    fi
    
    echo "$RESULT"
}

# Function to display a checkbox list
show_checklist() {
    local TITLE="$1"
    local PROMPT="$2"
    shift 2
    local OPTIONS=("$@")
    local HEIGHT=$(( ${#OPTIONS[@]} / 3 + 10 ))
    local WIDTH=60
    local RESULT=""
    
    if [ "$TUI_TOOL" = "whiptail" ]; then
        RESULT=$(whiptail --title "$TITLE" --checklist "$PROMPT" $HEIGHT $WIDTH ${#OPTIONS[@]} "${OPTIONS[@]}" 3>&1 1>&2 2>&3)
    elif [ "$TUI_TOOL" = "dialog" ]; then
        RESULT=$(dialog --title "$TITLE" --checklist "$PROMPT" $HEIGHT $WIDTH ${#OPTIONS[@]} "${OPTIONS[@]}" 3>&1 1>&2 2>&3)
    else
        echo -e "\n=== $TITLE ===\n$PROMPT\n"
        for (( i=0; i<${#OPTIONS[@]}; i+=3 )); do
            echo "$((i/3+1)). ${OPTIONS[i]}: ${OPTIONS[i+1]} [${OPTIONS[i+2]}]"
        done
        
        echo "Enter options (comma-separated, e.g., 1,3,4):"
        read selections
        
        RESULT=""
        IFS=',' read -ra ADDR <<< "$selections"
        for i in "${ADDR[@]}"; do
            if [[ "$i" =~ ^[0-9]+$ ]] && [ "$i" -ge 1 ] && [ "$i" -le $((${#OPTIONS[@]}/3)) ]; then
                [ -n "$RESULT" ] && RESULT="$RESULT "
                RESULT="${RESULT}\"${OPTIONS[($i-1)*3]}\""
            fi
        done
    fi
    
    echo "$RESULT"
}

# Function to display a progress gauge
show_progress() {
    local TITLE="$1"
    local PERCENT="$2"
    local MESSAGE="$3"
    local HEIGHT=10
    local WIDTH=60
    
    if [ "$TUI_TOOL" = "whiptail" ]; then
        echo $PERCENT | whiptail --title "$TITLE" --gauge "$MESSAGE" $HEIGHT $WIDTH 0
    elif [ "$TUI_TOOL" = "dialog" ]; then
        echo $PERCENT | dialog --title "$TITLE" --gauge "$MESSAGE" $HEIGHT $WIDTH 0
    else
        local bar_size=40
        local filled=$(($PERCENT*$bar_size/100))
        local empty=$(($bar_size-$filled))
        
        printf "\r[%${filled}s%${empty}s] %d%% - %s" | tr ' ' '#' | tr ' ' ' '
    fi
}

# Function to display a welcome message
show_welcome() {
    local TITLE="Welcome to Red Panda Creator"
    local MESSAGE="This tool will help you set up a new Red Panda project with all necessary configurations.\n\nYou can navigate through the setup process using your keyboard."
    
    show_message "$TITLE" "$MESSAGE" 12 70
}

# Function to display a completion message
show_completion() {
    local PROJECT_NAME="$1"
    local FULL_PATH="$2"
    
    local TITLE="✨ Project Setup Complete ✨"
    local MESSAGE="Your new Red Panda project has been successfully created!\n\nProject Name: $PROJECT_NAME\nLocation: $FULL_PATH\n\nPress OK to finish."
    
    show_message "$TITLE" "$MESSAGE" 12 70
} 