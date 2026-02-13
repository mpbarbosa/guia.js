#!/bin/bash
cd ..
pwd
npm run build
cd ../mpbarbosa_site
pwd
./shell_scripts/sync_to_staging.sh --step1
