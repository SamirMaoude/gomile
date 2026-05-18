import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from 'src/upload/upload.controller';
import { UploadService } from 'src/upload/upload.service';
import { ThrottlerGuard } from '@nestjs/throttler';

const mockUploadService = {
  presign: jest.fn(),
};

describe('UploadController', () => {
  let controller: UploadController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: UploadService, useValue: mockUploadService }],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true })
      .compile();
    controller = module.get(UploadController);
  });

  it('presign delegates to uploadService', async () => {
    mockUploadService.presign.mockResolvedValue({
      uploadUrl: 'https://s3.example.com/upload',
      fileUrl: 'https://s3.example.com/file',
      viewUrl: 'https://s3.example.com/view',
    });
    const dto = { filename: 'photo.jpg', contentType: 'image/jpeg' } as any;
    const result = await controller.presign(dto);
    expect(mockUploadService.presign).toHaveBeenCalledWith('photo.jpg', 'image/jpeg');
    expect(result.uploadUrl).toBeDefined();
    expect(result.fileUrl).toBeDefined();
  });
});
