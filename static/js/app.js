// We use the following line to start the app
function startup() {
    // Using D3 we select the dropdown
    let selector = d3.select("#selDataset");

    // We load data from samples.json using a Promise
    d3.json("samples.json").then(function(samplesData){
        // We extract names from the loaded data
        let names = samplesData.names;

        // In order to dynamically populate the dropdown with options we use the following code
        selector.selectAll("option")
            .data(names)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d);

        // We use the following line to get the initial selected value from the names array
        let initial = names[0];

        // We call functions to build plots and display demographics for the initial selection
        buildPlots(initial);
        demographics(initial);
    });
}

// This is the function to handle dropdown selection changes
function optionChanged(newID){
    // Call functions to build plots and display demographics for the selected ID
    buildPlots(newID);
    demographics(newID);
}

// This is the function to build and update the plots based on the selected ID
function buildPlots(id) {
    // We do this to load data from samples.json using a Promise
    d3.json("samples.json").then(function(samplesData){
        // We filter samples based on the selected ID
        let filtered = samplesData.samples.filter(sample => sample.id == id);
        let result = filtered[0];

        // We process data to prepare for plotting
        let Data = [];
        for (let i=0; i<result.sample_values.length; i++){
            Data.push({
                id: `OTU ${result.otu_ids[i]}`,
                value: result.sample_values[i],
                label: result.otu_labels[i]
            });
        }

        // We sort and extract the top 10 values for the horizontal bar chart
        let Sorted = Data.sort(function compareFunction(a,b){
            return b.value - a.value;
        }).slice(0,10);
        
        // We reverse the sorted data for horizontal bar chart
        let reversed = Sorted.sort(function compareFunction(a,b){
            return a.value - b.value;
        })
        
        // We define trace and layout for the bar chart
        let traceBar = {
            type: "bar",
            orientation: "h",
            x: reversed.map(row=> row.value),
            y: reversed.map(row => row.id),
            text: reversed.map(row => row.label)
        };
        let data = [traceBar];
        let layout = {
            yaxis: {autorange: true},
        };
        
        // We create a new bar chart using Plotly
        Plotly.newPlot("bar", data, layout);

        // We define trace and layout for the bubble chart
        let trace1 = {
            x: result.otu_ids,
            y: result.sample_values,
            mode: "markers",
            marker: {
                size: result.sample_values,
                color: result.otu_ids,
                colorscale: "Viridis"
            },
        };
        let data1 = [trace1]
        let layout1 = {
            xaxis: {title:"OTU ID"},
            width: window.width
        };

        // We create a new bubble chart using Plotly
        Plotly.newPlot("bubble", data1, layout1);
    });
}

// This is the function to display demographics information based on the selected ID
function demographics(id) {
    // We load data from samples.json using a Promise
    d3.json("samples.json").then(function(samplesData){
        // We filter metadata based on the selected ID
        let filtered = samplesData.metadata.filter(sample => sample.id == id);

        // We select the container for demographics information
        let selection = d3.select("#sample-metadata");

        // We clear existing content
        selection.html("");
        
        // We display demographics information using h5 elements
        Object.entries(filtered[0]).forEach(([k,v]) => {
            selection.append("h5")
                .text(`${k}: ${v}`);
        });
    })
}

startup();
