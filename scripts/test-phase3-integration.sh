#!/bin/bash

# Phase 3 Integration Tests - Manual Validation Script
# Tests: T064-T069

set -e

API_URL="http://localhost:3001/api"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "Phase 3 Integration Tests"
echo "User Story 1: Browse Upcoming Events"
echo "========================================="
echo ""

# T064: Test complete flow
echo -e "${YELLOW}[T064] Testing end-to-end event browsing flow${NC}"

echo "  → Testing GET /api/events (default pagination)..."
response=$(curl -s -w "\n%{http_code}" "${API_URL}/events")
http_code=$(echo "$response" | tail -n 1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ]; then
    echo -e "    ${GREEN}✓${NC} Status 200 OK"
    
    # Check response structure
    if echo "$body" | jq -e '.events' > /dev/null 2>&1; then
        echo -e "    ${GREEN}✓${NC} Response has 'events' array"
    else
        echo -e "    ${RED}✗${NC} Missing 'events' array"
    fi
    
    if echo "$body" | jq -e '.pagination' > /dev/null 2>&1; then
        echo -e "    ${GREEN}✓${NC} Response has 'pagination' object"
    else
        echo -e "    ${RED}✗${NC} Missing 'pagination' object"
    fi
else
    echo -e "    ${RED}✗${NC} Status $http_code (expected 200)"
fi

echo ""
echo "  → Testing sport filter (Football)..."
response=$(curl -s -w "\n%{http_code}" "${API_URL}/events?sport=Football")
http_code=$(echo "$response" | tail -n 1)
if [ "$http_code" = "200" ]; then
    echo -e "    ${GREEN}✓${NC} Sport filter works"
else
    echo -e "    ${RED}✗${NC} Sport filter failed (status $http_code)"
fi

echo ""
echo "  → Testing search functionality..."
response=$(curl -s -w "\n%{http_code}" "${API_URL}/events?search=Team")
http_code=$(echo "$response" | tail -n 1)
if [ "$http_code" = "200" ]; then
    echo -e "    ${GREEN}✓${NC} Search works"
else
    echo -e "    ${RED}✗${NC} Search failed (status $http_code)"
fi

echo ""
echo "  → Testing pagination..."
response1=$(curl -s "${API_URL}/events?page=1&per_page=5")
response2=$(curl -s "${API_URL}/events?page=2&per_page=5")
page1=$(echo "$response1" | jq -r '.pagination.page' 2>/dev/null || echo "error")
page2=$(echo "$response2" | jq -r '.pagination.page' 2>/dev/null || echo "error")

if [ "$page1" = "1" ] && [ "$page2" = "2" ]; then
    echo -e "    ${GREEN}✓${NC} Pagination works correctly"
else
    echo -e "    ${RED}✗${NC} Pagination failed (page1=$page1, page2=$page2)"
fi

echo ""
echo -e "${YELLOW}[T065] Testing cache headers${NC}"
headers=$(curl -sI "${API_URL}/events")
if echo "$headers" | grep -i "cache-control" | grep -q "public"; then
    echo -e "  ${GREEN}✓${NC} Cache-Control header present with 'public'"
else
    echo -e "  ${RED}✗${NC} Cache-Control header missing or incorrect"
fi

if echo "$headers" | grep -i "cache-control" | grep -q "max-age=3600"; then
    echo -e "  ${GREEN}✓${NC} Cache TTL set to 3600 seconds (1 hour)"
else
    echo -e "  ${RED}✗${NC} Cache TTL not set to 3600 seconds"
fi

echo ""
echo -e "${YELLOW}[T066] Testing rate limiting headers${NC}"
if echo "$headers" | grep -qi "x-ratelimit-limit"; then
    echo -e "  ${GREEN}✓${NC} X-RateLimit-Limit header present"
else
    echo -e "  ${RED}✗${NC} X-RateLimit-Limit header missing"
fi

if echo "$headers" | grep -qi "x-ratelimit-remaining"; then
    echo -e "  ${GREEN}✓${NC} X-RateLimit-Remaining header present"
else
    echo -e "  ${RED}✗${NC} X-RateLimit-Remaining header missing"
fi

echo ""
echo -e "${YELLOW}[T067] Responsive layout test${NC}"
echo -e "  ${YELLOW}ℹ${NC}  Manual test required: Check client at http://localhost:3000"
echo "     - Mobile: < 640px"
echo "     - Tablet: 640-1024px"
echo "     - Desktop: > 1024px"

echo ""
echo -e "${YELLOW}[T068] Testing empty state${NC}"
response=$(curl -s "${API_URL}/events?sport=NonExistent&search=impossiblequery12345")
events=$(echo "$response" | jq -r '.events | length' 2>/dev/null || echo "error")
total=$(echo "$response" | jq -r '.pagination.total' 2>/dev/null || echo "error")

if [ "$events" = "0" ] && [ "$total" = "0" ]; then
    echo -e "  ${GREEN}✓${NC} Empty state returns correctly (0 events)"
else
    echo -e "  ${RED}✗${NC} Empty state failed (events=$events, total=$total)"
fi

echo ""
echo -e "${YELLOW}[T069] Loading state test${NC}"
echo -e "  ${YELLOW}ℹ${NC}  Manual test required: Check LoadingState component in client"
echo "     - Open browser DevTools"
echo "     - Throttle network to 'Slow 3G'"
echo "     - Navigate to http://localhost:3000/events/upcoming"
echo "     - Verify loading skeleton displays"

echo ""
echo "========================================="
echo "Phase 3 Integration Tests Complete"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Start client: cd client && npm run dev"
echo "2. Visit http://localhost:3000"
echo "3. Test responsive layouts manually"
echo "4. Test loading states with network throttling"
