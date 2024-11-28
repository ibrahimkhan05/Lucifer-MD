import sys
import os

# Function to extract file extension
def get_extension(file_name):
    return os.path.splitext(file_name)[1]

# Check if the filename is provided as a command-line argument
if len(sys.argv) < 2:
    print("❌ No file name provided")
    sys.exit(1)

# Get the file name from the command line arguments
file_name = sys.argv[1]

# Extract and print the file extension
extension = get_extension(file_name)
print(extension)
