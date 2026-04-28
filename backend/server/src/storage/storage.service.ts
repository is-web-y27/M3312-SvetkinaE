import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';

/**
 * Yandex Object Storage совместим с AWS S3 API.
 * @see https://yandex.cloud/ru/docs/storage/tools/aws-sdk-js
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly client: S3Client | null;
  private readonly bucket: string | null;
  /** Общий префикс ключей — «папка» внутри бакета (по умолчанию museum-bff). */
  private readonly rootFolder: string;

  constructor(private readonly config: ConfigService) {
    const bucket = this.config.get<string>('S3_BUCKET');
    const endpoint = this.config.get<string>('S3_ENDPOINT', 'https://storage.yandexcloud.net');
    const region = this.config.get<string>('S3_REGION', 'ru-central1');
    const accessKeyId = this.config.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.config.get<string>('AWS_SECRET_ACCESS_KEY');

    const rawPrefix = this.config.get<string>('S3_UPLOAD_PREFIX', 'museum-bff');
    const cleaned =
      typeof rawPrefix === 'string' ? rawPrefix.trim().replace(/^\/+|\/+$/g, '') : '';
    this.rootFolder = cleaned.length > 0 ? cleaned : 'museum-bff';

    this.bucket = bucket ?? null;

    if (!bucket || !accessKeyId || !secretAccessKey) {
      this.logger.warn('S3_BUCKET / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY не заданы — загрузка в Object Storage недоступна');
      this.client = null;
    } else {
      this.client = new S3Client({
        region,
        endpoint,
        credentials: { accessKeyId, secretAccessKey },
        forcePathStyle: true,
      });
    }
  }

  isConfigured(): boolean {
    return this.client !== null && this.bucket !== null;
  }

  /**
   * Загружает объект в бакет и возвращает публичный URL (path-style).
   * Ключ: {S3_UPLOAD_PREFIX}/{keyPrefix}/{timestamp}-{random}
   */
  async uploadPublicObject(params: {
    buffer: Buffer;
    contentType: string;
    keyPrefix?: string;
  }): Promise<string> {
    if (!this.client || !this.bucket) {
      throw new InternalServerErrorException(
        'Object Storage не настроен. Задайте S3_BUCKET, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY в .env',
      );
    }

    const inner = params.keyPrefix ?? 'files';
    const name = `${Date.now()}-${randomBytes(6).toString('hex')}`;
    const key = `${this.rootFolder}/${inner}/${name}`.replace(/\/+/g, '/');

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: params.buffer,
        ContentType: params.contentType,
      }),
    );

    return `https://storage.yandexcloud.net/${this.bucket}/${key}`;
  }
}
