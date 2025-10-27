#!/usr/bin/env python3
"""
collect_logs.py
Lightweight DFIR helper for homelab: collects basic system info and logs into a tarball.
"""
import os
import subprocess
import tarfile
from datetime import datetime

OUTDIR = "/tmp/dfir_collect"
TIMESTAMP = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
ARCHIVE = f"/tmp/dfir_{TIMESTAMP}.tar.gz"

os.makedirs(OUTDIR, exist_ok=True)

def run(cmd, out):
    try:
        print(f"[*] Running: {cmd}")
        with open(out, "w") as f:
            subprocess.run(cmd, shell=True, stdout=f, stderr=subprocess.STDOUT, check=False)
    except Exception as e:
        print(f"[!] Error running {cmd}: {e}")

print("[*] Collecting uname and environment")
run("uname -a", os.path.join(OUTDIR, "uname.txt"))
run("uptime", os.path.join(OUTDIR, "uptime.txt"))
run("ps aux --no-heading", os.path.join(OUTDIR, "ps.txt"))

print("[*] Collecting /var/log (last 200 lines of syslog/messages)")
run("tail -n 200 /var/log/syslog || tail -n 200 /var/log/messages", os.path.join(OUTDIR, "syslog_tail.txt"))

print("[*] Archiving results to " + ARCHIVE)
with tarfile.open(ARCHIVE, "w:gz") as tar:
    tar.add(OUTDIR, arcname=os.path.basename(OUTDIR))

print("[*] Done. Archive: " + ARCHIVE)