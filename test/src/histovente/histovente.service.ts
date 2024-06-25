import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Histovente } from './schemas/histovente.schema';

@Injectable()
export class HistoventeService {
  private cachedData: { [key: string]: any }; // Cache to store data
  private cacheExpiration: number; // Cache expiration time in seconds (5 minutes)
  private cacheTimestamp: number; // Timestamp to track when the cache was last updated

  constructor(
    @InjectModel(Histovente.name) private histoVenteModel: Model<Histovente>
  ) {
    this.cachedData = {};
    this.cacheExpiration = 1800; // Cache expiration time in seconds (30 minutes)
    this.cacheTimestamp = 0;
  }


  // Method to get total sales by year and month
  async getTotalSalesByYears(): Promise<{ month: number; year: number; totalSales: number }[]> {
    const cacheKey = 'getTotalSalesByYears';
  
    // Check if the data is in cache and if the cache is valid
    if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
      return this.cachedData[cacheKey];
    }
  
    // Aggregate query to calculate total sales by month and year, filtered by TypeVente = "VENTE"
    const salesByMonth = await this.histoVenteModel.aggregate([
      {
        $match: { TypeVente: "VENTE" } // Filter by TypeVente = "VENTE"
      },
      {
        $project: {
          year: { $year: "$Reception" },
          month: { $month: "$Reception" },
          totalSales: { $multiply: ["$Quantite", "$Total"] }
        }
      },
      {
        $group: {
          _id: { year: "$year", month: "$month" },
          totalSales: { $sum: "$totalSales" }
        }
      },
      {
        $project: {
          year: "$_id.year",
          month: "$_id.month",
          totalSales: 1,
          _id: 0
        }
      },
      {
        $sort: { year: 1, month: 1 } // Sort by year and month in ascending order
      }
    ]);
  
    // Format the result
    const result = salesByMonth.map(({ month, year, totalSales }) => ({ month, year, totalSales }));
  
    // Store the result in cache
    this.cachedData[cacheKey] = result;
    this.cacheTimestamp = Date.now();
  
