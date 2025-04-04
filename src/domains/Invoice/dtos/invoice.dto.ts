import { Expose } from "class-transformer";
import { IsLatitude, IsLongitude, isLongitude, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { Service } from "typedi";


export class DeliveryInfoDTO {
    
    @Expose()
    @IsString()
    @IsNotEmpty()
    wblNo!: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    sndrNm!: string;

    @Expose()
    @IsString()
    @IsOptional()
    sndrClphno?: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    sndrAddr!: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    rcvrNm!: string;

    @Expose()
    @IsString()
    @IsOptional()
    rcvrClphno?: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    rcvrAddr!: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    repGoodsNm!: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    qty!: string;
}

export class DeliveryTrackDTO {

    @Expose()
    @IsString()
    @IsNotEmpty()
    branNm!: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    procBranTelNo!: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    workDt!: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    workHms!: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    crgStDnm!: string;

    @Expose()
    @IsString()
    @IsNotEmpty()
    crgStDcdVal!: string;
}

export class DeliveryCoordDTO {

    @Expose()
    @IsLatitude()
    latitude!: number;

    @Expose()
    @IsLongitude()
    longitude!: number;

    @Expose()
    @IsString()
    @IsNotEmpty()
    address!: string;
}