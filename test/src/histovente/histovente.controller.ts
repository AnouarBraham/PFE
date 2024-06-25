import { Controller, Get, Query, ParseIntPipe, ParseFloatPipe, Param } from '@nestjs/common';
import { HistoventeService } from './histovente.service';
import { spawn } from 'child_process';

@Controller('histovente')
export class HistoventeController {
  constructor(private readonly histoventeService: HistoventeService) {}

  


  @Get('execute-prediction/:email')
  async executeSalesPrediction(@Param('email') email: string) {
    try {
      const pythonExecutable = 'C:\\Users\\lenovo\\AppData\\Local\\Programs\\Thonny\\python.exe';
      const scriptPath = 'C:\\Users\\lenovo\\Desktop\\PROJET PFE\\Bot\\BOT_prediction.py';
      const process = spawn(pythonExecutable, [scriptPath, email]);

      process.stdout.on('data', (data) => {
        console.log(`Python script output: ${data}`);
      });

      process.stderr.on('data', (data) => {
        console.error(`Error in Python script: ${data}`);
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log('Python script executed successfully');
        } else {
          console.error(`Python script execution failed with code ${code}`);
        }
      });

      return { message: 'Prediction bot activated' };
    } catch (error) {
      console.error('Error executing Python script:', error);
      return { error: 'An error occurred while executing the Python script' };
    }
  }

  @Get('execute-anomaly-detection/:email')
  async executeAnomalyDetection(@Param('email') email: string) {
    try {
      const pythonExecutable = 'C:\\Users\\lenovo\\AppData\\Local\\Programs\\Thonny\\python.exe';
      const scriptPath = 'C:\\Users\\lenovo\\Desktop\\PROJET PFE\\Bot\\anomaly_detection.py';
      const process = spawn(pythonExecutable, [scriptPath, email]);

      process.stdout.on('data', (data) => {
        console.log(`Python script output: ${data}`);
      });

      process.stderr.on('data', (data) => {
        console.error(`Error in Python script: ${data}`);
      });

      process.on('close', (code) => {
        if (code === 0) {
          console.log('Python script executed successfully');
        } else {
          console.error(`Python script execution failed with code ${code}`);
        }
      });

      return { message: 'Anomaly detection bot activated' };
    } catch (error) {
      console.error('Error executing Python script:', error);
      return { error: 'An error occurred while executing the Python script' };
    }
  }



  




  @Get('averageSellingPriceByCodeMag/:codeMag')
  async getAverageSellingPriceByCodeMag(@Param('codeMag') codeMag: string): Promise<number> {
    const averageSellingPrice = await this.histoventeService.calculateAverageSellingPriceByCodeMag(codeMag);
    return averageSellingPrice;
  }




  @Get('totalQuantitySoldByCodeMag/:codeMag')
async getTotalQuantitySoldByCodeMag(@Param('codeMag') codeMag: string): Promise<{ year: number, totalQuantitySold: number }[]> {
    return this.histoventeService.calculateTotalQuantitySold(codeMag);
}
  




  @Get('count')
  async countProducts(): Promise<number> {
    return this.histoventeService.countUniqueProducts();
  }

  @Get('countMag')
  async getStoreCount(): Promise<number> {
    return this.histoventeService.getStoreCount('CodeMag');
  }
  



  @Get('countMags')
  async countMag(): Promise<number> {
    try {
      const count = await this.histoventeService.countMag();
      return count;
    } catch (error) {
      throw error;
    }
  }

  @Get('seasons')
  async getDistinctSeasons(): Promise<string[]> {
    return this.histoventeService.getDistinctSeasons();
  }





  @Get('totalSales')
  async getTotalSalesForSeason(@Query('season') season: string): Promise<number> {
    // Query the database to calculate the total sales for the selected season
    const totalSales = await this.histoventeService.calculateTotalSalesForSeason(season);
    return totalSales;
}


@Get('topProducts')
  async getTopProducts(): Promise<{ name: string; sales: number; quantity: number }[]> {
    return await this.histoventeService.getTopProducts();
  }



  
  

  @Get('firstDistinctCodeMagValues')
  async getFirstDistinctCodeMagValues(): Promise<string[]> {
    return this.histoventeService.getFirstDistinctCodeMagValues();
  }



  @Get('/count/:codeMag')
  async countDistinctProductsByStore(@Param('codeMag') codeMag: string): Promise<{ count: number }> {
    const count = await this.histoventeService.countDistinctProductsByStore(codeMag);
    return { count };
  }


  /* codemags */
  @Get('totalSalesByCodeMag/:codeMag')
  async getTotalSalesByCodeMag(@Param('codeMag') codeMag: string): Promise<number> {
    return this.histoventeService.getTotalSalesByCodeMag(codeMag);
  }

  
  @Get('ordersCountByCodeMag/:codeMag')
  async getOrdersCountByCodeMag(@Param('codeMag') codeMag: string): Promise<number> {
    return this.histoventeService.getOrdersCountByCodeMag(codeMag);
  }



  @Get('topProductsByCodeMag/:codeMag')
  async getTopProductsByCodeMag(@Param('codeMag') codeMag: string): Promise<{ name: string; sales: number; quantity: number }[]> {
    return await this.histoventeService.getTopProductsByCodeMag(codeMag);
  }

  @Get('totalSalesByFamilyForStore/:codeMag')
async getTotalSalesByFamilyForStore(@Param('codeMag') codeMag: string): Promise<{ family: string; totalSales: number }[]> {
  return this.histoventeService.getTotalSalesByFamilyForStore(codeMag);
}


 