    return result;
  }
  




  async calculateAverageSellingPriceByCodeMag(codeMag: string): Promise<number> {
    const cacheKey = `calculateAverageSellingPriceByCodeMag_${codeMag}`;
  
    // Check if the data is in cache and if the cache is valid
    if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
      return this.cachedData[cacheKey];
    }
  
    // Aggregate query to calculate the average selling price by store code and TypeVente = "VENTE"
    const pipeline = [
      { $match: { CodeMag: codeMag, TypeVente: "VENTE" } }, // Filter by store code and TypeVente
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$PrixVente' },
          totalQuantitySold: { $sum: '$Quantite' },
        },
      },
      {
        $project: {
          averageSellingPrice: { $divide: ['$totalSales', '$totalQuantitySold'] },
        },
      },
    ];
  
    const result = await this.histoVenteModel.aggregate(pipeline).exec();
    const averageSellingPrice = result.length > 0 && result[0].averageSellingPrice ? result[0].averageSellingPrice : 0;
  
    // Store the result in cache
    this.cachedData[cacheKey] = averageSellingPrice;
    this.cacheTimestamp = Date.now();
  
    return averageSellingPrice;
  }
  




  async calculateTotalQuantitySold(codeMag: string): Promise<{ year: number; month: number; totalQuantitySold: number }[]> {
    const cacheKey = `calculateTotalQuantitySold_${codeMag}`;
  
    // Check if the data is in cache and if the cache is valid
    if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
      return this.cachedData[cacheKey];
    }
  
    // Aggregate query to calculate the total quantity sold by year and month
    const pipeline = [
      {
        $match: {
          CodeMag: codeMag, // Filter by the store code
          TypeVente: "VENTE" // Filter by TypeVente = "VENTE"
        }
      },
      {
        $group: {
          _id: { year: { $year: '$Reception' }, month: { $month: '$Reception' } },
          totalQuantitySold: { $sum: '$Quantite' },
        },
      },
      {
        $project: {
          year: '$_id.year',
          month: '$_id.month',
          totalQuantitySold: 1,
          _id: 0
        },
      },
    ];
  
    const result = await this.histoVenteModel.aggregate(pipeline).exec();
    const formattedResult = result.map((item: { year: number; month: number; totalQuantitySold: number }) => ({
      year: item.year,
      month: item.month,
      totalQuantitySold: item.totalQuantitySold || 0
    }));
  
    // Store the result in cache
    this.cachedData[cacheKey] = formattedResult;
    this.cacheTimestamp = Date.now();
  
    return formattedResult;
  }
  


  // Method to count the unique products (families)
  async countUniqueProducts(): Promise<number> {
    const cacheKey = 'countUniqueProducts';

    // Check if the data is in cache and if the cache is valid
    if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
      return this.cachedData[cacheKey];
    }

    // Query to get the distinct families
    const uniqueFamilies = await this.histoVenteModel.distinct("Famille");
    const result = uniqueFamilies.length;

    // Store the result in cache
    this.cachedData[cacheKey] = result;
    this.cacheTimestamp = Date.now();

    return result;
  }


  // Method to count the unique stores
  async getStoreCount(value: string): Promise<number> {
    const cacheKey = 'getStoreCount';

    // Check if the data is in cache and if the cache is valid
    if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
      return this.cachedData[cacheKey];
    }

    // Query to get the distinct stores
    const uniqueFamilies = await this.histoVenteModel.distinct("CodeMag");
    const result = uniqueFamilies.length;

    // Store the result in cache
    this.cachedData[cacheKey] = result;
    this.cacheTimestamp = Date.now();

    return result;
  }


  // Method to get distinct seasons
  async getDistinctSeasons(): Promise<string[]> {
    const cacheKey = 'getDistinctSeasons';

    // Check if the data is in cache and if the cache is valid
    if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
      return this.cachedData[cacheKey];
    }

    // Query to get the distinct seasons
    const result = await this.histoVenteModel.distinct('Saison').exec();

    // Store the result in cache
    this.cachedData[cacheKey] = result;
    this.cacheTimestamp = Date.now();

    return result;
  }





  async getTotalSales(): Promise<number> {
    const cacheKey = 'getTotalSales';
  
    // Check if the data is in cache and if the cache is valid
    if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
      return this.cachedData[cacheKey];
    }
  
    // Query to get all sales documents with TypeVente equal to "VENTE"
    const histoventes = await this.histoVenteModel.find({ TypeVente: "VENTE" });
    let totalSales = 0;
    histoventes.forEach(histovente => {
      totalSales += histovente.PrixVente;
    });
  
    // Store the result in cache
    this.cachedData[cacheKey] = totalSales;
    this.cacheTimestamp = Date.now();
  
    return totalSales;
  }
  




  async calculateTotalSalesForSeason(season: string): Promise<number> {
    const cacheKey = `calculateTotalSalesForSeason_${season}`;
  
    // Check if the data is in cache and if the cache is valid
    if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
      return this.cachedData[cacheKey];
    }
  
    // Aggregate query to calculate total sales for the specified season
    const totalSales = await this.histoVenteModel.aggregate([
      {
        $match: {
          Saison: season, // Match documents with the selected season
          TypeVente: "VENTE" // Match documents with TypeVente = "VENTE"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$PrixVente" } // Calculate the sum of PrixVente for matched documents
        }
      }
    ]);
  
    const result = totalSales.length > 0 ? totalSales[0].total : 0;
  
    // Store the result in cache
    this.cachedData[cacheKey] = result;
    this.cacheTimestamp = Date.now();
  
    return result;
  }
  




  async getTopProducts(): Promise<{ name: string; sales: number; quantity: number }[]> {
    const cacheKey = 'getTopProducts';
  
    // Check if the data is in cache and if the cache is valid
    if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
      return this.cachedData[cacheKey];
    }
  
    // Aggregate query to get the top products by total sales
    const topProducts = await this.histoVenteModel.aggregate([
      {
        $match: {
          TypeVente: "VENTE" // Match documents with TypeVente = "VENTE"
        }
      },
      { 
        $group: { 
          _id: '$Famille', 
          totalSales: { $sum: { $multiply: ['$Total', '$Quantite'] } }, // Calculate total sales
          totalQuantity: { $sum: '$Quantite' } // Sum up the quantity
        } 
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 } // Change this limit according to your requirement
    ]).exec();
  
    const productDetails = topProducts.map(product => ({ name: product._id, sales: product.totalSales, quantity: product.totalQuantity }));
  
    // Store the result in cache
    this.cachedData[cacheKey] = productDetails;
    this.cacheTimestamp = Date.now();
  
    return productDetails;
  }
  



  
  // Method to check if the cache is still valid
  private isCacheValid(): boolean {
    const now = Date.now();
    return (now - this.cacheTimestamp) < (this.cacheExpiration * 1000);
  }






