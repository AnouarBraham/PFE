google.charts.load('current', { packages: ['corechart', 'bar', 'line', 'gauge'] });

google.charts.setOnLoadCallback(async function() {
    document.getElementById('loading-asp').style.display = 'block';
    drawASPKPIChart();


    document.getElementById('loading-store-count').style.display = 'block';
    drawStoreCountChart(); // New function to draw store count chart


    drawTotalProductCountChart();
});







// Fetch ASP data
async function fetchASP() {
    try {
        const response = await fetch('http://localhost:3000/histovente/averageSellingPrice');
        if (!response.ok) {
            throw new Error('Failed to fetch ASP data');
        }
        const aspData = await response.json();
        return aspData.toFixed(2);
    } catch (error) {
        console.error('Error fetching ASP data:', error);
        throw error;
    }
}

// Draw ASP KPI chart
// Draw ASP KPI chart
async function drawASPKPIChart(codeMag, aspValue) {
    try {
        createASPKpiCard('Average Selling Price', codeMag, aspValue); // Pass codeMag to the function

        var data = google.visualization.arrayToDataTable([
            ['KPI', 'Value'],
            ['ASP', {v: parseFloat(aspValue), f: parseFloat(aspValue).toFixed(2) + ' €' }]
        ]);

        var options = {
            title: `Average Selling Price for ${codeMag} (ASP)`,
            legend: 'none',
            colors: ['#007bff'],
        };

        var chart = new google.visualization.ColumnChart(document.getElementById('asp-kpi-chart-container'));
        chart.draw(data, options);

        document.getElementById('loading-asp').style.display = 'none';
        document.getElementById('asp-kpi-chart-container').style.display = 'block';
    } catch (error) {
        console.error('Error drawing ASP KPI chart:', error);
    }
}



// Global variable for ASP KPI card
let aspKpiCard;


// Create ASP KPI card
function createASPKpiCard(title, codeMag, value) {
    const kpiCardContainer = document.getElementById('kpi-card-container');
    
    // Check if the card already exists
    if (!aspKpiCard) {
        aspKpiCard = document.createElement('div');
        aspKpiCard.classList.add('kpi-card');
    
        const kpiTitle = document.createElement('h3');
        kpiTitle.textContent = `${title} for ${codeMag}`; // Include codeMag in the title
    
        const kpiValue = document.createElement('p');
        kpiValue.id = 'asp-kpi-value'; // Give the value element an ID for easy updating
        
        // Format the value to display only two digits after the decimal point
        const formattedValue = parseFloat(value).toFixed(2);
        kpiValue.textContent = `€${formattedValue}`;
    
        aspKpiCard.appendChild(kpiTitle);
        aspKpiCard.appendChild(kpiValue);
    
        kpiCardContainer.appendChild(aspKpiCard);
    } else {
        // Update the value of the existing card
        const kpiTitle = aspKpiCard.querySelector('h3');
        kpiTitle.textContent = `${title} for ${codeMag}`; // Update title with codeMag
        const kpiValue = document.getElementById('asp-kpi-value');
        
        // Format the value to display only two digits after the decimal point
        const formattedValue = parseFloat(value).toFixed(2);
        kpiValue.textContent = `€${formattedValue}`;
    }
}





async function fetchTotalQuantitySold(codeMag) {
    try {
        const response = await fetch(`http://localhost:3000/histovente/totalQuantitySoldByCodeMag/${codeMag}`);
        if (!response.ok) {
            throw new Error('Failed to fetch Total Quantity Sold data');
        }
        const totalQuantitySoldData = await response.json();
        return totalQuantitySoldData;
    } catch (error) {
        console.error('Error fetching Total Quantity Sold data:', error);
        throw error;
    }
}

