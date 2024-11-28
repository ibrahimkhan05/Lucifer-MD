import sys
import os

# Get the file name from command-line arguments
file_name = sys.argv[1]

# Extract the file extension
extension = os.path.splitext(file_name)[1] if '.' in file_name else 'unknown'

# Print the extension (sent back to Node.js)
print(extension)
