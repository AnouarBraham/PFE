google.charts.load('current', { packages: ['corechart', 'table'] });

google.charts.setOnLoadCallback(() => {


    drawTotalProductCountChart();
    drawProductTable();
    
});

async function fetchTotalProductCount() {
    try {
        const response = await fetch('http://localhost:3000/histovente/count');
        if (!response.ok) {
            throw new Error('Failed to fetch total product count');
        }
        const totalCount = await response.json();
        return totalCount;
    } catch (error) {
        console.error('Error fetching total product count:', error);
        throw error;
    }
}



let totalProductsChart = null; // Declare a variable to store the chart instance
let totalProductsCard = null; // Declare a variable to store the KPI card element

async function drawTotalProductCountChart() {
    try {
        const totalCount = await fetchTotalProductCount();


        const kpiCardContainer = document.getElementById('kpi-card-container');
        // Create or update the KPI card content
        if (!totalProductsCard) {
            totalProductsCard = document.createElement('div');
            totalProductsCard.classList.add('kpi-card');
            kpiCardContainer.appendChild(totalProductsCard);
        }

        // Update card content with the total product count
        totalProductsCard.innerHTML = `
            <h3>Total Products</h3>
            <p>${totalCount}</p>
        `;

        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Category');
        data.addColumn('number', 'Count');
        data.addRow(['Total Products', totalCount]);

        const options = {
            title: 'Total Products',
            legend: { position: 'none' },
            colors: ['#FF5733'],
        };

        // Destroy the previous chart if it exists
        if (totalProductsChart) {
            totalProductsChart.clearChart();
        }

        // Instantiate and render the new chart
        totalProductsChart = new google.visualization.BarChart(document.getElementById('total-products-chart-container'));
        totalProductsChart.draw(data, options);

    } catch (error) {
        console.error('Error drawing total products chart:', error);
    }
}





