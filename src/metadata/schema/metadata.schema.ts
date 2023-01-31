import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { appendFile } from 'fs';
import mongoose, { Document, PromiseProvider, Types } from 'mongoose';
export type metadataDocument = metadata & Document;

@Schema({ timestamps: true })
export class metadata {
  @Prop()
  contract_address: string;

  @Prop({ enum: ['NGM721PSI', 'NGM1155', 'NGMTINY721'] })
  contract_type: string;

  @Prop()
  tokenUri: Array<{
    tokenId: number;
    uri: string;
  }>;

  @Prop({ type: Object })
  chain: { id: number, name: string };
}

export const metadataSchema = SchemaFactory.createForClass(metadata);

export class GetMetadata {
  @ApiProperty({default:'0x5Eb7D2414e19E730A61aBB897793F0E8406f0F05'})
  contract_address: string
  @ApiProperty({default:'0'})
  token_id: string
}

class attributes {
  @ApiProperty({})
  name:string
  @ApiProperty({})
  value:string
}
export class meta_data {
  @ApiProperty({})
  name:string
  @ApiProperty({})
  image:string
  @ApiProperty({})
  description:string
  @ApiProperty({})
  external_uri:string
  @ApiProperty({})
  attributes:attributes
}