async getFirstDistinctCodeMagValues(): Promise<string[]> {
  try {
    const distinctValues = await this.histoVenteModel.aggregate([
      { $group: { _id: '$CodeMag' } },
      { $project: { _id: 0, CodeMag: '$_id' } },
    ]);

    return distinctValues.map((entry: { CodeMag: string }) => entry.CodeMag);
  } catch (error) {
    throw error;
  }
}



async getOrdersCountByCodeMag(CodeMag: string): Promise<number> {
  const distinctTickets = await this.histoVenteModel.distinct('IDTicket', { CodeMag }).exec();
  return distinctTickets.length;
}


async countMag(): Promise<number> {
  try {
    const result = await this.histoVenteModel.distinct('CodeMag').exec();
    const count = result.length; // Count the distinct CodeMag values
    return count;
  } catch (error) {
    throw error;
  }
}






async countDistinctProductsByStore(codeMag: string): Promise<number> {
  const distinctFamilies = await this.histoVenteModel.distinct('Famille', { CodeMag: codeMag });
  return distinctFamilies.length;
}



async getTotalSalesByCodeMag(codeMag: string): Promise<number> {
  const totalSales = await this.histoVenteModel.aggregate([
    {
      $match: {
        CodeMag: codeMag, // Match documents by store code
        TypeVente: "VENTE" // Match documents where TypeVente is "VENTE"
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: { $multiply: ["$PrixVente", "$Quantite"] } }
      }
    }
  ]).exec();
  
  return totalSales.length > 0 ? totalSales[0].total : 0;
}





async getTotalSalesByFamilyForStore(codeMag: string): Promise<{ family: string; totalSales: number }[]> {
  try {
    const salesByFamily = await this.histoVenteModel.aggregate([
      {
        $match: {
          CodeMag: codeMag, // Match documents for the specified store
          TypeVente: "VENTE" // Match documents where TypeVente is "VENTE"
        }
      },
      {
        $group: {
          _id: { CodeMag: '$CodeMag', Famille: '$Famille' },
          totalSales: { $sum: '$Total' } // Sum total sales
        }
      },
      {
        $project: {
          _id: 0,
          family: '$_id.Famille',
          totalSales: { $round: ["$totalSales", 2] } // Round total sales to two decimal places
        }
      }
    ]);

    return salesByFamily;
  } catch (error) {
    throw error;
  }
}



async getTopProductsByCodeMag(codeMag: string): Promise<{ name: string; sales: number; quantity: number }[]> {
  try {
    const topProducts = await this.histoVenteModel.aggregate([
      { 
        $match: { CodeMag: codeMag } // Match documents for the specific codeMag
      },
      { 
        $group: { 
          _id: '$Famille', 
          totalSales: { $sum: { $multiply: ['$Total', '$Quantite'] } }, // Calculate total sales
          totalQuantity: { $sum: '$Quantite' } // Sum up the quantity
        } 
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 } // Change this limit according to your requirement
    ]).exec();

    // Map the aggregated data to the desired format
    const productDetails = topProducts.map(product => ({
      name: product._id,
      sales: product.totalSales,
      quantity: product.totalQuantity
    }));

    return productDetails;
  } catch (error) {
    // Handle any errors that occur during the aggregation
    throw error;
  }
}






async getTotalSalesWithDiscount(codeMag: string): Promise<number> {
  const totalSalesWithDiscount = await this.histoVenteModel.aggregate([
    { $match: { CodeMag: codeMag, Remise: { $gt: 0 } } }, // Match documents with discounts for the specific store
    { $group: { _id: null, total: { $sum: '$Total' } } } // Group and sum total sales
  ]).exec();

  return totalSalesWithDiscount.length > 0 ? totalSalesWithDiscount[0].total : 0;
}

async getTotalSalesWithoutDiscount(codeMag: string): Promise<number> {
  const totalSalesWithoutDiscount = await this.histoVenteModel.aggregate([
    { $match: { CodeMag: codeMag, Remise: 0 } }, // Match documents without discounts for the specific store
    { $group: { _id: null, total: { $sum: '$Total' } } } // Group and sum total sales
  ]).exec();

  return totalSalesWithoutDiscount.length > 0 ? totalSalesWithoutDiscount[0].total : 0;
}