// Draw total quantity sold KPI
async function drawTotalQuantitySoldKPI(codeMag) {
    try {
        const totalQuantitySoldData = await fetchTotalQuantitySold(codeMag);

        // Process totalQuantitySoldData to extract values for drawing chart
        const totalQuantitySoldValue = totalQuantitySoldData.reduce((total, item) => total + item.totalQuantitySold, 0);

        createTotalQuantitySoldKpiCard('Total Quantity Sold', totalQuantitySoldValue);
        drawTotalQuantitySoldChart(totalQuantitySoldData);
    } catch (error) {
        console.error('Error drawing Total Quantity Sold KPI:', error);
    }
}




function drawTotalQuantitySoldChart(totalQuantitySoldData) {
    // Sort the data by year and month in ascending order
    totalQuantitySoldData.sort((a, b) => {
        if (a.year !== b.year) {
            return a.year - b.year;
        } else {
            return a.month - b.month;
        }
    });

    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Date');
    data.addColumn('number', 'Total Quantity Sold');
    data.addColumn({ type: 'string', role: 'style' });

    // Generate colors dynamically based on the number of data points
    var colors = generateColors(totalQuantitySoldData.length);

    // Add data rows
    totalQuantitySoldData.forEach((item, index) => {
        // Format the date as "YYYY-MM" (e.g., "2023-05")
        var date = item.year + '-' + (item.month < 10 ? '0' : '') + item.month;
        data.addRow([date, item.totalQuantitySold, colors[index]]);
    });

    var options = {
        title: 'Total Quantity Sold by Years and Months',
        legend: { position: 'none' },
        hAxis: {
            title: 'Date',
            titleTextStyle: {
                color: '#333',
                italic: false
            },
            textStyle: {
                fontSize: 11 // Adjust the font size of the x-axis labels
            }
        },
        vAxis: {
            title: 'Total Quantity Sold',
            titleTextStyle: {
                color: '#333',
                italic: false
            },
            minValue: 0, // Ensure the minimum value is 0
            viewWindow: {
                min: 0 // Fix the minimum y-axis value
            },
            scaleType: 'log' // Use logarithmic scaling on the y-axis
        },
        chartArea: {
            width: '90%', // Adjust the width of the chart area
            height: '70%'
        },
        animation: {
            duration: 1000, // Animation duration in milliseconds
            easing: 'out' // Easing function for the animation
        }
    };

    // Define chart variable
    var chart = new google.visualization.ColumnChart(document.getElementById('total-quantity-chart-container'));

    // Draw the chart with the defined chart variable
    chart.draw(data, options);

    document.getElementById('loading-total-quantity').style.display = 'none';
    document.getElementById('total-quantity-chart-container').style.display = 'block';
}












// Function to generate colors dynamically based on the number of years
function generateColors(numColors) {
    var colors = [];
    for (var i = 0; i < numColors; i++) {
        var r = Math.floor(Math.random() * 128) + 128; // Generate lighter red component (128-255)
        var g = Math.floor(Math.random() * 128) + 128; // Generate lighter green component (128-255)
        var b = Math.floor(Math.random() * 128) + 128; // Generate lighter blue component (128-255)

        var color = 'rgb(' + r + ', ' + g + ', ' + b + ')';
        colors.push(color);
    }
    return colors;
}









let totalQuantitySoldKpiCard; // Declare a variable to store the card element

// Create total quantity sold KPI card
function createTotalQuantitySoldKpiCard(title, value) {
    const kpiCardContainer = document.getElementById('kpi-card-container');

    // Check if the card already exists
    if (!totalQuantitySoldKpiCard) {
        totalQuantitySoldKpiCard = document.createElement('div');
        totalQuantitySoldKpiCard.classList.add('kpi-card');

        const kpiTitle = document.createElement('h3');
        kpiTitle.textContent = title;

        const kpiValue = document.createElement('p');
        kpiValue.id = 'total-quantity-sold-kpi-value'; // Give the value element an ID for easy updating
        kpiValue.textContent = `${value} units`;

        totalQuantitySoldKpiCard.appendChild(kpiTitle);
        totalQuantitySoldKpiCard.appendChild(kpiValue);

        kpiCardContainer.appendChild(totalQuantitySoldKpiCard);
    } else {
        // Update the value of the existing card
        const kpiTitle = totalQuantitySoldKpiCard.querySelector('h3');
        kpiTitle.textContent = title;
        const kpiValue = document.getElementById('total-quantity-sold-kpi-value');
        kpiValue.textContent = `${value} units`;
    }
}



