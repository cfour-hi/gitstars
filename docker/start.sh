#!/bin/ash
pnpm run dev >> /var/log/gitstars.log 2>&1 & pnpm run start >> /var/log/express.log 2>&1
