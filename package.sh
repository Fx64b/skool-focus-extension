#!/bin/bash

# Variables
DATE=$(date +"%Y-%m-%d")
ZIP_NAME="${DATE}-chrome.zip"
EXCLUDE_FILES=".git .gitignore .github build"
MANIFEST_FILE="manifest.json"
POPUP_FILE="popup.html"
BUILD_DIR="build"
INCREMENT_TYPE="patch" # Default increment type

# Parse command-line arguments for version increment type
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --major) INCREMENT_TYPE="major"; shift ;;
        --minor) INCREMENT_TYPE="minor"; shift ;;
        *) echo "Unknown parameter passed: $1"; exit 1 ;;
        esac
    done

increment_version() {
    local version=$1
    local IFS=.
    local parts=($version)

    case $INCREMENT_TYPE in
        "major")
            parts[0]=$((parts[0]+1)) # Increment major version
            parts[1]=0
            parts[2]=0
            ;;
        "minor")
            parts[1]=$((parts[1]+1)) # Increment minor version
            parts[2]=0
            ;;
        "patch")
            parts[2]=$((parts[2]+1)) # Increment patch version
            ;;
    esac

    echo "${parts[0]}.${parts[1]}.${parts[2]}"
}

# Extract and update version number in manifest.json
if [ -f "$MANIFEST_FILE" ]; then
    current_version=$(grep -oP '(?<="version": ")[^"]*' $MANIFEST_FILE)
    new_version=$(increment_version $current_version)

    echo "Updating manifest.json version from $current_version to $new_version"
    sed -i.bak "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/" $MANIFEST_FILE && rm -f "$MANIFEST_FILE.bak"
else
    echo "Error: manifest.json not found!"
    exit 1
fi

# Update version number in popup.html
if [ -f "$POPUP_FILE" ]; then
    echo "Updating version number in popup.html"
    sed -i.bak "s/V$current_version/V$new_version/" $POPUP_FILE && rm -f "$POPUP_FILE.bak"
else
    echo "Error: popup.html not found!"
    exit 1
fi

# Function to convert Unix-style Git Bash path to Windows-style path using cygpath
convert_to_windows_path() {
    local unix_path=$1
    # Use cygpath to convert Unix paths to Windows paths
    local win_path=$(cygpath -w "$unix_path")
    echo "$win_path"
}

# Function to copy necessary files for zipping on Windows
copy_files_to_temp() {
    local temp_dir=$1

    echo "Copying necessary files to $temp_dir"
    mkdir -p "$temp_dir"

    # Find all files except the ones to exclude
    find . -type f ! \( -path "./.git/*" -o -path "./.gitignore" -o -path "./.github/*" -o -path "./$BUILD_DIR/*" \) \
        -exec cp --parents {} "$temp_dir" \;
}

# Function to create a zip file on Windows using PowerShell
create_zip_windows() {
    echo "Creating ZIP file using PowerShell: $ZIP_NAME"

    # Create build directory if it doesn't exist
    mkdir -p "$BUILD_DIR"

    # Create a temporary directory to copy files for zipping
    TEMP_DIR=$(mktemp -d)

    # Copy necessary files, excluding git-related and build files
    copy_files_to_temp "$TEMP_DIR"

    # Convert the Unix-style paths to Windows format
    win_source_dir=$(convert_to_windows_path "$TEMP_DIR")
    win_zip_path=$(convert_to_windows_path "$(pwd)/$BUILD_DIR/$ZIP_NAME")

    # Execute PowerShell command to create a zip file
    powershell.exe -Command "
    Add-Type -AssemblyName 'System.IO.Compression.FileSystem';
    [System.IO.Compression.ZipFile]::CreateFromDirectory('$win_source_dir', '$win_zip_path');
    "

    # Cleanup temporary directory
    rm -rf "$TEMP_DIR"
}

# Function to create a zip file on Linux/MacOS
create_zip_unix() {
    echo "Creating ZIP file: $ZIP_NAME"

    # Create build directory if it doesn't exist
    mkdir -p "$BUILD_DIR"

    zip -r "$BUILD_DIR/$ZIP_NAME" . -x "$EXCLUDE_FILES/*"
}

# Detect if we are on Windows or Unix-based system and create the zip accordingly
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    create_zip_windows
else
    if command -v zip > /dev/null; then
        create_zip_unix
    else
        echo "Error: zip is not installed. Please install zip or run this script on a platform that supports zip."
        exit 1
    fi
fi

echo "Packaging completed: $BUILD_DIR/$ZIP_NAME"