async function fetchTopProducts(codeMag) {
    try {
        const response = await fetch(`http://localhost:3000/histovente/topProductsByCodeMag/${codeMag}`);
        if (!response.ok) {
            throw new Error('Failed to fetch Top Products data');
        }
        const topProductsData = await response.json();
        return topProductsData;
    } catch (error) {
        console.error('Error fetching Top Products data:', error);
        throw error;
    }
}

async function drawTopProductsChart(codeMag) {
    try {
        const topProducts = await fetchTopProducts(codeMag);

        // Prepare chart data
        var chartData = [];
        chartData.push(['Product', 'Sales']);
        topProducts.forEach(product => {
        chartData.push([product.name, product.sales]);
        });
        var data = google.visualization.arrayToDataTable(chartData);

        var options = {
            title: `Sales of Top Products for CodeMag ${codeMag}`,
            // Other chart options...
        };

        var chart = new google.visualization.PieChart(document.getElementById('all-products-chart-container'));
        chart.draw(data, options);

        // Hide loading indicator and display the chart container
        document.getElementById('loading-all-products').style.display = 'none';
        document.getElementById('all-products-chart-container').style.display = 'block';
    } catch (error) {
        console.error('Error drawing Top Products chart:', error);
    }
}

// Example usage
async function drawAllProductsChart(codeMag) {
    try {
        // Fetch top products for the specified codeMag
        await drawTopProductsChart(codeMag);
    } catch (error) {
        console.error('Error drawing All Products chart:', error);
    }
}







