import { v2 as cloudinary } from 'cloudinary';
import { UploadResponseDTO } from '../dto/response/upload.dto';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  async uploadImage(file: File): Promise<UploadResponseDTO> {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'ecommerce-products',
            transformation: [{ width: 800, height: 800, crop: 'limit' }],
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('Upload failed'));

            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              width: result.width,
              height: result.height,
            });
          }
        )
        .end(buffer);
    });
  }

  async deleteImage(publicId: string): Promise<boolean> {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  }
}