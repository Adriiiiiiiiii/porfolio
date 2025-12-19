#!/bin/bash
# ==============================================================================
# SCRIPT: monitor.sh
# AUTHOR: Adrià Montero
# DESCRIPTION: Quick server health dashboard. Checks CPU, RAM, Disk, and Load.
# ==============================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   SERVER HEALTH DASHBOARD   ${NC}"
echo -e "${BLUE}=======================================${NC}"
echo -e "Hostname: $(hostname)"
echo -e "Time: $(date)"
echo -e "Kernel: $(uname -r)"
echo -e ""

# 1. CPU LOAD
echo -e "${YELLOW}[+] Checking CPU Load...${NC}"
load=$(uptime | awk -F'load average:' '{ print $2 }')
echo -e "    Load Average: ${GREEN}$load${NC}"

# 2. MEMORY USAGE
echo -e "${YELLOW}[+] Checking Memory...${NC}"
if command -v free >/dev/null; then
    mem_info=$(free -h | grep Mem)
    total_mem=$(echo $mem_info | awk '{print $2}')
    used_mem=$(echo $mem_info | awk '{print $3}')
    echo -e "    RAM Used: ${GREEN}$used_mem / $total_mem${NC}"
else
    echo -e "    ${RED}Error: 'free' command not found.${NC}"
fi

# 3. DISK USAGE
echo -e "${YELLOW}[+] Checking Disk Usage (Root)...${NC}"
disk_usage=$(df -h / | tail -1 | awk '{print $5}')
echo -e "    Root Partition: ${GREEN}$disk_usage used${NC}"

# 4. ZOMBIE PROCESSES
echo -e "${YELLOW}[+] Checking for Zombies...${NC}"
zombies=$(ps aux | awk '{print $8}' | grep -c 'Z')
if [ "$zombies" -gt 0 ]; then
    echo -e "    ${RED}Warning: Found $zombies zombie process(es)!${NC}"
else
    echo -e "    ${GREEN}No zombie processes found.${NC}"
fi

echo -e ""
echo -e "${BLUE}=======================================${NC}"
echo -e "${GREEN}System check complete.${NC}"