async function fetchAllProductNames() {
    try {
        const response = await fetch('http://localhost:3000/histovente/allProductNames');
        if (!response.ok) {
            throw new Error('Failed to fetch all product names');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching all product names:', error);
        throw error;
    }
}

async function drawProductTable() {
    try {
        const productNames = await fetchAllProductNames();
        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Product Name');
        productNames.forEach(name => {
            data.addRow([name]);
        });

        const options = {
            title: 'Product Names',
            width: '100%',
            height: '100%'
        };

        const table = new google.visualization.Table(document.getElementById('product-table-container'));
        table.draw(data, options);

        google.visualization.events.addListener(table, 'select', function () {
            const selection = table.getSelection();
            if (selection.length === 1) {
                const productName = productNames[selection[0].row]; // Get the product name directly from the array
                drawSalesByDayOfWeekChart(productName); // Update function name
                getProductStoresAndDrawChart(productName);
                drawAverageSellingPriceChart(productName);
                drawTotalQuantitySoldByFamilleChart(productName);
                drawReturnsChart(productName);
                drawLibTaillesChart(productName);
            }
        });
    } catch (error) {
        console.error('Error drawing product table:', error);
    }
}








async function fetchSalesByDayOfWeek(productName) {
    try {
        const response = await fetch(`http://localhost:3000/histovente/allProductNamesWithMostSalesByDay/${productName}`);
        if (!response.ok) {
            throw new Error('Failed to fetch sales by day of week');
        }
        const data = await response.json();
        // Transform the data as needed
        return data;
    } catch (error) {
        console.error('Error fetching sales by day of week:', error);
        throw error;
    }
}





let chart = null;

async function drawSalesByDayOfWeekChart(productName) {
    try {
        // Fetch sales data by day of week for the selected product
        const salesData = await fetchSalesByDayOfWeek(productName);

        // Prepare data for the chart
        const categories = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const seriesData = [{
            name: productName,
            data: Array(7).fill(0)
        }];

        salesData.forEach(dataPoint => {
            const dayOfWeekIndex = categories.indexOf(dataPoint.dayOfWeek);
            if (dayOfWeekIndex !== -1) {
                seriesData[0].data[dayOfWeekIndex] = dataPoint.totalSales;
            }
        });

        const options = {
            series: seriesData,
            chart: {
                height: 520,
                type: 'radar',
                toolbar: {
                    show: false
                },
                background: 'white', // Set background color
            },
            title: {
                text: `Sales by Day of Week for ${productName}`,
                align: 'center',
                style: {
                    fontSize: '20px', // Increase title font size
                    color: '#333', // Set title color
                }
            },
            xaxis: {
                categories: categories,
                labels: {
                    style: {
                        fontSize: '14px', // Increase label font size
                        colors: ['#333'] // Set label color
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '10px',
                        colors: ['#333']
                    }
                }
            },
            fill: {
                opacity: 0.7, // Adjust fill opacity for better visibility
            },
            markers: {
                size: 5, // Increase marker size
                colors: ['#008FFB'] // Set marker color
            },
            stroke: {
                width: 2,
                colors: ['#008FFB'] // Set stroke color
            },
        };

        // Destroy the previous chart if it exists
        if (chart) {
            chart.destroy();
        }

        // Instantiate and render the chart
        chart = new ApexCharts(document.querySelector("#sales-by-day-of-week-table-container"), options);
        chart.render();

    } catch (error) {
        console.error('Error drawing sales by day of week chart:', error);
    }
}







async function fetchProductStores(productName) {
    try {
        const response = await fetch(`http://localhost:3000/histovente/stores/${productName}`);
        if (!response.ok) {
            throw new Error('Failed to fetch product stores');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching product stores:', error);
        throw error;
    }
}



function drawStoresChart(productName, stores) {
    // Get the chart container
    const chartContainer = document.querySelector("#stores_chart_div");
    
    // Clear any existing content in the chart container
    chartContainer.innerHTML = '';

    // Create the search input
    const searchInput = document.createElement('input');
    searchInput.setAttribute('type', 'text');
    searchInput.setAttribute('id', 'search-input');
    searchInput.setAttribute('placeholder', 'Search for Store Name');
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const storeNameCell = row.querySelector('td:first-child');
            if (storeNameCell) {
                const storeName = storeNameCell.textContent.toLowerCase();
                if (storeName.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            }
        });
    });

    // Create a title for the product
    const title = document.createElement('h3');
    const productTitle = document.createElement('span');
    productTitle.textContent = 'Product: ';
    productTitle.style.color = '#007bff'; // Set the color of "Product"
    title.appendChild(productTitle);

    // Add product name with a different color
    const productNameSpan = document.createElement('span');
    productNameSpan.textContent = productName;
    productNameSpan.style.color = '#FF5733'; // Set a different color for the product name
    title.appendChild(productNameSpan);

    // Add the rest of the title
    title.appendChild(document.createTextNode(' - Quantity around stores'));

    // Append the title and search input to the chart container
    chartContainer.appendChild(title);
    chartContainer.appendChild(searchInput);

    // Create the table element
    const table = document.createElement('table');
    table.classList.add('stores-table');

    // Create the table header row
    const headerRow = document.createElement('tr');

    // Add headers for store name and product count
    const storeNameHeader = document.createElement('th');
    storeNameHeader.textContent = 'Store Name';
    headerRow.appendChild(storeNameHeader);

    const productCountHeader = document.createElement('th');
    productCountHeader.textContent = 'Product Count';
    headerRow.appendChild(productCountHeader);

    // Append the header row to the table
    table.appendChild(headerRow);

    // Create a row for each store and populate it with data
    stores.forEach(store => {
        const row = document.createElement('tr');

        // Add store name cell
        const storeNameCell = document.createElement('td');
        storeNameCell.textContent = store.storeName;
        row.appendChild(storeNameCell);

        // Add product count cell
        const productCountCell = document.createElement('td');
        productCountCell.textContent = store.productCount;
        row.appendChild(productCountCell);

        // Append the row to the table
        table.appendChild(row);
    });

    // Append the table to the chart container
    chartContainer.appendChild(table);

    // Set the chart container's style to enable scrolling
    chartContainer.style.overflow = 'auto';
    chartContainer.style.maxHeight = '600px'; // Set a fixed height for the container

    // Add styles to the table to create lines between values
    table.style.borderCollapse = 'collapse';
    table.style.width = '100%';
    const tableHeaders = table.querySelectorAll('th, td');
    tableHeaders.forEach(header => {
        header.style.border = '1px solid #ddd';
        header.style.padding = '8px';
        header.style.textAlign = 'left';
    });
}





