import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HistoventeController } from './histovente.controller';
import { HistoventeService } from './histovente.service';
import { Histovente, HistoventeSchema } from './schemas/histovente.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Histovente.name, schema: HistoventeSchema }]),

  ],
  controllers: [HistoventeController],
  providers: [HistoventeService],
})
export class HistoventeModule {}
