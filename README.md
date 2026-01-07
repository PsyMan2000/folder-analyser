# Folder Size Analyzer

A Docker application that scans mounted volumes and displays folder sizes with beautiful graphical visualizations.

## Quick Start

1. Build and run with Docker Compose:
```bash
docker-compose up -d
```

2. Access the app at http://localhost:3000

## Manual Docker Commands

Build:
```bash
docker build -t folder-analyzer .
```

Run (replace /path/to/analyze with your folder):
```bash
docker run -d -p 3000:3000 -v /path/to/analyze:/data:ro --name folder-analyzer folder-analyzer
```

## Configuration

Edit `docker-compose.yml` to change the mounted volume path:
```yaml
volumes:
  - /your/path/here:/data:ro
```

## Features

- Real-time folder size scanning
- Bar and Pie chart visualizations
- Responsive modern UI
- Automatic recursive size calculation
- Error handling for permission issues
