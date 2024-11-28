import os
import sys

# Ensure a file path is passed
if len(sys.argv) < 2:
    print("❌ No file path provided.")
    sys.exit(1)

file_path = sys.argv[1]

# Print the path for debugging
print(f"Debug: Received file path: {file_path}")

# Get file extension
file_extension = os.path.splitext(file_path)[1]

# Print the extension
print(f"Debug: Extracted extension: {file_extension}")

# Output the extension (this is what Node.js will capture)
print(file_extension)