document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('http://localhost:3000/histovente/firstDistinctCodeMagValues');
        if (!response.ok) {
            throw new Error('Failed to fetch distinct CodeMag values');
        }
        const codeMagValues = await response.json();
        console.log('Distinct CodeMag values:', codeMagValues);

        // Clear any existing table rows
        document.getElementById('storeTableBody').innerHTML = '';

        // Populate the table with store names
        codeMagValues.forEach(async codeMag => {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.textContent = codeMag;
            row.appendChild(cell);
            document.getElementById('storeTableBody').appendChild(row);

            // Add click event listener to each row
            row.addEventListener('click', async () => {
                try {
                    const ordersResponse = await fetch(`http://localhost:3000/histovente/ordersCountByCodeMag/${codeMag}`);
                    if (!ordersResponse.ok) {
                        throw new Error('Failed to fetch orders count');
                    }
                    const ordersCount = await ordersResponse.json();

                    const productsResponse = await fetch(`http://localhost:3000/histovente/count/${codeMag}`);
                    if (!productsResponse.ok) {
                        throw new Error('Failed to fetch products count');
                    }
                    const productsCount = await productsResponse.json();

                    const totalSalesResponse = await fetch(`http://localhost:3000/histovente/totalSalesByCodeMag/${codeMag}`);
                    if (!totalSalesResponse.ok) {
                        throw new Error('Failed to fetch total sales');
                    }
                    const totalSales = await totalSalesResponse.json();

                    // Display the fetched data
                    document.getElementById('slate1').innerHTML = `<span class="store-label">Store</span> <span class="store-name">${codeMag}</span>: <span class="store-value">${ordersCount}</span>`;
                    document.getElementById('slate2').innerHTML = `<span class="store-label">Store</span> <span class="store-name">${codeMag}</span>: <span class="store-value">${productsCount.count}</span>`;
                    document.getElementById('slate3').innerHTML = `<span class="store-label">Store</span> <span class="store-name">${codeMag}</span>: <span class="store-value">${totalSales}</span>`;





                    const totalSalesWithDiscountResponse = await fetch(`http://localhost:3000/histovente/totalSalesWithDiscount/${codeMag}`);
                    const totalSalesWithoutDiscountResponse = await fetch(`http://localhost:3000/histovente/totalSalesWithoutDiscount/${codeMag}`);
                    const totalQuantityWithPromotionResponse = await fetch(`http://localhost:3000/histovente/totalQuantityWithPromotion/${codeMag}`);
                    const totalQuantityWithoutPromotionResponse = await fetch(`http://localhost:3000/histovente/totalQuantityWithoutPromotion/${codeMag}`);
                    
                    if (!totalSalesWithDiscountResponse.ok || !totalSalesWithoutDiscountResponse.ok || !totalQuantityWithPromotionResponse.ok || !totalQuantityWithoutPromotionResponse.ok) {
                        throw new Error('Failed to fetch chart data');
                    }
                    
                    const totalSalesWithDiscount = await totalSalesWithDiscountResponse.json();
                    const totalSalesWithoutDiscount = await totalSalesWithoutDiscountResponse.json();
                    const totalQuantityWithPromotion = await totalQuantityWithPromotionResponse.json();
                    const totalQuantityWithoutPromotion = await totalQuantityWithoutPromotionResponse.json();
                    
                    // Define data and colors for Total Sales chart



                    // Define data and colors for Total Sales chart
                        const totalSalesData = [
                        ['Category', 'Value', { role: 'style' }],
                        ['With Discount', totalSalesWithDiscount, 'gold'],
                        ['Without Discount', totalSalesWithoutDiscount, 'blue'] // Set custom color for "Without Discount"
                        ];
                        
                        // Define data and colors for Total Quantity chart
                        const totalQuantityData = [
                            ['Category', 'Value', { role: 'style' }],
                            ['With Promotion',totalQuantityWithPromotion, 'gold'],
                            ['Without Promotion', totalQuantityWithoutPromotion, 'blue'] // Set custom color for "Without Promotion"
                        ];
                        
                        // Draw Google Bar Chart with customized colors and Euro symbol for Total Sales
                        drawGoogleBarChart(totalSalesData, 'totalSalesChartDiv', 'Total Sales (€)');
                        
                        // Draw Google Bar Chart with customized colors for Total Quantity
                        drawGoogleBarChart(totalQuantityData, 'totalQuantityChartDiv', 'Total Quantity (units)');






                    // Fetch and draw the average selling price chart
                    try {
                        const averageSellingPriceResponse = await fetch(`http://localhost:3000/histovente/averageSellingPriceByCodeMag/${codeMag}`);
                        if (!averageSellingPriceResponse.ok) {
                            throw new Error('Failed to fetch average selling price');
                        }
                        const averageSellingPrice = await averageSellingPriceResponse.json();
                        drawASPKPIChart(codeMag, averageSellingPrice);
                    } catch (error) {
                        console.error('Error fetching average selling price:', error);
                    }

                    // Draw total quantity sold KPI and top products for the clicked CodeMag
                    drawTotalQuantitySoldKPI(codeMag);
                    


                    drawAllProductsChart(codeMag); // Pass codeMag as parameter


                } catch (error) {
                    console.error('Error fetching data:', error);
                }







                try {
                    const totalTransactionsResponse = await fetch(`http://localhost:3000/histovente/totalTransactionsByCodeMag/${codeMag}`);
                    if (!totalTransactionsResponse.ok) {
                        throw new Error('Failed to fetch total transactions');
                    }
                    const totalTransactionsByMonth = await totalTransactionsResponse.json();
                    console.log('Total Transactions:', totalTransactionsByMonth);
                    // Draw the tree chart based on the fetched data
                    drawLineChart(totalTransactionsByMonth);
                } catch (error) {
                    console.error('Error fetching total transactions:', error);
                }






                try {
                    const salesResponse = await fetch(`http://localhost:3000/histovente/totalSalesByFamilyForStore/${codeMag}`);
                    if (!salesResponse.ok) {
                        throw new Error('Failed to fetch total sales by family');
                    }
                    const salesData = await salesResponse.json();

                    // Clear existing sales table
                    const salesTableBody = document.getElementById('salesTableBody');
                    salesTableBody.innerHTML = '';

                    // Populate sales table with family and total sales data
                    salesData.forEach(sale => {
                        const salesRow = document.createElement('tr');

                        const familyCell = document.createElement('td');
                        familyCell.textContent = sale.family;
                        salesRow.appendChild(familyCell);

                        const totalSalesCell = document.createElement('td');
                        totalSalesCell.textContent = sale.totalSales;
                        salesRow.appendChild(totalSalesCell);

                        salesTableBody.appendChild(salesRow);
                    });
                } catch (error) {
                    console.error('Error fetching sales data by family:', error);
                }


            });
        });






        document.getElementById("countryFilter").addEventListener("change", function() {
            var country = this.value.toLowerCase();
            var storeRows = document.querySelectorAll("#storeTableBody tr");
            
            storeRows.forEach(function(row) {
                var storeName = row.textContent.trim().toLowerCase();
                if (country === "france" && (storeName.startsWith("f") || storeName.startsWith("af"))) {
                    row.style.display = "table-row";
                } else if (country === "belgium" && storeName.startsWith("b")) {
                    row.style.display = "table-row";
                } else if (country === "spain" && (storeName.startsWith("e") || ["A261", "A321", "A341", "A215", "A207", "A339"].some(e => storeName.startsWith(e.toLowerCase())))) {
                    row.style.display = "table-row";
                } else if (country === "all") {
                    row.style.display = "table-row";
                } else {
                    row.style.display = "none";
                }
            });
        });
        




        // Add event listener for search input
        document.getElementById('searchInput').addEventListener('input', function (event) {
            const searchText = event.target.value.trim().toLowerCase();
            const rows = document.querySelectorAll('#storeTable tbody tr');
            rows.forEach(row => {
                const storeName = row.querySelector('td').textContent.trim().toLowerCase();
                if (storeName.includes(searchText)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });

    } catch (error) {
        console.error('Error fetching data:', error);
    }
});








