async function fetchAndDrawSalesData() {
    try {
        const response = await fetch('http://localhost:3000/histovente/total-by-month');
        if (response.ok) {
            const salesData = await response.json();

            // Sort the salesData array by year and month
            salesData.sort((a, b) => a.year - b.year || a.month - b.month);

            // Generate a complete list of months for each year
            const years = [...new Set(salesData.map(entry => entry.year))];
            const completeData = years.flatMap(year => {
                const yearData = salesData.filter(entry => entry.year === year);
                const months = Array.from({ length: 12 }, (_, i) => i + 1);
                return months.map(month => {
                    const monthData = yearData.find(entry => entry.month === month);
                    return {
                        month: month,
                        year: year,
                        totalSales: monthData ? monthData.totalSales : 0
                    };
                });
            });

            // Fixed array of month names from January to December
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            // Process the data
            const months = monthNames; // Use fixed array of month names

            // Generate a palette of colors for each year
            const colors = [
                'rgba(255, 99, 132)',
                'rgba(54, 162, 235)',
                'rgba(255, 205, 86)',
                'rgba(75, 192, 192)',
                'rgba(153, 102, 255)',
                'rgba(255, 159, 64'
                // Add more colors as needed
            ];

            const datasets = years.map((year, index) => {
                const dataForYear = completeData.filter(entry => entry.year === year);
                return {
                    label: `${year}`,
                    data: dataForYear.map(entry => entry.totalSales),
                    fill: false,
                    borderColor: colors[index % colors.length],
                    tension: 0.1
                };
            });

            const salesChartContainer = document.getElementById('salescontainer');
            const salesChartCanvas = document.getElementById('salesChart');

            salesChartCanvas.width = salesChartContainer.offsetWidth;

            new Chart(salesChartCanvas, {
                type: 'line',
                data: {
                    labels: months,
                    datasets: datasets
                },
                options: {
                    layout: {
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Monthly Sales Over Different Years', // Title text
                            color: 'black', // Set the color to black
                            padding: {
                                top: 10,
                                bottom: 20
                            },
                            font: {
                                size: 18,
                                weight: 'bold'
                            }
                        }
                    }
                }     
                
            });

        } else {
            throw new Error('Failed to fetch sales data');
        }
    } catch (error) {
        console.error('Error fetching sales data:', error);
        // Handle the error
    }
}

fetchAndDrawSalesData();







async function fetchAndDrawSalesbycountryData() {
    try {
      const response = await fetch('http://localhost:3000/histovente/totalSalesByCountry');
      if (response.ok) {
        const salesData = await response.json();
  
        // Process the data
        const countries = salesData.map(entry => entry.country);
        const totalSales = salesData.map(entry => parseFloat(entry.totalSales));
  
        // Create the chart options
        const options = {
          series: [
            {
              name: 'Total Sales',
              data: totalSales
            }
          ],
          chart: {
            type: 'bar',
            height: 450,
            toolbar: {
              show: true
            }
          },
          plotOptions: {
            bar: {
              horizontal: true,
              barHeight: '20px'
            }
          },
          legend: {
            show: true,
            position: 'right'
          },
          xaxis: {
            categories: countries
          },
          title: {
            text: 'Total Sales by Country',
            align: 'center',
            style: {
              fontSize: '20px',
              fontWeight: 'bold'
            }
          },
          tooltip: {
            enabled: true,
            formatter: function(val) {
              return val + " units";
            }
          },
          dataLabels: {
            enabled: true,
            offsetX: 0,
            style: {
              colors: ['black'] // Change the text color to black
            }
          }
        };
  
        // Render the chart
        const chart = new ApexCharts(document.querySelector("#salesbyregionchart"), options);
        chart.render();
      } else {
        throw new Error('Failed to fetch sales data');
      }
    } catch (error) {
      console.error('Error fetching sales data:', error);
      // Handle the error
    }
  }
  
  // Fetch and draw sales data when the page loads
  fetchAndDrawSalesbycountryData();





  async function fetchAndDrawAverageSalesValue() {
    try {
        const response = await fetch('http://localhost:3000/histovente/getAverageSalesValue');
        if (response.ok) {
            const averageSalesValue = await response.json();

            // Create a data structure to hold the average sales values for each month
            const monthlyAverageSales = {};

            // Process the average sales values and create a chart data array
            averageSalesValue.forEach((item) => {
                const month = `${item.year}/${item.month}`; // Switched year and month for correct sorting
                if (!monthlyAverageSales[month]) {
                    monthlyAverageSales[month] = item.averageSales;
                } else {
                    monthlyAverageSales[month] += item.averageSales;
                }
            });

            // Calculate the average sales value for each month
            let chartData = Object.keys(monthlyAverageSales).map((month) => {
                return {
                    x: month,
                    y: parseFloat(monthlyAverageSales[month].toFixed(2)) // Take 2 decimal places
                };
            });

            // Sort chart data by year and month
            chartData.sort((a, b) => {
                const yearA = parseInt(a.x.split('/')[0]);
                const monthA = parseInt(a.x.split('/')[1]);
                const yearB = parseInt(b.x.split('/')[0]);
                const monthB = parseInt(b.x.split('/')[1]);
                if (yearA !== yearB) {
                    return yearA - yearB;
                } else {
                    return monthA - monthB;
                }
            });

            // Generate a palette of colors for each year
            const colors = [
                'rgba(255, 99, 132)',
                'rgba(54, 162, 235)',
                'rgba(255, 205, 86)',
                'rgba(75, 192, 192)',
                'rgba(153, 102, 255)',
                'rgba(255, 159, 64'
                // Add more colors as needed
            ];

            const options = {
                series: [{
                    name: 'Average Sales Value',
                    data: chartData
                }],
                chart: {
                    height: 300,
                    type: 'bar',
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                    }
                },
                xaxis: {
                    categories: chartData.map((item) => item.x),
                },
                title: {
                    text: 'Average Sales Value Over Different Months',
                    align: 'center',
                    style: {
                        fontSize: '20px',
                        fontWeight: 'bold'
                    }
                },
                dataLabels: {
                    enabled: true,
                    offsetY: 20,
                    style: {
                        colors: ['#333'],
                        fontSize: '11px'
                    }
                },
                colors: colors // Apply the color palette
            };

            // Render the chart
            const chart = new ApexCharts(document.querySelector("#averageSalesValueChart"), options);
            chart.render();
        } else {
            throw new Error('Failed to fetch average sales value data');
        }
    } catch (error) {
        console.error('Error fetching average sales value data:', error);
        // Handle the error
    }
}

