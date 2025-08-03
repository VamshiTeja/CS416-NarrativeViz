# COVID-19: The Global Pandemic Story

A narrative visualization of the COVID-19 pandemic using JHU CSSE data, implemented as an interactive web page with D3.js following the Interactive Slideshow structure.

## 🌐 Live Demo
**View the live visualization:** [https://vamshiteja.github.io/CS416-NarrativeViz](https://vamshiteja.github.io/CS416-NarrativeViz)


## Overview

This narrative visualization tells the complete story of the COVID-19 pandemic through four focused scenes:

1. **Scene 1: The Outbreak** - The early days of COVID-19 and its initial global spread
2. **Scene 2: The Surge** - The devastating peak of the pandemic and its global impact  
3. **Scene 3: The Recovery** - The path to recovery and lessons learned from the pandemic
4. **Scene 4: Country Comparison** - Compare how different countries were affected by the pandemic across the entire timeline

## Narrative Structure

This visualization follows an **Interactive Slideshow** structure, where users can explore different aspects of the pandemic story while maintaining a guided narrative flow. Each scene focuses on a specific time period and aspect of the pandemic, allowing users to understand the progression from outbreak to recovery while providing opportunities for detailed exploration.

## Assignment Compliance

### Required Elements:
- ✅ **Scenes**: Four carefully ordered scenes with consistent visual templates
- ✅ **Annotations**: Consistent annotation template with scene-specific highlighting
- ✅ **Parameters**: Clear state management with documented parameters
- ✅ **Triggers**: Multiple user interaction triggers with appropriate affordances

### Narrative Structure:
- ✅ **Interactive Slideshow**: Guided progression with exploration opportunities
- ✅ **D3.js Implementation**: Pure D3.js with d3-annotation library
- ✅ **No High-Level Tools**: No Tableau, Vega, or other restricted libraries

## Features

- **Four focused scenes** that tell a complete pandemic story
- **Consistent annotation system** with scene-specific highlighting
- **Interactive elements** with hover tooltips for detailed data exploration
- **Country-level data** with comparison capabilities
- **Responsive design** that works on desktop and mobile devices
- **Keyboard navigation** using arrow keys and escape key
- **Smooth transitions** between scenes with consistent visual language
- **Dynamic user guidance** that changes based on current scene
- **Aligned x-axis scales** across all scenes for better temporal understanding

## Data Source

The visualization uses data from the Johns Hopkins University Center for Systems Science and Engineering (JHU CSSE) COVID-19 dataset, which provides daily global confirmed cases and deaths, as well as country-level data for the top 10 affected countries.

## Technical Implementation

- **D3.js v7** for data visualization
- **d3-annotation** for milestone annotations
- **Vanilla JavaScript** for narrative logic and state management
- **CSS3** for styling and animations
- **HTML5** for structure

## Local Development

1. Clone this repository
2. Open `index.html` in a web browser
3. Use the navigation buttons to move between scenes
4. Hover over data points to see detailed information
5. Use arrow keys for keyboard navigation
6. Press Escape to clear highlights

## File Structure

```
/
├── index.html                    # Main HTML file
├── narrative.js                  # JavaScript narrative logic with parameters
├── styles.css                    # CSS styling with scene themes
├── data.py                      # Data preprocessing script
├── covid_global_timeseries.json # Processed global JHU data
├── covid_country_timeseries.json # Country-level time series data
├── covid_country_summary.json   # Country summary statistics
├── confirmed.csv                # Raw confirmed cases data
├── deaths.csv                  # Raw deaths data
├── README.md                   # This file
└── ESSAY.md                    # Comprehensive assignment essay
```

## Data Processing

The `data.py` script downloads and processes the JHU COVID-19 data:
- Downloads confirmed cases and deaths data from JHU CSSE GitHub repository
- Aggregates global totals by date
- Processes country-level data for top 10 countries
- Exports processed data as JSON for use in the visualization

## Narrative Elements

### Scenes
Each scene follows a consistent template while using different chart types:

- **Outbreak**: Line chart with milestone annotations (early 2020)
- **Surge**: Area chart highlighting the peak period (March-July 2020)
- **Recovery**: Dual-line chart showing cases and deaths (2021-2023)
- **Countries**: Multi-line chart comparing all 10 countries across the full timeline (2020-2023)

### Annotations
Consistent annotation template with scene-specific content:
- **Visual Template**: Dashed line, colored background, title and description
- **Scene 1**: WHO emergency and pandemic declarations
- **Scene 2**: Global peak identification
- **Scene 3**: Vaccination milestone
- **Scene 4**: Interactive tooltips for country exploration

### Parameters
Key state parameters that control the visualization:
- `currentScene` (0-3): Current scene index
- `selectedCountry` (string/null): Highlighted country
- `highlightedDataPoint` (object/null): Highlighted data point
- `animationSpeed` (500ms): Transition duration
- `dataFilter` (string): Data subset filter

### Triggers
User interactions that update parameters:
- **Navigation**: Button clicks, keyboard arrows
- **Exploration**: Mouse hover, mouse out
- **Clear**: Escape key for clearing highlights

## Accessibility

- Keyboard navigation support
- High contrast color scheme
- Responsive design for mobile devices
- Print-friendly styles
- Clear visual affordances

## License

This project uses JHU CSSE COVID-19 data which is available under the Creative Commons Attribution 4.0 International License. 