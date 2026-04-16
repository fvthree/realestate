#!/bin/bash

# Build the application
echo "Building the application..."
mvn clean install

# Check if build was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "To run the application, use:"
    echo "  mvn spring-boot:run"
    echo ""
    echo "Or run directly:"
    echo "  java -jar target/sellerapi-0.0.1-SNAPSHOT.jar"
else
    echo ""
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