async getTotalQuantityWithPromotion(codeMag: string): Promise<number> {
  const totalQuantityWithPromotion = await this.histoVenteModel.aggregate([
    { $match: { CodeMag: codeMag, Remise: { $gt: 0 } } }, // Match documents with promotion for the specific store
    { $group: { _id: null, total: { $sum: '$Quantite' } } } // Group and sum total quantity
  ]).exec();

  return totalQuantityWithPromotion.length > 0 ? totalQuantityWithPromotion[0].total : 0;
}

async getTotalQuantityWithoutPromotion(codeMag: string): Promise<number> {
  const totalQuantityWithoutPromotion = await this.histoVenteModel.aggregate([
    { $match: { CodeMag: codeMag, Remise: 0 } }, // Match documents without promotion for the specific store
    { $group: { _id: null, total: { $sum: '$Quantite' } } } // Group and sum total quantity
  ]).exec();

  return totalQuantityWithoutPromotion.length > 0 ? totalQuantityWithoutPromotion[0].total : 0;
}





async getTotalTransactionsByCodeMag(codeMag: string): Promise<{ [year: number]: { [month: number]: number } }> {
  try {
    const pipeline = [
      { $match: { CodeMag : codeMag } }, // Match documents with the specified CodeMag
      { $group: { _id: { year: { $year: '$Reception' }, month: { $month: '$Reception' } }, totalTransactions: { $sum: 1 } } } // Group by year and month, and count the transactions
    ];

    const result = await this.histoVenteModel.aggregate(pipeline).exec();

    if (result.length === 0) {
      return {}; // If no transactions found, return an empty object
    }

    const totalTransactionsByMonth: { [year: number]: { [month: number]: number } } = {};
    result.forEach(({ _id, totalTransactions }) => {
      const { year, month } = _id;
      if (!totalTransactionsByMonth[year]) {
        totalTransactionsByMonth[year] = {};
      }
      totalTransactionsByMonth[year][month] = totalTransactions;
    });

    return totalTransactionsByMonth;
  } catch (error) {
    throw error;
  }
}






/*products charts 

--------


----------


--------------------------------------------------------------------*/





async getAllProductNames(): Promise<string[]> {
  try {
    const cacheKey = 'getAllProductNames';

    // Check if the result is cached and valid
    if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
      return this.cachedData[cacheKey];
    }

    const productNames = await this.histoVenteModel.distinct("Famille").exec();

    // Cache the result
    this.cachedData[cacheKey] = productNames;
    this.cacheTimestamp = Date.now();

    return productNames;
  } catch (error) {
    console.error('Error fetching product names:', error);
    throw error;
  }
}

async getAllProductNamesWithMostSalesByDay(famille: string): Promise<{ productName: string; dayOfWeek: string }[]> {
  try {
    const cacheKey = `getAllProductNamesWithMostSalesByDay_${famille}`;

    // Check if the result is cached and valid
    if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
      return this.cachedData[cacheKey];
    }

    const result = await this.histoVenteModel.aggregate([
      {
        $match: { Famille: famille }
      },
      {
        $group: {
          _id: { Famille: "$Famille", Reception: "$Reception" },
          totalSales: { $sum: { $multiply: ["$Total", "$Quantite"] } }
        }
      },
      {
        $sort: { "_id.Reception": 1 } // Sort by Reception date in ascending order
      },
      {
        $project: {
          productName: "$_id.Famille",
          dayOfWeek: { $dayOfWeek: "$_id.Reception" }, // Extract day of the week from the Reception date
          totalSales: { $round: ["$totalSales", 2] } // Round totalSales to 2 decimal places
        }
      }
    ]);

    const salesByDayOfWeek = result.map(({ productName, dayOfWeek, totalSales }) => ({
      productName,
      dayOfWeek: this.getDayOfWeek(dayOfWeek), // Convert day of week number to name
      totalSales: totalSales.toFixed(2) // Format totalSales with 2 decimal places
    }));

    // Cache the result
    this.cachedData[cacheKey] = salesByDayOfWeek;
    this.cacheTimestamp = Date.now();

    return salesByDayOfWeek;
  } catch (error) {
    console.error('Error fetching product names with most sales by day:', error);
    throw error;
  }
}





