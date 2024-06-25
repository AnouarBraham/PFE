import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Histovente extends Document {
  @Prop()
  IDHistoVente: number;

  @Prop()
  CodeMag: string;

  @Prop()
  Reception: Date;

  @Prop()
  Famille: string;

  @Prop()
  Barcode: string;

  @Prop()
  Designation: string;

  @Prop()
  LibTaille: string;

  @Prop()
  PrixVente: number;

  @Prop()
  Prix: number;

  @Prop()
  Quantite: number;

  @Prop()
  Remise: number;

  @Prop()
  Total: number;

  @Prop()
  Saison: string;

  @Prop()
  CodeArticle: string;

  @Prop()
  CodeBarre: string;

  @Prop()
  TypeVente: string;

  @Prop()
  IDTicket: number;

  @Prop()
  isFacture: number;

}



export const HistoventeSchema = SchemaFactory.createForClass(Histovente);