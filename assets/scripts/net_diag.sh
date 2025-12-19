#!/bin/bash
# ==============================================================================
# SCRIPT: net_diag.sh
# AUTHOR: Adrià Montero
# DESCRIPTION: Simple network connectivity and DNS diagnostic tool.
# ==============================================================================

TARGET="8.8.8.8"
DOMAIN="google.com"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}Starting Network Diagnostics...${NC}"

# 1. PING CHECK
echo -n "[+] Pinging $TARGET... "
if ping -c 1 $TARGET &> /dev/null; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL${NC}"
fi

# 2. DNS CHECK
echo -n "[+] Resolving $DOMAIN... "
if nslookup $DOMAIN &> /dev/null; then
    echo -e "${GREEN}OK${NC}"
else
    echo -e "${RED}FAIL (DNS Issue?)${NC}"
fi

# 3. PORT SCAN (LOCALHOST)
echo -e "[+] Scanning common local ports (SSH, HTTP)..."
for port in 22 80 443; do
    (echo > /dev/tcp/localhost/$port) >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "    Port $port: ${GREEN}OPEN${NC}"
    else
        echo -e "    Port $port: ${RED}CLOSED${NC}"
    fi
done

echo -e "${CYAN}Done.${NC}"