private getDayOfWeek(dayOfWeek: number): string {
  // Convert day of week number to name
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return daysOfWeek[dayOfWeek - 1]; // Adjusting dayOfWeek because date-fns uses 1-indexed days
}





async getProductStores(productName: string): Promise<{ storeName: string; productCount: number }[]> {
  try {
    const cacheKey = `getProductStores_${productName}`;

    // Check if the result is cached and valid
    if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
      return this.cachedData[cacheKey];
    }

    const result = await this.histoVenteModel.aggregate([
      {
        $match: { Famille: productName }
      },
      {
        $group: {
          _id: "$CodeMag", // Group by store name
          productCount: { $sum: "$Quantite" } // Count the number of products
        }
      }
    ]);

    const stores = result.map(({ _id, productCount }) => ({
      storeName: _id,
      productCount
    }));

    // Cache the result
    this.cachedData[cacheKey] = stores;
    this.cacheTimestamp = Date.now();

    return stores;
  } catch (error) {
    console.error('Error fetching product stores:', error);
    throw error;
  }
}






async calculateAverageSellingPriceByFamille(famille: string): Promise<{ year: number; month: number; averageSellingPrice: number }[]> {
  const cacheKey = `calculateAverageSellingPriceByFamille_${famille}`;

  // Check if the result is cached and valid
  if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
    return this.cachedData[cacheKey];
  }

  const pipeline = [
    { $match: { Famille: famille } }, // Filter by Famille
    {
      $group: {
        _id: {
          year: { $year: '$Reception' }, // Group by year of Reception date
          month: { $month: '$Reception' }, // Group by month of Reception date
        },
        totalSales: { $sum: '$PrixVente' },
        totalQuantitySold: { $sum: '$Quantite' },
      },
    },
    {
      $project: {
        year: '$_id.year', // Include year in the result
        month: '$_id.month',
        averageSellingPrice: { $divide: ['$totalSales', '$totalQuantitySold'] },
        _id: 0, // Exclude _id field
      },
    },
  ];

  const result = await this.histoVenteModel.aggregate(pipeline).exec();

  // Convert result to an array of objects with year, month, and averageSellingPrice properties
  const averageSellingPriceByYearAndMonth = result.map(item => ({
    year: item.year,
    month: item.month,
    averageSellingPrice: item.averageSellingPrice,
  }));

  // Cache the result
  this.cachedData[cacheKey] = averageSellingPriceByYearAndMonth;
  this.cacheTimestamp = Date.now();

  return averageSellingPriceByYearAndMonth;
}

async calculateTotalQuantitySoldByFamille(famille: string): Promise<{ year: number; month: number; totalQuantitySold: number }[]> {
  const cacheKey = `calculateTotalQuantitySoldByFamille_${famille}`;

  // Check if the result is cached and valid
  if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
    return this.cachedData[cacheKey];
  }

  const pipeline = [
    {
      $match: {
        Famille: famille // Filter by the famille
      }
    },
    {
      $group: {
        _id: { year: { $year: '$Reception' }, month: { $month: '$Reception' } },
        totalQuantitySold: { $sum: '$Quantite' },
      },
    },
    {
      $project: {
        year: '$_id.year',
        month: '$_id.month',
        totalQuantitySold: 1,
        _id: 0
      },
    },
  ];

  const result = await this.histoVenteModel.aggregate(pipeline).exec();

  // Cache the result
  this.cachedData[cacheKey] = result;
  this.cacheTimestamp = Date.now();

  return result.map((item: { year: number; month: number; totalQuantitySold: number }) => ({
    year: item.year,
    month: item.month,
    totalQuantitySold: item.totalQuantitySold || 0
  }));
}

async getNumberOfReturnsForProduct(famille: string) {
  const cacheKey = `getNumberOfReturnsForProduct_${famille}`;

  // Check if the result is cached and valid
  if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
    return this.cachedData[cacheKey];
  }

  try {
    const pipeline = [
      {
        $match: { Famille: famille, TypeVente: "AVOIR" } // Match documents with the specified Famille and TypeVente equal to "AVOIR"
      },
      {
        $count: "numberOfReturns" // Count the number of matching documents
      }
    ];

    const result = await this.histoVenteModel.aggregate(pipeline).exec();

    let numberOfReturns = 0;
    if (result.length > 0 && result[0].hasOwnProperty('numberOfReturns')) {
      numberOfReturns = result[0].numberOfReturns; // Return the count of returns
    }

    // Cache the result
    this.cachedData[cacheKey] = numberOfReturns;
    this.cacheTimestamp = Date.now();

    return numberOfReturns;
  } catch (error) {
    console.error('Error fetching number of returns for product:', error);
    throw error;
  }
}


