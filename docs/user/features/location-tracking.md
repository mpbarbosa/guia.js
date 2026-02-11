# Location Tracking Feature

**Version**: 0.8.7-alpha  
**Status**: Core Feature  
**Last Updated**: 2026-02-11

---

## Overview

Location tracking is the **primary feature** of Guia Turístico. It provides real-time monitoring of your position as you move through Brazilian cities, with automatic address updates and comprehensive location information display.

## Two Tracking Modes

### 1. Single Position Mode (Default)

**Use Case**: Check where you are right now

**How it works**:
1. Click "**Obter Localização**" button
2. App requests your GPS coordinates once
3. Address lookup occurs
4. Display shows your current location
5. Done - no further updates

**Perfect for**:
- Quick location checks
- Looking up where you currently are
- Minimal battery usage
- One-time address lookup

### 2. Continuous Tracking Mode

**Use Case**: Real-time tracking while moving

**How it works**:
1. Enable "**Ativar modo contínuo**" checkbox
2. Click "**Obter Localização**" to start
3. App monitors your position continuously
4. Display updates automatically as you move
5. Click "**Parar Rastreamento**" to stop

**Perfect for**:
- Walking tours
- Navigation assistance
- Exploring new areas
- Tracking route through city

## Update Triggers

Location updates occur when **either** threshold is reached:

### Time Threshold: 30 seconds
- Updates every 30 seconds if you're stationary
- Ensures regular updates even without movement
- Prevents missed updates due to GPS drift

### Distance Threshold: 20 meters
- Updates immediately when you move 20m
- Responsive to actual movement
- Balances accuracy with API call efficiency

---

**Version**: 0.8.7-alpha  
**Feature Status**: ✅ Production Ready  
**Last Updated**: 2026-02-11
