"use strict"

const kickstartContainer = document.getElementById("kickstart-div");
const movieContainer = document.getElementById("movie-div");
const gameContainer = document.getElementById("game-div");
const description = document.getElementById("description");
const tooltip = document.getElementById("tooltip");
const legend = document.getElementById("legend");
const title = document.getElementById("title");
const kickstartLegend = document.getElementById("kickstart-legend");
const movieLegend = document.getElementById("movie-legend");
const gameLegend = document.getElementById("game-legend");

const tooltipDistance = 10;
const legendTileSize = 40;
const legendBorderOffset = 5;
const tilePadding = 1;
const aestheticOffset = 7;
const height = 500;
const width = 900;

const kickstarterPledgeURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json";
const movieSalesURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";
const videoGameSalesURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";

const kickstartLocalURL = "/localData/kickstarter-funding-data.json";
const movieLocalURL = "/localData/movie-data.json";
const gameLocalURL = "/localData/video-game-sales-data.json";

const firstGraph = "kickstart";
const secondGraph = "movie";
const thirdGraph = "game";

const containerList = [
    kickstartContainer,
    movieContainer,
    gameContainer
];
const legendList = [
    kickstartLegend,
    movieLegend,
    gameLegend
];
const descriptionList = {
    "kickstart": {
        "title": "Kickstarter Pledges",
        "text": "Top 100 Most Pledged Kickstarter Campaigns Grouped By Category"
    },
    "movie": {
        "title": "Movie Sales",
        "text": "Top 100 Highest Grossing Movies Grouped By Genre"
    },
    "game": {
        "title": "Video Game Sales",
        "text": "Top 100 Most Sold Video Games Grouped by Platform"
    }
};

let currentGraph ="kickstart";
let tileSpacing = 15;
let partialClassName;
let kickstartData;
let movieData;
let gameData;
let treeMap;
let dataset;
let root;
let currentSVG;
let kickstartSVG;
let movieSVG;
let gameSVG;

let csvFile;


function GetDataToCreateGraph(item = 0)
{
    const urlAndData = [
        kickstarterPledgeURL, 
        movieSalesURL, 
        videoGameSalesURL, 
    ];

    const currentURL = urlAndData[item];

    if(item < 3)
    {
        CreateSVG();
        
        d3.json(currentURL)
            .then((data) => FilterData(data))
            .then(() => CreateGraph())
            .then(() => {
                    (item < 1) ? currentGraph = "movie" : currentGraph = "game";
                    GetDataToCreateGraph(item + 1);
            })
            .catch((error) => {
                    console.log("Couldn't Fetch External Data: ", error);
            });
    }
    else
    {
        DrawGraph();
        HideAllSVG();
        ShowTargetSVG("kickstart")
    }

}


function CreateSVG()
{
    if(currentSVG == null)
    {
        kickstartSVG = d3.create("svg")
                    .attr("width", width)
                    .attr("height", height);
        movieSVG = d3.create("svg")
                    .attr("width", width)
                    .attr("height", height);
        gameSVG = d3.create("svg")
                    .attr("width", width)
                    .attr("height", height);
    }

    switch(currentGraph)
    {
        case firstGraph:
            currentSVG = kickstartSVG;
            partialClassName = "kickstart";
            break;
        case secondGraph:
            currentSVG = movieSVG;
            partialClassName = "movie";
            break;
        case thirdGraph:
            currentSVG = gameSVG;
            partialClassName = "game";
            break;
    }
}


function FilterData(data)
{
    dataset = data;
}


function CreateGraph()
{
    CreateRoot();
    CreateTreeMap();
    CreateTiles();
    CreateLegend();
}


function CreateRoot()
{
    root = d3.hierarchy(dataset)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value)
}


function CreateTreeMap()
{
    treeMap = d3.treemap()
                .size([width, height])
                (root);
}