async getLibtaillesNamesAndCountForFamille(famille: string): Promise<{ libtaillesName: string; count: number }[]> {
  const cacheKey = `getLibtaillesNamesAndCountForFamille_${famille}`;

  // Check if the result is cached and valid
  if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
    return this.cachedData[cacheKey];
  }

  try {
    const result = await this.histoVenteModel.aggregate([
      {
        $match: { Famille: famille } // Match documents with the specified Famille
      },
      {
        $group: {
          _id: "$LibTaille", // Group by libtailles
          count: { $sum: "$Quantite" } // Sum the quantity to get the count
        }
      },
      {
        $project: {
          libtaillesName: "$_id",
          count: 1,
          _id: 0
        }
      }
    ]);

    const libtaillesCount = result.map(({ libtaillesName, count }) => ({
      libtaillesName,
      count
    }));

    // Cache the result
    this.cachedData[cacheKey] = libtaillesCount;
    this.cacheTimestamp = Date.now();

    return libtaillesCount;
  } catch (error) {
    console.error('Error fetching libtailles names and count for famille:', error);
    throw error;
  }
}








/*  ORDERS   ---------------






-----------------------------------------------------    */




async countDistinctOrders(): Promise<number> {
  const distinctOrders = await this.histoVenteModel.aggregate([
    {
      $group: {
        _id: '$IDTicket',
      },
    },
    {
      $count: 'distinctOrdersCount',
    },
  ]);

  if (distinctOrders.length === 0) {
    return 0;
  }

  return distinctOrders[0].distinctOrdersCount;
}






async calculateAverageQuantitySoldPerOrder(): Promise<number> {
  const pipeline = [
    {
      $group: {
        _id: '$IDTicket',
        totalQuantity: { $sum: '$Quantite' },
      },
    },
    {
      $group: {
        _id: null,
        averageQuantity: { $avg: '$totalQuantity' },
      },
    },
  ];

  const result = await this.histoVenteModel.aggregate(pipeline).exec();
  if (result.length === 0 || !result[0].averageQuantity) {
    return 0;
  }

  return result[0].averageQuantity;
}




async getTopSellingProductsPerOrder(): Promise<{ famille: string; barcode: string; quantity: number }[]> {
  const topProducts = await this.histoVenteModel.aggregate([
    {
      $group: {
        _id: '$IDTicket',
        products: { $push: { barcode: '$Barcode', famille: '$Famille', quantity: '$Quantite' } },
      },
    },
    { $unwind: '$products' },
    {
      $group: {
        _id: '$products.barcode',
        famille: { $first: '$products.famille' }, // Fix typo: 'famille' instead of 'family'
        totalQuantity: { $sum: '$products.quantity' },
      },
    },
    { $sort: { totalQuantity: -1 } },
    { $limit: 10 }, // Change this limit according to your requirement
  ]).exec();

  return topProducts.map(({ _id, famille, totalQuantity }) => ({ barcode: _id, famille, quantity: totalQuantity }));
}







/*  sales  ----------------



--------------------------      */





async getTotalSalesByMonth(): Promise<{ month: number; year: number; totalSales: number }[]> {
  const cacheKey = 'getTotalSalesByMonth';

  if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
    return this.cachedData[cacheKey];
  }

  const currentYear = new Date().getFullYear();
  const salesByMonth = await this.histoVenteModel.aggregate([
    {
        $match: {
            TypeVente: "VENTE" // Match documents where TypeVente is "VENTE"
        }
    },
    {
        $project: {
            year: { $year: "$Reception" },
            month: { $month: "$Reception" },
            totalSales: { $multiply: ["$Quantite", "$Total"] }
        }
    },
    {
        $match: {
            year: { $gte: currentYear - 2, $lte: currentYear + 1 } // Include data from current year - 2 to current year + 1
        }
    },
    {
        $group: {
            _id: { year: "$year", month: "$month" },
            totalSales: { $sum: "$totalSales" }
        }
    },
    {
        $project: {
            year: "$_id.year",
            month: "$_id.month",
            totalSales: 1,
            _id: 0
        }
    },
    {
        $sort: { year: 1, month: 1 } // Sort by year and month in ascending order
    }
  ]);

  const result = salesByMonth.map(({ month, year, totalSales }) => ({ month, year, totalSales }));

  this.cachedData[cacheKey] = result;
  this.cacheTimestamp = Date.now();

  return result;
}