let chart = null; // Variable to store the chart instance

function drawLineChart(totalTransactionsByMonth) {
    // Extracting years from the data
    const years = Object.keys(totalTransactionsByMonth);

    // Prepare series data
    const seriesData = years.map(year => ({
        name: year.toString(),
        data: Object.keys(totalTransactionsByMonth[year]).map(month => totalTransactionsByMonth[year][month])
    }));

    // Flatten the series data to create a single series
    const flatSeriesData = seriesData.reduce((acc, curr) => {
        curr.data.forEach((value, index) => {
            const monthYear = `${index + 1}/${curr.name}`; // Assuming 1-indexed months
            acc.push({
                x: monthYear,
                y: value
            });
        });
        return acc;
    }, []);

    // Sort the flat series data by month and year
    flatSeriesData.sort((a, b) => {
        const [aMonth, aYear] = a.x.split('/');
        const [bMonth, bYear] = b.x.split('/');
        if (aYear !== bYear) {
            return parseInt(aYear) - parseInt(bYear);
        } else {
            return parseInt(aMonth) - parseInt(bMonth);
        }
    });

    // Set chart options
    var options = {
        title: {
            text: 'Total Transactions by Month and Year',
            align: 'center',
            style: {
                fontSize: '13px',
                color: '#333' // Customize the color if needed
            }
        },
        chart: {
            height: 190,
            type: 'line'
        },
        series: [{
            name: 'Total Transactions',
            data: flatSeriesData
        }],
        xaxis: {
            type: 'category',
            labels: {
                rotate: -45,
                formatter: function(value) {
                    return value; // Show month and year as the label
                }
            }
        },
        yaxis: {
            title: {
                text: 'Total Transactions'
            }
        },
        tooltip: {
            x: {
                format: 'MMMM yyyy'
            }
        }
    };

    // Destroy the previous chart if it exists
    if (chart) {
        chart.destroy();
    }

    // Instantiate and render the line chart
    chart = new ApexCharts(document.querySelector("#transactions_div"), options);
    chart.render();
}