@Get('total-sales-by-month')
async getTotalSalesByYears(): Promise<{ month: number; year: number; totalSales: number }[]> {
  return this.histoventeService.getTotalSalesByYears();
}








@Get('totalSalesWithDiscount/:codeMag')
  async getTotalSalesWithDiscount(@Param('codeMag') codeMag: string): Promise<number> {
    return this.histoventeService.getTotalSalesWithDiscount(codeMag);
  }

  @Get('totalSalesWithoutDiscount/:codeMag')
  async getTotalSalesWithoutDiscount(@Param('codeMag') codeMag: string): Promise<number> {
    return this.histoventeService.getTotalSalesWithoutDiscount(codeMag);
  }

  @Get('totalQuantityWithPromotion/:codeMag')
  async getTotalQuantityWithPromotion(@Param('codeMag') codeMag: string): Promise<number> {
    return this.histoventeService.getTotalQuantityWithPromotion(codeMag);
  }

  @Get('totalQuantityWithoutPromotion/:codeMag')
  async getTotalQuantityWithoutPromotion(@Param('codeMag') codeMag: string): Promise<number> {
    return this.histoventeService.getTotalQuantityWithoutPromotion(codeMag);
  }





  @Get('totalTransactionsByCodeMag/:codeMag')
  async getTotalTransactionsByCodeMag(@Param('codeMag') codeMag: string): Promise<{ [year: number]: { [month: number]: number } }> {
    try {
      const result = await this.histoventeService.getTotalTransactionsByCodeMag(codeMag);
      return result;
    } catch (error) {
      throw error;
    }
  }
  





  /*products charts 

--------


----------


--------------------------------------------------------------------*/






  @Get('allProductNames')
  async getAllProductNames(): Promise<string[]> {
    try {
      const productNames = await this.histoventeService.getAllProductNames();
      return productNames;
    } catch (error) {
      console.error('Error fetching product names:', error);
      throw error;
    }
  }





  @Get('allProductNamesWithMostSalesByDay/:famille')
  async getAllProductNamesWithMostSalesByDay(@Param('famille') famille: string) {
    try {
      const productSalesByDay = await this.histoventeService.getAllProductNamesWithMostSalesByDay(famille);
      return productSalesByDay;
    } catch (error) {
      console.error('Error fetching product names with most sales by day:', error);
      throw error;
    }
  }
  


  @Get('stores/:productName')  // Make sure the route matches the one used in the client-side code
async getProductStores(@Param('productName') productName: string) {
    try {
        const stores = await this.histoventeService.getProductStores(productName);
        return stores; // Return the fetched data
    } catch (error) {
        return { error: 'An error occurred while fetching product stores' }; // Handle errors appropriately
    }
}
  
  
  
@Get('averagesellingpriceproducts/:productName')
async calculateAverageSellingPriceByProductFamily(@Param('productName') productFamily: string): Promise<{ month: number; averageSellingPrice: number }[]> {
  return this.histoventeService.calculateAverageSellingPriceByFamille(productFamily);
}



@Get('calculateTotalQuantitySoldByFamille/:famille')
    async calculateTotalQuantitySoldByFamille(@Param('famille') famille: string): Promise<{ year: number; month: number; totalQuantitySold: number }[]> {
        return this.histoventeService.calculateTotalQuantitySoldByFamille(famille);
    }


@Get('numberOfReturns/:famille')
    async getNumberOfReturnsForProduct(@Param('famille') famille: string): Promise<number> {
      return this.histoventeService.getNumberOfReturnsForProduct(famille);
    }


    @Get('getLibtaillesNamesAndCountForFamille/:famille')
    async getLibtaillesNamesAndCountForFamille(@Param('famille') famille: string): Promise<any> {
        return this.histoventeService.getLibtaillesNamesAndCountForFamille(famille);
    }







    /*  Orders   chart 

    -------



    -------------------------------------------             */



    @Get('orderCount')
  async countDistinctOrders(): Promise<number> {
    return this.histoventeService.countDistinctOrders();
  }



  @Get('averageQuantitySoldPerOrder')
async calculateAverageQuantitySoldPerOrder(): Promise<number> {
    return this.histoventeService.calculateAverageQuantitySoldPerOrder();
}



@Get('topSellingProductsPerOrder')
  async getTopSellingProductsPerOrder(): Promise<{ barcode: string; quantity: number }[]> {
    const topProducts = await this.histoventeService.getTopSellingProductsPerOrder();
    return topProducts;
  }








  /*  sales  - ---------  
  
  -------------------     */

  @Get('total-by-month')
  async getTotalSalesByMonth(): Promise<{ month: number; year: number; totalSales: number }[]> {
    return this.histoventeService.getTotalSalesByMonth();
  }




  @Get('totalSalesByCountry')
  async getTotalSalesByCountry(): Promise<{ country: string; totalSales: number }[]> {
    return this.histoventeService.getTotalSalesByCountry();
  }



  @Get('getAverageSalesValue')
  async getAverageSalesValue(): Promise<{ month: number; year: number; averageSales: number }[]>{
    return this.histoventeService.getAverageSalesValue();
  }



  @Get('top10Products')
  async get10TopProducts(): Promise<{ name: string; sales: number; quantity: number }[]> {
    return await this.histoventeService.getTopProducts();
  }




  @Get('average-daily')
  async getAverageDailySales(): Promise<number> {
    try {
      const averageSales = await this.histoventeService.calculateAverageSalesDaily();
      return averageSales;
    } catch (error) {
      console.error('Error fetching average daily sales:', error);
      throw new Error('Failed to fetch average daily sales');
    }
  }




}


