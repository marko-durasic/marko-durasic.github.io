---
title: "Cloud Coach Documentation"
permalink: /cloud-coach/docs/
layout: single
excerpt: "Complete documentation for the Cloud Coach AWS certification study tool"
---

# Cloud Coach Documentation

## Overview

Cloud Coach is an interactive study tool designed to help you prepare for AWS certifications (SAA-C03 and DVA-C02). It uses intelligent algorithms to prioritize your study materials based on your current knowledge level and exam requirements.

## Features

### 🎯 Domain Mastery Tracking
- Adjust your knowledge level across different AWS domains using interactive sliders
- Real-time weighted mastery calculation
- Visual progress indicators

### 📚 Smart Rewatch Planner
- AI-powered lesson prioritization based on:
  - Your current domain mastery levels
  - Lesson recency (when you last watched)
  - Domain weakness (areas you need to improve)
  - Exam weight (domain importance)
  - Focus bonus (extra points for lessons in your weakest domain)

### ⏰ Exam Management
- Set your exam date and track countdown
- Switch between SAA-C03 and DVA-C02 exam tracks
- Domain-specific question distribution recommendations

### 📊 Progress Analytics
- Overall mastery percentage
- Domain-specific breakdowns
- Study session tracking
- Export/import functionality for data backup

## How to Use

### Getting Started
1. **Set Your Exam Date**: Click "Edit" in the Exam Countdown section
2. **Adjust Domain Mastery**: Use the sliders in the Domain Board to reflect your current knowledge
3. **Review Lessons**: The Rewatch Planner will automatically prioritize lessons based on your needs
4. **Track Progress**: Monitor your overall mastery and domain-specific progress

### Domain Board
The Domain Board shows the four main AWS domains for your selected exam:
- **SAA-C03**: Design Secure, Resilient, High-Performing, and Cost-Optimized Architectures
- **DVA-C02**: Development, Security, Deployment, and Troubleshooting

Each domain has:
- **Weight**: How much it contributes to the exam
- **Mastery Slider**: Adjust from 0-100% based on your knowledge
- **Real-time Updates**: Changes immediately affect lesson prioritization

### Rewatch Planner
The Rewatch Planner intelligently ranks lessons based on:
- **Impact Score**: Base importance of the lesson
- **Recency Boost**: Lessons you haven't watched recently get priority
- **Domain Weakness**: Lessons in your weakest domains get higher scores
- **Exam Weight**: Domains with higher exam weight get priority
- **Focus Bonus**: Extra points for lessons in your current focus domain

### Domain Percentages
Each lesson shows which domains it covers and the percentage breakdown:
- **Single Domain**: "Design Secure Architectures 100%"
- **Multi-Domain**: "Design Secure Architectures 62% • Design Cost-Optimized Architectures 38%"

## Technical Details

### Architecture
- **Frontend**: React 18 with functional components and hooks
- **Styling**: Tailwind CSS with custom dark theme
- **Icons**: Lucide React icon library
- **Storage**: Browser localStorage (client-side only)
- **Build**: Jekyll static site generator

### Data Persistence
All your progress is stored locally in your browser:
- No server-side storage
- Complete privacy
- Export/import functionality for backup
- Data persists across browser sessions

### Browser Compatibility
- Modern browsers with ES6+ support
- LocalStorage support required
- Responsive design for mobile and desktop

## Troubleshooting

### Common Issues
1. **Sliders not working**: Ensure JavaScript is enabled
2. **Data not saving**: Check if localStorage is available
3. **Styling issues**: Clear browser cache and reload

### Data Recovery
If you lose your data:
1. Use the "Import from text" feature if you have a backup
2. Export your data regularly using the backup panel
3. Check browser settings for localStorage restrictions

## Contributing

This is an open-source project. Contributions are welcome!
- Report bugs via GitHub issues
- Suggest new features
- Submit pull requests for improvements

## License

MIT License - feel free to use and modify for your own projects.

---

**Need help?** Check the [GitHub repository](https://github.com/marko-durasic/marko-durasic.github.io) for more information.
