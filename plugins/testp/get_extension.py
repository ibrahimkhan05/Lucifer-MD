import os
import sys

# Ensure a file path is passed
if len(sys.argv) < 2:
    print("❌ No file path provided.")
    sys.exit(1)

file_path = sys.argv[1]

# Print the path for debugging
print(f"Debug: Received file path: {file_path}")

# Check if file exists
if not os.path.exists(file_path):
    print("❌ File does not exist.")
    sys.exit(1)

# Get file extension
file_extension = os.path.splitext(file_path)[1]

# If there is no extension, try to identify it (simple fallback mechanism)
if not file_extension:
    print("❌ No extension found.")
    # Try to guess extension using file signature (magic bytes)
    try:
        import magic
        mime_type = magic.Magic(mime=True).from_file(file_path)
        print(f"Debug: MIME Type: {mime_type}")
    except ImportError:
        print("❌ Unable to import python-magic to determine file type.")
        sys.exit(1)
    sys.exit(0)  # You could send a custom message back to Node.js if required

# Print the extension for debugging
print(f"Debug: Extracted extension: {file_extension}")

# Output the extension (this is what Node.js will capture)
print(file_extension)
