class CovidNarrative {
    constructor() {
        // NARRATIVE PARAMETERS - Control the state of the visualization
        this.currentScene = 0;           // Current scene index (0-3)
        this.selectedCountry = null;     // Currently selected country for comparison
        this.highlightedDataPoint = null; // Currently highlighted data point
        this.animationSpeed = 500;       // Animation duration in milliseconds
        this.dataFilter = 'all';         // Data filter type ('all', 'peak', 'recovery')
        
        // Data storage
        this.data = null;
        this.countryData = null;
        this.countrySummary = null;
        
        // Global scales for consistency across scenes
        this.globalXScale = null;
        this.globalYScale = null;
        
        // Scene definitions with consistent template
        this.scenes = [
            {
                id: 0,
                title: "Scene 1: The Outbreak",
                description: "The early days of COVID-19 and its initial global spread.",
                type: "outbreak",
                timeRange: "Early 2020",
                chartType: "line",
                annotations: [
                    {
                        date: new Date('2020-01-30'),
                        title: "WHO Emergency Declaration",
                        description: "WHO declares Public Health Emergency of International Concern",
                        position: "top",
                        color: "#f39c12"
                    },
                    {
                        date: new Date('2020-03-11'),
                        title: "WHO Pandemic Declaration", 
                        description: "WHO officially declares COVID-19 a global pandemic",
                        position: "bottom",
                        color: "#e74c3c"
                    }
                ]
            },
            {
                id: 1,
                title: "Scene 2: The Surge",
                description: "The devastating peak of the pandemic and its global impact.",
                type: "surge",
                timeRange: "March-July 2020",
                chartType: "area",
                annotations: [
                    {
                        date: new Date('2020-04-15'),
                        title: "Global Peak",
                        description: "First major global peak in confirmed cases",
                        position: "top",
                        color: "#c0392b"
                    }
                ]
            },
            {
                id: 2,
                title: "Scene 3: The Recovery",
                description: "The path to recovery and lessons learned from the pandemic.",
                type: "recovery",
                timeRange: "2021-2023",
                chartType: "dual-line",
                annotations: [
                    {
                        date: new Date('2020-12-14'),
                        title: "Vaccination Begins",
                        description: "First COVID-19 vaccines administered globally",
                        position: "top",
                        color: "#27ae60"
                    }
                ]
            },
            {
                id: 3,
                title: "Scene 4: Country Comparison",
                description: "Compare how different countries were affected by the pandemic across the entire timeline.",
                type: "countries",
                timeRange: "Full Timeline (2020-2023)",
                chartType: "multi-line",
                annotations: []
            }
        ];
        
        this.init();
    }

    init() {
        // Load both global and country data
        Promise.all([
            d3.json('covid_global_timeseries.json'),
            d3.json('covid_country_timeseries.json'),
            d3.json('covid_country_summary.json')
        ]).then(([globalData, countryData, countrySummary]) => {
            this.data = globalData.map(d => ({
                ...d,
                date: new Date(d.date)
            }));
            this.countryData = countryData.map(d => ({
                ...d,
                date: new Date(d.date)
            }));
            this.countrySummary = countrySummary;
            
            // Create global scales for consistency
            this.createGlobalScales();
            
            this.setupEventListeners();
            this.renderScene(0);
            this.updateNavigation();
            this.updateUserGuidance();
        });
    }