fetchAndDrawAverageSalesValue();









async function fetchAndDrawTopProductsChart() {
  try {
    const response = await fetch('http://localhost:3000/histovente/top10Products');
    if (response.ok) {
      const productsData = await response.json();

      
      // Extract the top product names and sales values from the fetched data
      const topProductNames = productsData.map(product => product.name);
      const topProductSales = productsData.map(product => product.sales);
      
      // Find the minimum sales value
      const minSales = Math.min(...topProductSales);
      
      // Create the chart options
      const options = {
        series: [
          {
            data: topProductSales.map((sales, index) => ({
              x: topProductNames[index],
              y: sales
            }))
          }
        ],
        legend: {
          show: false
        },
        chart: {
          height: 500,
          type: 'treemap'
        },
        title: {
          text: 'Top 10 Selling Products',
          align: 'center'
        },
        colors: [
          '#FF69B4', // A bright pinkish-purple color
          '#8BC34A', // A bright greenish-yellow color
          '#03A9F4', // A bright blue color
          '#FFC107', // A bright orange-yellow color
          '#66D9EF', // A calming blue-green color
          '#FFD700', // A bright yellow color
          '#9C27B0', // A deep purple color
          '#4CAF50', // A bright green color
          '#E91E63', // A bright red color
          '#9E9E9E', // A neutral gray color
          '#FF5722', // A bright orange-red color
          '#4CAF50' // A bright green color
        ],
        plotOptions: {
          treemap: {
            distributed: true,
            enableShades: false
          }
        },
        yaxis: {
          min: minSales, // Set the minimum value of the y-axis to the minimum sales value
          labels: {
            formatter: function (value) {
              return value + ' €'; // Add Euro symbol after each sales value
            }
          }
        },
        dataLabels: {
          style: {
            fontSize: '14px' // Set font size for data labels
          }
        }
      };
      
      // Render the chart
      const chart = new ApexCharts(document.querySelector("#radialBarChart"), options);
      chart.render();
    } else {
      throw new Error('Failed to fetch treemap chart data');
    }
  } catch (error) {
    console.error('Error fetching treemap chart data:', error);
    // Handle the error
  }
}

fetchAndDrawTopProductsChart();









async function fetchAndDrawAverageDailySalesChart() {
  try {
      const response = await fetch('http://localhost:3000/histovente/average-daily');
      if (response.ok) {
          const averageDailySales = await response.json();
          
          // Create a canvas element dynamically if it doesn't exist
          let canvas = document.getElementById('averageDailySalesChart');
          if (!canvas) {
              canvas = document.createElement('canvas');
              canvas.id = 'averageDailySalesChart';
              document.body.appendChild(canvas);
          }

          // Create data for the chart
          const data = {
              labels: ['Average Daily Sales'],
              datasets: [{
                  label: 'Average Daily Sales',
                  backgroundColor: 'rgba(54, 162, 235, 0.2)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
                  hoverBackgroundColor: 'rgba(54, 162, 235, 0.4)',
                  hoverBorderColor: 'rgba(54, 162, 235, 1)',
                  data: [averageDailySales]
              }]
          };

          // Get canvas context
          const ctx = canvas.getContext('2d');

          // Draw chart
          new Chart(ctx, {
              type: 'bar',
              data: data,
              options: {
                  scales: {
                      y: {
                          beginAtZero: true
                      }
                  },
                  plugins: {
                      title: {
                          display: true,
                          text: 'Average Daily Sales', // Title text
                          color: 'black', // Set the color to black
                          padding: {
                              top: 10,
                              bottom: 20
                          },
                          font: {
                              size: 18,
                              weight: 'bold'
                          }
                      }
                  }
              }
          });
      } else {
          throw new Error('Failed to fetch average daily sales data');
      }
  } catch (error) {
      console.error('Error fetching average daily sales data:', error);
      // Handle the error
  }
}

fetchAndDrawAverageDailySalesChart();







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
