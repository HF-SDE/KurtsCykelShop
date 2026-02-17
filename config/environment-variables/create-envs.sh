#!/bin/bash

# Copy all .env*.example files and replace the .example extension with .dev
for file in .env*.example; do
  if [ -f "$file" ]; then
    cp "$file" "${file%.example}.dev"
    echo "Created ${file%.example}.dev"
  fi
done