async function getProductStoresAndDrawChart(productName) {
    try {
        const stores = await fetchProductStores(productName);
        drawStoresChart(productName, stores);
    } catch (error) {
        console.error('Error fetching product stores and drawing chart:', error);
    }
}







async function fetchAverageSellingPriceByProductFamily(productName) {
    try {
        const response = await fetch(`http://localhost:3000/histovente/averagesellingpriceproducts/${productName}`);
        if (!response.ok) {
            throw new Error('Failed to fetch average selling price by product family');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching average selling price by product family:', error);
        throw error;
    }
}





let chart_v1 = null;

async function drawAverageSellingPriceChart(productName) {
    try {
        const data = await fetchAverageSellingPriceByProductFamily(productName);
        console.log(data);
        // Sort data by year and month in ascending order
        data.sort((a, b) => {
            if (a.year === b.year) {
                return a.month - b.month;
            } else {
                return a.year - b.year;
            }
        });

        const options = {
            series: [{
                name: 'Average Selling Price',
                data: data.map(item => parseFloat(item.averageSellingPrice.toFixed(2))) // Extract and format the average selling price values to two decimal places
            }],
            chart: {
                height: 500,
                type: 'line', // Use a line chart type
                animations: {
                    speed: 500
                }
            },
            colors: ['#d4526e'],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth', // Use a smooth curve for the line
                width: 2
            },
            title: {
                text: `Average Selling Price by Month for ${productName}`,
                align: 'left',
                offsetX: 14
            },
            xaxis: {
                categories: data.map(item => `${item.year}/${item.month}`), // Extract the year and month values
                title: {
                    text: 'Year/Month'
                }
            },
            yaxis: {
                title: {
                    text: 'Average Selling Price'
                }
            },
            markers: {
                size: 4,
                colors: ['#d4526e'],
                strokeColors: ['#fff'],
                strokeWidth: 2
            },
            tooltip: {
                shared: true,
                intersect: false,
                y: {
                    formatter: function (val) {
                        return val.toFixed(2); // Format the tooltip value to two decimal places
                    }
                }
            },
            grid: {
                borderColor: '#f1f1f1'
            }
        };

        // Destroy the previous chart if it exists
        if (chart_v1) {
            chart_v1.destroy();
        }

        // Instantiate and render the chart
        chart_v1 = new ApexCharts(document.querySelector("#avg_chart"), options);
        chart_v1.render();
    } catch (error) {
        console.error('Error drawing average selling price chart:', error);
    }
}







