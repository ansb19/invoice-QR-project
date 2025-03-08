import { EnvConfig } from "@/config/env.config";
import {
    S3Client,
    CreateBucketCommand,
    PutObjectCommand,
    ListObjectsCommand,
    CopyObjectCommand,
    GetObjectCommand,
    DeleteObjectsCommand,
    DeleteBucketCommand,
    S3ServiceException,
    NoSuchKey,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { Inject, Service } from "typedi";
import fs from "fs";
import QRCode from "qrcode";
import { ContentType } from "routing-controllers";
import { ExternalApiError } from "@/common/exceptions/app.error";

@Service()
export class AWS_S3 {
    private s3_client: S3Client;
    private bucket_name: string;

    constructor(@Inject(() => EnvConfig) private config: EnvConfig) {
        this.s3_client = new S3Client({
            apiVersion: 'latest',
            region: this.config.AWS_S3_REGION,
            credentials: {
                accessKeyId: this.config.AWS_S3_ACCESS_KEY,
                secretAccessKey: this.config.AWS_S3_ACCESS_SECRET,
            },

        });
        this.bucket_name = this.config.AWS_S3_BUCKNAME;
    }

    public async upload_file(file_name: string, buffer: Buffer): Promise<string | null> {

        try {

            const upload_params = {
                Bucket: this.bucket_name,
                Key: file_name,
                Body: buffer,
                ContentType: 'image/png',
            }

            const command = new PutObjectCommand(upload_params);

            const response = await this.s3_client.send(command);

            const result = response.ETag;

            if (!result)
                return null;

            return result;
        } catch (caught) {
            if (
                caught instanceof S3ServiceException &&
                caught.name === "EntityTooLarge"
            ) {
                console.error(
                    `Error from S3 while uploading object to ${this.bucket_name}. \
The object was too large. To upload objects larger than 5GB, use the S3 console (160GB max) \
or the multipart upload API (5TB max).`,
                );
            } else if (caught instanceof S3ServiceException) {
                console.error(
                    `Error from S3 while uploading object to ${this.bucket_name}.  ${caught.name}: ${caught.message}`,
                );
            } else {
                throw caught;
            }
            return null;
        }
    }
    public async get_file_url(file_name: string): Promise<string | null> {
        try {

            const etag = await this.get_s3_etag(file_name);
            if (!etag) return null;

            const s3_url = `https://${this.bucket_name}.s3.${this.config.AWS_S3_REGION}.amazonaws.com/${file_name}?etag=${etag}`;
            return s3_url;

        } catch (caught) {
            if (caught instanceof NoSuchKey) {
                console.error(
                    `Error from S3 while getting object "${file_name}" from "${this.bucket_name}". No such key exists.`,
                );
            } else if (caught instanceof S3ServiceException) {
                console.error(
                    `Error from S3 while getting object from ${this.bucket_name}.  ${caught.name}: ${caught.message}`,
                );
            } else {
                throw caught;
            }
            return null;
        }
    }

    public async get_s3_etag(file_name: string): Promise<string | null> {
        try {
            const command = new HeadObjectCommand({
                Bucket: this.bucket_name,
                Key: file_name,
            })
            const response = await this.s3_client.send(command);

            if (!response.ETag)
                return null;
            return response.ETag;

        } catch (caught) {
            if (caught instanceof NoSuchKey) {
                console.error(
                    `Error from S3 while heading object "${file_name}" from "${this.bucket_name}". No such key exists.`,
                );
            } else if (caught instanceof S3ServiceException) {
                console.error(
                    `Error from S3 while heading object from ${this.bucket_name}.  ${caught.name}: ${caught.message}`,
                );
            } else {
                throw caught;
            }
            return null;
        }
    }
}