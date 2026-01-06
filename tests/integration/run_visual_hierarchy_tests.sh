#!/bin/bash
# Run Visual Hierarchy Integration Tests
#
# This script:
# 1. Starts a local HTTP server
# 2. Runs Selenium tests for visual hierarchy
# 3. Cleans up the server
#
# Usage: ./run_visual_hierarchy_tests.sh

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Visual Hierarchy Integration Tests${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "src/index.html" ]; then
    echo -e "${RED}Error: Must be run from project root directory${NC}"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python 3 is required${NC}"
    exit 1
fi

# Check if Selenium is installed
if ! python3 -c "import selenium" 2>/dev/null; then
    echo -e "${YELLOW}Installing Selenium...${NC}"
    pip3 install selenium
fi

# Start local HTTP server
echo -e "${YELLOW}Starting local HTTP server on port 8080...${NC}"
python3 -m http.server 8080 --directory src > /tmp/test_server.log 2>&1 &
SERVER_PID=$!

# Wait for server to start
sleep 2

# Check if server is running
if ! curl -s http://localhost:8080 > /dev/null; then
    echo -e "${RED}Error: Failed to start HTTP server${NC}"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

echo -e "${GREEN}✓ Server started (PID: $SERVER_PID)${NC}"
echo ""

# Run the tests
echo -e "${YELLOW}Running Selenium tests...${NC}"
echo ""

if python3 tests/integration/test_visual_hierarchy.py; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo -e "${GREEN}========================================${NC}"
    TEST_RESULT=0
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}✗ Some tests failed${NC}"
    echo -e "${RED}========================================${NC}"
    TEST_RESULT=1
fi

# Clean up
echo ""
echo -e "${YELLOW}Cleaning up...${NC}"
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true
echo -e "${GREEN}✓ Server stopped${NC}"

exit $TEST_RESULT