function drawGoogleBarChart(data, chartElementId, chartLabel) {
    var chartData = google.visualization.arrayToDataTable(data);
  
    var options = {
      title: chartLabel,
      legend: { position: 'none' },
    };
  
    var colors = data.slice(1).map(row => row[2]); // Get custom colors from the 'style' property in data array
  
    var series = colors.map((color, index) => ({ color })); // Assign each color to a series in the chart
  
    options.series = series;
  
    var chart = new google.visualization.BarChart(document.getElementById(chartElementId));
    chart.draw(chartData, options);
  }









  let storeCountCard = null;

  async function drawStoreCountChart() {
      try {
          const response = await fetch('http://localhost:3000/histovente/countMags');
          if (!response.ok) {
              throw new Error('Failed to fetch store count data');
          }
          const storeCountData = await response.json();
  
          // Create card container if it doesn't exist
          const kpiCardContainer = document.getElementById('kpi-card-container');
          if (!storeCountCard) {
              storeCountCard = document.createElement('div');
              storeCountCard.classList.add('kpi-card');
              kpiCardContainer.appendChild(storeCountCard);
          }
  
          // Format the store count value to an integer
          const storeCountValue = parseInt(storeCountData);
  
          // Update card content with store count value
          storeCountCard.innerHTML = `
              <h3>Store Count</h3>
              <p>${storeCountValue}</p>
          `;
  
          const data = new google.visualization.DataTable();
          data.addColumn('string', 'Store');
          data.addColumn('number', 'Count');
          data.addRow(['Stores', storeCountValue]);
  
          const options = {
              title: 'Store Count',
              legend: { position: 'none' },
              colors: ['#ff0066']
          };
  
          const chart = new google.visualization.BarChart(document.getElementById('storeCountChart'));
          chart.draw(data, options);
  
          document.getElementById('loading-store-count').style.display = 'none';
          document.getElementById('storeCountChart').style.display = 'block';
      } catch (error) {
          console.error('Error drawing store count chart:', error);
      }
  }
  





// Fetch total count of products
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



let totalProductCountCard = null;

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

async function drawTotalProductCountChart() {
    try {
        const totalCount = await fetchTotalProductCount();

        // Create card container if it doesn't exist
        const kpiCardContainer = document.getElementById('kpi-card-container');
        if (!totalProductCountCard) {
            totalProductCountCard = document.createElement('div');
            totalProductCountCard.classList.add('kpi-card');
            kpiCardContainer.appendChild(totalProductCountCard);
        }

        // Format the total product count value to an integer
        const formattedTotalCount = parseInt(totalCount);

        // Update card content with total product count value
        totalProductCountCard.innerHTML = `
            <h3>Total Products</h3>
            <p>${formattedTotalCount}</p>
        `;

        const data = new google.visualization.DataTable();
        data.addColumn('string', 'Category');
        data.addColumn('number', 'Count');
        data.addRow(['Total Products', formattedTotalCount]);

        const options = {
            title: 'Total Products',
            legend: { position: 'none' },
            colors: ['#FF5733'],
        };

        const chart = new google.visualization.BarChart(document.getElementById('total-products-chart-container'));
        chart.draw(data, options);

        document.getElementById('loading-total-products').style.display = 'none';
        document.getElementById('total-products-chart-container').style.display = 'block';
    } catch (error) {
        console.error('Error drawing total products chart:', error);
    }
}







// Call drawTotalProductCountChart function when the Google Charts library is loaded
google.charts.setOnLoadCallback(async function() {
    document.getElementById('loading-total-products').style.display = 'none';
    drawTotalProductCountChart();
});













// Event listener for the "Export PDF" button
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


