# A Discord Bot using Discord.JS Master branch

## Features

- Redis data caching with TTL
- Data encryption using AES-256-CBC
- Advanced Interaction Support

## Redis Caching

This bot uses Redis to cache data such as users, guilds, channels, messages, roles, emojis, etc.

Cached data also has an expire time of 30 days (The maximum amount of time allowed per the Discord Developer Agreement) after which the data is deleted.

## Data Encryption

All data stored whether it be cache or configs, is encrypted using AES-256-CBC encryption.

## Advanced Interaction Support

This bot comes packed with Hybrid Commands™ which can allow a command to be a regular command and an slash command.

Interaction commands also have an option for the reply be ephemeral!