async getTotalSalesByCountry(): Promise<{ country: string; totalSales: number }[]> {
  const cacheKey = 'getTotalSalesByCountry';

  if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
    return this.cachedData[cacheKey];
  }

  const salesByCountry = await this.histoVenteModel.aggregate([
    {
      $match: {
        TypeVente: "VENTE" // Match documents where TypeVente is "VENTE"
      }
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $in: [{ $substrCP: ["$CodeMag", 0, 1] }, ["F", "A"]] }, then: "France" },
              { case: { $eq: [{ $substrCP: ["$CodeMag", 0, 1] }, "B"] }, then: "Belgium" },
              { case: { $in: [{ $substrCP: ["$CodeMag", 0, 1] }, ["E"]] }, then: "Spain" }, // Include "E" for Spain
              { case: { $in: ["$CodeMag", ["A261", "A321", "A341", "A215", "A207", "A339"]] }, then: "Spain" } // Include specific codes for Spain
            ],
            default: "Other"
          }
        },
        totalSales: { $sum: { $multiply: ["$Quantite", "$Total"] } }
      }
    },
    {
      $project: {
        country: "$_id",
        totalSales: { $round: ["$totalSales", 2] } // Round totalSales to 2 decimal places
      }
    }
  ]);

  this.cachedData[cacheKey] = salesByCountry;
  this.cacheTimestamp = Date.now();

  return salesByCountry;
}




async getAverageSalesValue(): Promise<{ month: number; year: number; averageSales: number }[]> {
  const cacheKey = 'getAverageSalesValue';

  if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
    return this.cachedData[cacheKey];
  }

  const currentYear = new Date().getFullYear();
  const averageSalesByMonth = await this.histoVenteModel.aggregate([
    {
      $project: {
        year: { $year: "$Reception" },
        month: { $month: "$Reception" },
        totalSales: { $multiply: ["$Quantite", "$Total"] }
      }
    },
    {
      $match: {
        year: { $gte: currentYear - 2, $lte: currentYear + 1 } // Include data from current year - 2 to current year + 1
      }
    },
    {
      $group: {
        _id: { year: "$year", month: "$month" },
        totalSales: { $sum: "$totalSales" },
        count: { $sum: 1 } // Count the number of documents
      }
    },
    {
      $project: {
        year: "$_id.year",
        month: "$_id.month",
        averageSales: { $divide: ["$totalSales", "$count"] } // Calculate the average sales value
      }
    }
  ]);

  const result = averageSalesByMonth.map(({ month, year, averageSales }) => ({ month, year, averageSales }));

  this.cachedData[cacheKey] = result;
  this.cacheTimestamp = Date.now();

  return result;
}



async calculateAverageSalesDaily(): Promise<number> {
  const cacheKey = 'calculateAverageSalesDaily';

  if (this.isCacheValid() && this.cachedData && this.cachedData[cacheKey]) {
    return this.cachedData[cacheKey];
  }

  try {
    const result = await this.histoVenteModel.aggregate([
      {
        $group: {
          _id: null,
          minDate: { $min: "$Reception" },
          maxDate: { $max: "$Reception" }
        }
      }
    ]);

    if (result.length > 0) {
      const startDate = result[0].minDate;
      const endDate = result[0].maxDate;

      const salesResult = await this.histoVenteModel.aggregate([
        {
          $match: {
            TypeVente: "VENTE", // Match documents where TypeVente is "VENTE"
            Reception: {
              $gte: startDate,
              $lte: endDate
            }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$Reception" } },
            totalSales: { $sum: "$Total" }
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: "$totalSales" },
            totalDays: { $sum: 1 }
          }
        },
        {
          $project: {
            averageSalesDaily: { $divide: ["$totalSales", "$totalDays"] }
          }
        }
      ]);

      if (salesResult.length > 0) {
        const averageSalesDaily = salesResult[0].averageSalesDaily;
        this.cachedData[cacheKey] = averageSalesDaily;
        this.cacheTimestamp = Date.now();
        return averageSalesDaily;
      }
    }
  } catch (error) {
    console.error('Error calculating average daily sales:', error);
  }

  return 0;
}







}



  

