# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Puntus by Adfay** - Sistema de scrims para Free Fire con API REST. Permite gestionar scrims, equipos, partidas y sistema de puntuación basado en placement + kills.

## Technology Stack

- **Backend**: Node.js + Express
- **Database**: MariaDB/MySQL con Sequelize ORM
- **Validation**: express-validator
- **Authentication**: JWT (preparado para implementar)

## Common Commands

```bash
# Instalación
npm install

# Desarrollo
npm run dev

# Producción
npm start

# Base de datos
# Crear BD: CREATE DATABASE puntusAdfay;
```

## Project Structure

```
├── config/database.js      # Configuración de MariaDB
├── models/                 # Modelos Sequelize
│   ├── Scrim.js           # Scrims (torneos)
│   ├── Team.js            # Equipos
│   ├── Match.js           # Partidas individuales
│   ├── MatchResult.js     # Resultados por equipo
│   ├── ScrimTeam.js       # Relación scrims-equipos
│   └── index.js           # Relaciones entre modelos
├── routes/                # Rutas API REST
│   ├── scrims.js          # CRUD scrims
│   ├── teams.js           # CRUD equipos
│   └── matches.js         # CRUD partidas
└── server.js              # Servidor principal
```

## Key Architecture Patterns

- **MVC Pattern**: Separación clara entre modelos, controladores (routes) y datos
- **ORM Relations**: Relaciones many-to-many entre scrims y equipos vía ScrimTeam
- **JSON Fields**: Uso de campos JSON para datos flexibles (players, settings, pointSystem)
- **Validation Layer**: Validaciones con express-validator en rutas

## Database Schema

- **scrims**: Configuración de torneos, mapas, sistema de puntos
- **teams**: Equipos con jugadores en JSON
- **matches**: Partidas individuales por scrim
- **match_results**: Resultados por equipo (placement, kills, puntos)
- **scrim_teams**: Tabla pivot scrims-equipos con estadísticas

## Free Fire Scoring System

- **Placement Points**: 1st=12, 2nd=6, 3rd=4, 4th=2, 5th=1, 6th-12th=0
- **Kill Points**: 1 punto por kill
- **Total**: placement + (kills × killPoints)

## Development Notes

- Muchos espacios marcados con `___` para completar
- Campos JSON permiten flexibilidad en players y configuraciones
- Sistema de puntuación configurable por scrim
- Prepared for authentication con JWT