    createGlobalScales() {
        // Create consistent x-axis scale across all scenes
        const margin = { top: 40, right: 80, bottom: 60, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        
        // Global time domain: from first data point to last data point
        const globalTimeDomain = d3.extent(this.data, d => d.date);
        
        this.globalXScale = d3.scaleTime()
            .domain(globalTimeDomain)
            .range([0, width]);
            
        // Global y-axis scale for cases (used in most scenes)
        const maxCases = d3.max(this.data, d => d.confirmed);
        this.globalYScale = d3.scaleLinear()
            .domain([0, maxCases])
            .range([height, 0]);
    }

    setupEventListeners() {
        // TRIGGERS - Connect user actions to parameter changes
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const sceneId = parseInt(e.target.dataset.scene);
                this.changeScene(sceneId);
            });
        });
        
        // Keyboard navigation triggers
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' && this.currentScene < this.scenes.length - 1) {
                this.changeScene(this.currentScene + 1);
            } else if (e.key === 'ArrowLeft' && this.currentScene > 0) {
                this.changeScene(this.currentScene - 1);
            } else if (e.key === 'Escape') {
                this.clearHighlights();
            }
        });
    }

    changeScene(sceneId) {
        // Update narrative parameters
        this.currentScene = sceneId;
        this.selectedCountry = null;
        this.highlightedDataPoint = null;
        
        // Update data filter based on scene
        const scene = this.scenes[sceneId];
        switch(scene.type) {
            case 'outbreak':
                this.dataFilter = 'early';
                break;
            case 'surge':
                this.dataFilter = 'peak';
                break;
            case 'recovery':
                this.dataFilter = 'recovery';
                break;
            case 'countries':
                this.dataFilter = 'comparison';
                break;
        }
        
        this.renderScene(sceneId);
        this.updateNavigation();
        this.updateUserGuidance();
    }

    updateNavigation() {
        document.querySelectorAll('.nav-btn').forEach((btn, idx) => {
            btn.classList.toggle('active', idx === this.currentScene);
        });
    }

    updateUserGuidance() {
        const scene = this.scenes[this.currentScene];
        let guidance = "";
        
        switch(scene.type) {
            case 'outbreak':
                guidance = "Use arrow keys to navigate. Hover over points to see daily data.";
                break;
            case 'surge':
                guidance = "The area chart shows the dramatic surge. Hover for details. Notice the peak annotation.";
                break;
            case 'recovery':
                guidance = "Compare the dual lines. Green shows cases, purple shows deaths. See vaccination milestone.";
                break;
            case 'countries':
                guidance = "Compare country trends across the full timeline. Hover over lines for country details. Use legend to identify countries. Shows complete pandemic progression for each country.";
                break;
        }
        
        document.getElementById('hint-text').textContent = guidance;
    }

    clearHighlights() {
        this.selectedCountry = null;
        this.highlightedDataPoint = null;
        // Re-render current scene to clear highlights
        this.renderScene(this.currentScene);
    }

    // ANNOTATION TEMPLATE - Consistent annotation system
    createAnnotation(svg, annotation, x, y, width, height) {
        const dataPoint = this.data.find(d => d.date >= annotation.date);
        if (!dataPoint) return;

        const xPos = x(dataPoint.date);
        const yPos = y(dataPoint.confirmed);
        
        // Annotation line
        const lineLength = annotation.position === 'top' ? -30 : 30;
        svg.append('line')
            .attr('x1', xPos)
            .attr('x2', xPos)
            .attr('y1', yPos)
            .attr('y2', yPos + lineLength)
            .attr('stroke', annotation.color)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');

        // Annotation background
        const textGroup = svg.append('g')
            .attr('transform', `translate(${xPos}, ${yPos + lineLength + (annotation.position === 'top' ? -10 : 10)})`);

        // Background rectangle
        const titleWidth = annotation.title.length * 8;
        const descWidth = annotation.description.length * 6;
        const maxWidth = Math.max(titleWidth, descWidth);
        
        textGroup.append('rect')
            .attr('x', -maxWidth/2 - 10)
            .attr('y', annotation.position === 'top' ? -40 : 0)
            .attr('width', maxWidth + 20)
            .attr('height', 50)
            .attr('fill', annotation.color)
            .attr('opacity', 0.9)
            .attr('rx', 5);

        // Title text
        textGroup.append('text')
            .attr('x', 0)
            .attr('y', annotation.position === 'top' ? -20 : 15)
            .style('text-anchor', 'middle')
            .style('font-size', '11px')
            .style('font-weight', 'bold')
            .style('fill', 'white')
            .text(annotation.title);

        // Description text
        textGroup.append('text')
            .attr('x', 0)
            .attr('y', annotation.position === 'top' ? -5 : 30)
            .style('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', 'white')
            .text(annotation.description);
    }

    renderScene(sceneId) {
        const scene = this.scenes[sceneId];
        const container = document.getElementById('scene-container');
        container.innerHTML = '';
        document.getElementById('scene-title').textContent = scene.title;
        document.getElementById('scene-description').textContent = scene.description;

        container.className = ''; // Clear existing classes
        container.classList.add('fade-in', `scene-${scene.type}`);

        switch (scene.type) {
            case 'outbreak':
                this.renderOutbreak(container);
                break;
            case 'surge':
                this.renderSurge(container);
                break;
            case 'recovery':
                this.renderRecovery(container);
                break;
            case 'countries':
                this.renderCountries(container);
                break;
        }
        setTimeout(() => container.classList.remove('fade-in'), this.animationSpeed);
    }

    renderOutbreak(container) {
        // Focus on early 2020 data (first 100 days)
        const earlyData = this.data.slice(0, 100);
        const margin = { top: 40, right: 80, bottom: 60, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Use global x-axis scale for consistency
        const x = this.globalXScale.copy();
        const y = d3.scaleLinear()
            .domain([0, d3.max(earlyData, d => d.confirmed)])
            .range([height, 0]);

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")));
            
        svg.append('g')
            .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

        // Line chart
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.confirmed))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(earlyData)
            .attr('fill', 'none')
            .attr('stroke', '#e74c3c')
            .attr('stroke-width', 3)
            .attr('d', line);

        // Add scene-specific annotations using template
        const scene = this.scenes[0];
        scene.annotations.forEach(annotation => {
            this.createAnnotation(svg, annotation, x, y, width, height);
        });

        // Add time range highlight for current scene
        const sceneStart = new Date('2020-01-22');
        const sceneEnd = new Date('2020-05-01');
        svg.append('rect')
            .attr('x', x(sceneStart))
            .attr('y', 0)
            .attr('width', x(sceneEnd) - x(sceneStart))
            .attr('height', height)
            .attr('fill', '#e74c3c')
            .attr('opacity', 0.1);

        // Labels
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height + 45)
            .style('text-anchor', 'middle')
            .text('Date');
            
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -45)
            .style('text-anchor', 'middle')
            .text('Cases');

        // Tooltip
        const tooltip = d3.select(container).append('div').attr('class', 'tooltip').style('opacity', 0);

        svg.selectAll('.dot')
            .data(earlyData.filter((d, i) => i % 7 === 0))
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.confirmed))
            .attr('r', 3)
            .attr('fill', '#e74c3c')
            .on('mouseover', (event, d) => {
                tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(
                    `<strong>${d3.timeFormat("%b %Y")(d.date)}</strong><br>
                    Confirmed: ${d.confirmed.toLocaleString()}<br>
                    Deaths: ${d.deaths.toLocaleString()}`
                )
                .style('left', (event.offsetX + 20) + 'px')
                .style('top', (event.offsetY - 20) + 'px');
            })
            .on('mouseout', () => tooltip.transition().duration(200).style('opacity', 0));

        document.getElementById('hint-text').textContent = "Hover over points to see daily data. Use arrow keys to navigate.";
    }

    renderSurge(container) {
        // Focus on the peak period (March-July 2020)
        const peakData = this.data.filter(d => 
            d.date >= new Date('2020-03-01') && d.date <= new Date('2020-07-31')
        );
        
        const margin = { top: 40, right: 80, bottom: 60, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Use global x-axis scale for consistency
        const x = this.globalXScale.copy();
        const y = d3.scaleLinear()
            .domain([0, d3.max(peakData, d => d.confirmed)])
            .range([height, 0]);

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")));
            
        svg.append('g')
            .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

        // Area chart for dramatic effect
        const area = d3.area()
            .x(d => x(d.date))
            .y0(height)
            .y1(d => y(d.confirmed))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(peakData)
            .attr('fill', '#e74c3c')
            .attr('opacity', 0.7)
            .attr('d', area);

        // Line overlay
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.confirmed))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(peakData)
            .attr('fill', 'none')
            .attr('stroke', '#c0392b')
            .attr('stroke-width', 3)
            .attr('d', line);

        // Add scene-specific annotations using template
        const scene = this.scenes[1];
        scene.annotations.forEach(annotation => {
            this.createAnnotation(svg, annotation, x, y, width, height);
        });

        // Add time range highlight for current scene
        const sceneStart = new Date('2020-03-01');
        const sceneEnd = new Date('2020-07-31');
        svg.append('rect')
            .attr('x', x(sceneStart))
            .attr('y', 0)
            .attr('width', x(sceneEnd) - x(sceneStart))
            .attr('height', height)
            .attr('fill', '#c0392b')
            .attr('opacity', 0.1);

        // Labels
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height + 45)
            .style('text-anchor', 'middle')
            .text('Date');
            
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -45)
            .style('text-anchor', 'middle')
            .text('Cases');

        // Tooltip
        const tooltip = d3.select(container).append('div').attr('class', 'tooltip').style('opacity', 0);

        svg.selectAll('.dot')
            .data(peakData.filter((d, i) => i % 7 === 0))
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.confirmed))
            .attr('r', 3)
            .attr('fill', '#c0392b')
            .on('mouseover', (event, d) => {
                tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(
                    `<strong>${d3.timeFormat("%b %Y")(d.date)}</strong><br>
                    Confirmed: ${d.confirmed.toLocaleString()}<br>
                    Deaths: ${d.deaths.toLocaleString()}`
                )
                .style('left', (event.offsetX + 20) + 'px')
                .style('top', (event.offsetY - 20) + 'px');
            })
            .on('mouseout', () => tooltip.transition().duration(200).style('opacity', 0));

        document.getElementById('hint-text').textContent = "The surge shows the devastating peak of the pandemic. Hover for details.";
    }

    renderRecovery(container) {
        // Focus on the recovery period (2021 onwards)
        const recoveryData = this.data.filter(d => d.date >= new Date('2021-01-01'));
        
        const margin = { top: 40, right: 120, bottom: 60, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Use global x-axis scale for consistency
        const x = this.globalXScale.copy();
        const y = d3.scaleLinear()
            .domain([0, d3.max(recoveryData, d => d.confirmed)])
            .range([height, 0]);

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")));
            
        svg.append('g')
            .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

        // Dual line chart showing cases and deaths
        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.confirmed))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(recoveryData)
            .attr('fill', 'none')
            .attr('stroke', '#27ae60')
            .attr('stroke-width', 3)
            .attr('d', line);

        // Deaths line (scaled to fit)
        const deathScale = d3.scaleLinear()
            .domain([0, d3.max(recoveryData, d => d.deaths)])
            .range([height, 0]);

        const deathLine = d3.line()
            .x(d => x(d.date))
            .y(d => deathScale(d.deaths))
            .curve(d3.curveMonotoneX);

        svg.append('path')
            .datum(recoveryData)
            .attr('fill', 'none')
            .attr('stroke', '#8e44ad')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5')
            .attr('d', deathLine);

        // Add right-side y-axis for deaths
        svg.append('g')
            .attr('transform', `translate(${width + 40},0)`)
            .call(d3.axisRight(deathScale).tickFormat(d3.format(".2s")));

        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - 150}, 20)`);
            
        legend.append('line')
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', 0)
            .attr('y2', 0)
            .attr('stroke', '#27ae60')
            .attr('stroke-width', 3);
            
        legend.append('text')
            .attr('x', 25)
            .attr('y', 5)
            .style('font-size', '12px')
            .text('Cases');
            
        legend.append('line')
            .attr('x1', 0)
            .attr('x2', 20)
            .attr('y1', 20)
            .attr('y2', 20)
            .attr('stroke', '#8e44ad')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');
            
        legend.append('text')
            .attr('x', 25)
            .attr('y', 25)
            .style('font-size', '12px')
            .text('Deaths');

        // Add scene-specific annotations using template
        const scene = this.scenes[2];
        scene.annotations.forEach(annotation => {
            this.createAnnotation(svg, annotation, x, y, width, height);
        });

        // Add time range highlight for current scene
        const sceneStart = new Date('2021-01-01');
        const sceneEnd = new Date('2023-12-31');
        svg.append('rect')
            .attr('x', x(sceneStart))
            .attr('y', 0)
            .attr('width', x(sceneEnd) - x(sceneStart))
            .attr('height', height)
            .attr('fill', '#27ae60')
            .attr('opacity', 0.1);

        // Labels
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height + 45)
            .style('text-anchor', 'middle')
            .text('Date');
            
        // Left y-axis label (Cases)
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -45)
            .style('text-anchor', 'middle')
            .text('Cases');
            
        // Right y-axis label (Deaths)
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', width + 80)
            .attr('y', height / 2)
            .attr('transform', `rotate(90, ${width + 80}, ${height / 2})`)
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', '#8e44ad')
            .text('Deaths');

        // Tooltip
        const tooltip = d3.select(container).append('div').attr('class', 'tooltip').style('opacity', 0);

        svg.selectAll('.dot')
            .data(recoveryData.filter((d, i) => i % 30 === 0))
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.confirmed))
            .attr('r', 3)
            .attr('fill', '#27ae60')
            .on('mouseover', (event, d) => {
                tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(
                    `<strong>${d3.timeFormat("%b %d, %Y")(d.date)}</strong><br>
                    Confirmed: ${d.confirmed.toLocaleString()}<br>
                    Deaths: ${d.deaths.toLocaleString()}`
                )
                .style('left', (event.offsetX + 20) + 'px')
                .style('top', (event.offsetY - 20) + 'px');
            })
            .on('mouseout', () => tooltip.transition().duration(200).style('opacity', 0));

        document.getElementById('hint-text').textContent = "The recovery shows the impact of vaccines and public health measures.";
    }

    renderCountries(container) {
        // Show all countries from the processed data
        const allCountries = Object.keys(this.countrySummary);
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
        
        const margin = { top: 40, right: 120, bottom: 60, left: 60 };
        const width = 800 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
        
        const svg = d3.select(container)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Filter data for all countries across the full timeline
        const countryData = this.countryData.filter(d => 
            allCountries.includes(d.country)
        );

        // Use global x-axis scale for consistency
        const x = this.globalXScale.copy();
        const y = d3.scaleLinear()
            .domain([0, d3.max(countryData, d => d.confirmed)])
            .range([height, 0]);

        // Axes
        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %Y")));
            
        svg.append('g')
            .call(d3.axisLeft(y).tickFormat(d3.format(".2s")));

        // Create lines for each country
        allCountries.forEach(country => {
            const countryLineData = countryData.filter(d => d.country === country);
            
            const line = d3.line()
                .x(d => x(d.date))
                .y(d => y(d.confirmed))
                .curve(d3.curveMonotoneX);

            svg.append('path')
                .datum(countryLineData)
                .attr('fill', 'none')
                .attr('stroke', colorScale(country))
                .attr('stroke-width', 2)
                .attr('d', line);
        });

        // Legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width + 10}, 0)`);
            
        allCountries.forEach((country, i) => {
            const legendItem = legend.append('g')
                .attr('transform', `translate(0, ${i * 25})`);
                
            legendItem.append('line')
                .attr('x1', 0)
                .attr('x2', 20)
                .attr('y1', 0)
                .attr('y2', 0)
                .attr('stroke', colorScale(country))
                .attr('stroke-width', 2);
                
            legendItem.append('text')
                .attr('x', 25)
                .attr('y', 5)
                .style('font-size', '12px')
                .text(country);
        });

        // Add time range highlight for full timeline
        const sceneStart = new Date('2020-01-22');
        const sceneEnd = new Date('2023-12-31');
        svg.append('rect')
            .attr('x', x(sceneStart))
            .attr('y', 0)
            .attr('width', x(sceneEnd) - x(sceneStart))
            .attr('height', height)
            .attr('fill', '#3498db')
            .attr('opacity', 0.05);

        // Labels
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', width / 2)
            .attr('y', height + 45)
            .style('text-anchor', 'middle')
            .text('Date');
            
        svg.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -45)
            .style('text-anchor', 'middle')
            .text('Cases');

        // Tooltip
        const tooltip = d3.select(container).append('div').attr('class', 'tooltip').style('opacity', 0);

        // Add interactive points
        svg.selectAll('.country-dot')
            .data(countryData.filter((d, i) => i % 30 === 0))
            .enter()
            .append('circle')
            .attr('class', 'country-dot')
            .attr('cx', d => x(d.date))
            .attr('cy', d => y(d.confirmed))
            .attr('r', 3)
            .attr('fill', d => colorScale(d.country))
            .on('mouseover', (event, d) => {
                tooltip.transition().duration(200).style('opacity', 1);
                tooltip.html(
                    `<strong>${d.country}</strong><br>
                    <strong>${d3.timeFormat("%b %Y")(d.date)}</strong><br>
                    Confirmed: ${d.confirmed.toLocaleString()}<br>
                    Deaths: ${d.deaths.toLocaleString()}`
                )
                .style('left', (event.offsetX + 20) + 'px')
                .style('top', (event.offsetY - 20) + 'px');
            })
            .on('mouseout', () => tooltip.transition().duration(200).style('opacity', 0));

        document.getElementById('hint-text').textContent = "Compare all countries. Hover over lines for details.";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CovidNarrative();
});