function CreateTiles()
{
    tileSpacing += tilePadding;

    currentSVG.selectAll(`.rect-${partialClassName}`)
    .data(root.leaves())
    .enter()
    .append("rect")
        .attr("class", `tile rect-${partialClassName}`)
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("stroke", "gray")
        .attr("fill", d => SetLegendColor(d.data.category))
        .attr("data-name", d => d.data.name)
        .attr("data-category", d => d.data.category)
        .attr("data-value", d => d.data.value)
        .on("mouseover", (event) => ToggleTooltip(event))
        .on("mouseout", (event) => ToggleTooltip(event))

    currentSVG.selectAll(`.text-${partialClassName}`)
    .data(root.leaves())
    .enter()
    .append("text")
        .attr("class", `text-${partialClassName}`)
        .attr("x", d => d.x0 + tileSpacing)
        .attr("y", d => d.y0 + tileSpacing)
        .attr("width", d => d.x1 - (d.x0 + tilePadding))
        .text(d => d.data.name.match(/\w+/)[0] + "\n" + d.data.value)
        .attr("font-size", "0.8rem")
        .attr("fill", "white")
}


function DrawGraph()
{
    kickstartContainer.append(kickstartSVG.node());
    movieContainer.append(movieSVG.node());
    gameContainer.append(gameSVG.node());
}


function HideAllSVG()
{
    containerList.map(item => {
        item.style.visibility = "hidden";
        item.style.display = "none"
    });

    legendList.map(item => {
        item.style.visibility = "hidden";
        item.style.display = "none"
    });

}


function ShowTargetSVG(targetSvg)
{
    const currentContainer = containerList.filter(item => (item.id == `${targetSvg}-div`))[0];
    currentContainer.style.visibility = "visible";
    currentContainer.style.display = "block";

    const currentLegend = legendList.filter(item => (item.id == `${targetSvg}-legend`))[0];
    currentLegend.style.visibility = "visible";
    currentLegend.style.display = "block";

    title.textContent = descriptionList[`${targetSvg}`].title;
    description.textContent = descriptionList[`${targetSvg}`].text;
}


function ShowSelectedSVG(event)
{
    HideAllSVG();

    ShowTargetSVG(event.target.id);
}


function CreateLegend()
{
    const step = dataset.children.map(item => item.children[0].category).length

    d3.select(`#${partialClassName}-legend`)
        .selectAll(".legend-item")
        .data(dataset.children)
        .enter()
        .append("rect")
            .attr("x", (_, i) => (legendBorderOffset + legendTileSize) * (i + 1))
            .attr("y", (_, i) => legendTileSize + legendBorderOffset * ((i % 2 == 0)? aestheticOffset : -aestheticOffset))
            .attr("width", legendTileSize)
            .attr("height", legendTileSize)
            .attr("class", "legend-item")
            .attr("data-value", d => d.children[0].category)
            .attr("fill", (_, i) => SetLegendColor(i))
            .on("mouseover", (event) => ToggleTooltip(event))
            .on("mouseout", (event) => ToggleTooltip(event))

    d3.select(`#${partialClassName}-legend`)
        .selectAll(`.${partialClassName}-legend-text`)
        .data(dataset.children)
        .enter()
        .append("text")
            .attr("class", `${partialClassName}-legend-text`)
            .text(d => d.children[0].category)
            .attr("x", (_, i) => (legendBorderOffset + legendTileSize) * (i + 1))
            .attr("y", (_, i) => 100 + legendBorderOffset * ((i % 2 == 0)? aestheticOffset : -aestheticOffset))
            .attr("width", legendTileSize)
            .attr("font-size", "0.7rem")
            
            .attr("fill", "white")
}


function SetLegendColor(i)
{
    const categoriesList = dataset.children.map(item => item.children[0].category);
    const totalOfCategories = categoriesList.length;

    let colorPart;
    if(typeof(i) == typeof(0))
    {
        colorPart = (255 / totalOfCategories) * i;
    }
    else
    {
        colorPart = (255 / totalOfCategories) * categoriesList.indexOf(i);
    }

    return `rgb(50, ${colorPart}, 150)`;
}


function ToggleTooltip(event)
{
    tooltip.style.top = event.pageY + tooltipDistance +"px";
    tooltip.style.left = event.pageX + tooltipDistance +"px";

    tooltip.dataset.value = event.target.dataset.value;

    let newText;
    
    if(event.target.classList[0] == "legend-item")
    {
        newText = tooltip.dataset.value;
        tooltip.style.top = event.pageY - aestheticOffset * tooltipDistance +"px";
    }
    else
    {
        newText = `${event.target.dataset.name}, ${event.target.dataset.category}, ${event.target.dataset.value}`;
    }
    tooltip.textContent = newText;
    
    (tooltip.style.visibility != "visible") ?
    tooltip.style.visibility = "visible":
    tooltip.style.visibility = "hidden";
}


GetDataToCreateGraph();