async function fetchTotalQuantitySoldByFamille(famille) {
    try {
        const response = await fetch(`http://localhost:3000/histovente/calculateTotalQuantitySoldByFamille/${famille}`);
        if (!response.ok) {
            throw new Error('Failed to fetch total quantity sold by famille');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching total quantity sold by famille:', error);
        throw error;
    }
}






async function drawTotalQuantitySoldByFamilleChart(productName) {
    try {
        const totalQuantitySoldData = await fetchTotalQuantitySoldByFamille(productName);

        console.log('Total Products:', totalQuantitySoldData);

        // Sort the totalQuantitySoldData array by year and month
        totalQuantitySoldData.sort((a, b) => {
            if (a.year !== b.year) {
                return a.year - b.year;
            } else {
                return a.month - b.month;
            }
        });

        // Prepare data for the chart
        const categories = totalQuantitySoldData.map(item => `${item.year}-${item.month < 10 ? '0' + item.month : item.month}`); // Format year and month
        const seriesData = totalQuantitySoldData.map(item => item.totalQuantitySold);

        const options = {
            series: [{
                name: 'Total Quantity Sold',
                data: seriesData
            }],
            chart: {
                height: 300,
                type: 'bar',
                toolbar: {
                    show: false
                }
            },
            plotOptions: {
                bar: {
                    columnWidth: '45%',
                    distributed: true,
                    borderRadius: 4, // Add border radius to the bars for better visibility
                    dataLabels: {
                        position: 'top' // Show data labels on top of bars
                    }
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function (val) {
                    return val.toFixed(0); // Format the values to show integers
                },
                offsetY: -15, // Adjust the position of data labels to make them visible
                style: {
                    fontSize: '12px',
                    colors: ['#333'] // Set color for data labels
                }
            },
            tooltip: {
                enabled: true,
                y: {
                    formatter: function (value) {
                        return 'Total Quantity: ' + value;
                    }
                }
            },
            legend: {
                show: false
            },
            xaxis: {
                categories: categories, // Use the sorted categories
                labels: {
                    style: {
                        colors: ['#333'],
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'Total Quantity Sold'
                },
                labels: {
                    formatter: function (val) {
                        return val.toFixed(0); // Format y-axis labels without decimals
                    },
                    style: {
                        colors: '#333',
                        fontSize: '12px'
                    }
                }
            },
            title: {
                text: `Total Quantity Sold By the Product: ${productName}`,
                align: 'center',
                style: {
                    fontSize: '16px', // Set font size for title
                    color: '#333' // Set color for title
                }
            },
            grid: {
                borderColor: '#ddd' // Adjust the color of the grid lines for better visibility
            }
        };

        const chartContainer = document.getElementById('total-quantity-sold-chart-container');

        // Destroy the previous chart if it exists
        if (chartContainer.firstChild) {
            chartContainer.removeChild(chartContainer.firstChild);
        }

        const chart = new ApexCharts(chartContainer, options);
        chart.render();

    } catch (error) {
        console.error('Error drawing total quantity sold by famille chart:', error);
    }
}








async function getNumberOfReturnsForProduct(productName) {
    try {
        const response = await fetch(`http://localhost:3000/histovente/numberOfReturns/${productName}`);
        if (!response.ok) {
            throw new Error('Failed to fetch number of returns for product');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching number of returns for product:', error);
        throw error;
    }
}





let returnsChart = null; // Declare a variable to store the chart instance
let returnsCard = null; // Declare a variable to store the KPI card element

async function drawReturnsChart(productName) {
    try {
        const numberOfReturns = await getNumberOfReturnsForProduct(productName);

        const kpiCardContainer = document.getElementById('kpi-card-container');
        // Create or update the KPI card content
        if (!returnsCard) {
            returnsCard = document.createElement('div');
            returnsCard.classList.add('kpi-card');
            kpiCardContainer.appendChild(returnsCard);
        }

        // Update card content with the number of returns for the product
        returnsCard.innerHTML = `
            <h3>Returns for ${productName}</h3>
            <p>${numberOfReturns}</p>
        `;

        const options = {
            series: [{
                name: 'Returns',
                data: [numberOfReturns] // Use the fetched number of returns for the chart data
            }],
            chart: {
                type: 'bar',
                height: 500,
                animations: {
                    enabled: false
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '100%'
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                colors: ["#fff"],
                width: 0.2
            },
            labels: Array.apply(null, { length: 1 }).map(function(el, index) {
                return productName; // Set the label to the product name
            }),
            yaxis: {
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                labels: {
                    show: false
                },
                title: {
                    text: 'Number of Returns'
                }
            },
            grid: {
                position: 'back'
            },
            title: {
                text: `Number of Returns for ${productName}`,
                align: 'center', // Align the title to the center
                offsetY: 30,
                style: {
                    fontSize: '20px' // Increase the font size
                }
            },
            fill: {
                type: 'image',
                opacity: 1.00,
                image: {
                    src: ['https://www.alioze.com/wp-content/uploads/2021/08/retour-remboursement-e-commerce.jpg'],
                    width: 720,
                    height: 400
                }
            }
        };

        // Destroy the previous chart if it exists
        if (returnsChart) {
            returnsChart.destroy();
        }

        // Instantiate and render the new chart
        returnsChart = new ApexCharts(document.getElementById('returns-chart-container'), options);
        returnsChart.render();

    } catch (error) {
        console.error('Error drawing returns chart:', error);
    }
}









async function fetchLibTaillesNamesAndCountForProduct(productName) {
    try {
        const response = await fetch(`http://localhost:3000/histovente/getLibtaillesNamesAndCountForFamille/${productName}`);
        if (!response.ok) {
            throw new Error('Failed to fetch LibTailles names and counts for product');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching LibTailles names and counts for product:', error);
        throw error;
    }
}





let libTaillesChart = null; // Variable to store the chart instance

async function drawLibTaillesChart(productName) {
    try {
        const libTaillesData = await fetchLibTaillesNamesAndCountForProduct(productName);

        // Extracting libtaille names and counts from the fetched data
        const libTaillesNames = libTaillesData.map(item => item.libtaillesName);
        const libTaillesCounts = libTaillesData.map(item => item.count);

        // Constructing the series data for the chart
        const seriesData = [{
            data: libTaillesCounts
        }];

        
        const options = {
            series: seriesData,
            chart: {
                type: 'bar',
                height: 410
            },
            plotOptions: {
                bar: {
                    barHeight: '100%',
                    distributed: true,
                    horizontal: true,
                    dataLabels: {
                        position: 'bottom'
                    }
                }
            },
            dataLabels: {
                enabled: true,
                textAnchor: 'start',
                formatter: function (val, opt) {
                    return libTaillesNames[opt.dataPointIndex] + ': ' + val;
                },
                offsetX: 0,
                style: {
                    colors: ['black'] // Change the text color to black
                }
            },
            stroke: {
                width: 1,
                colors: ['#fff']
            },
            xaxis: {
                categories: libTaillesNames,
                labels: {
                    show: true,
                    offsetY: -15,
                    style: {
                        colors: 'black'
                    }
                }
            },
            yaxis: {
                labels: {
                    show: false
                }
            },
            title: {
                text: `LibTailles for product ${productName}`,
                align: 'center',
                floating: true
            },
            tooltip: {
                theme: 'dark',
                x: {
                    show: false
                },
                y: {
                    title: {
                        formatter: function () {
                            return '';
                        }
                    }
                }
            }
        };

        // Destroy existing chart instance if it exists
        if (libTaillesChart) {
            libTaillesChart.destroy();
            libTaillesChart = null;
        }

        const chartContainer = document.querySelector("#libtailles-chart-container");
        libTaillesChart = new ApexCharts(chartContainer, options);
        libTaillesChart.render();

    } catch (error) {
        console.error('Error drawing LibTailles chart:', error);
    }
}






document.getElementById("export-btn").addEventListener("click", function() {
    // Hide other sections
    document.getElementById("settings").style.display = "none";
    document.querySelectorAll(".update-chart-btn").forEach(function(btn) {
        btn.style.display = "none";
    });
    document.querySelector("nav").style.display = "none";
    
    // Open print dialog to save the container as PDF
    window.print();
    
    // Restore visibility of other sections
    document.getElementById("settings").style.display = "block";
    document.querySelectorAll(".update-chart-btn").forEach(function(btn) {
        btn.style.display = "block";
    });
    document.querySelector("nav").style.display = "block";
});






async function getLoggedInUserEmail() {
    try {
        const response = await fetch('http://localhost:3000/user/userInfo', {
            method: 'GET',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user information');
        }

        const userInfo = await response.json();
        const loggedInUserEmail = userInfo.email;

        return loggedInUserEmail;
    } catch (error) {
        console.error('Error retrieving logged-in user email:', error);
        throw new Error('Failed to retrieve logged-in user email');
    }
}





document.getElementById('activate-bot-btn').addEventListener('click', async () => {
    try {
        const email = await getLoggedInUserEmail();
        if (email) {
            const response = await fetch(`http://localhost:3000/histovente/execute-prediction/${email}`, {
                method: 'GET',
                credentials: 'include'
            });
            const result = await response.json();
            alert(result.message || result.error);
        } else {
            alert("Failed to retrieve user email.");
        }
    } catch (error) {
        console.error('Error activating bot:', error);
        alert('Failed to activate bot.');
    }
});
