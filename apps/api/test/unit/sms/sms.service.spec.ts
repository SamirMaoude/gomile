import { Test, TestingModule } from '@nestjs/testing';
import { SmsService } from 'src/sms/sms.service';

const mockMessagesCreate = jest.fn();

jest.mock('twilio', () =>
  jest.fn(() => ({
    messages: { create: mockMessagesCreate },
  })),
);

describe('SmsService', () => {
  let service: SmsService;

  beforeEach(async () => {
    mockMessagesCreate.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [SmsService],
    }).compile();
    service = module.get(SmsService);
  });

  describe('normalizePhone', () => {
    it('passes E.164 numbers through unchanged', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'SM1' });
      await service.sendSms('+33612345678', 'hello');
      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '+33612345678' }),
      );
    });

    it('converts French local number (06XXXXXXXX) to E.164', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'SM1' });
      await service.sendSms('0612345678', 'hello');
      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '+33612345678' }),
      );
    });

    it('strips spaces before normalizing', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'SM1' });
      await service.sendSms('06 12 34 56 78', 'hello');
      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '+33612345678' }),
      );
    });

    it('passes unknown formats through as-is', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'SM1' });
      await service.sendSms('+1415555', 'hello');
      expect(mockMessagesCreate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '+1415555' }),
      );
    });
  });

  describe('sendSms', () => {
    it('calls twilio messages.create with normalized phone and body', async () => {
      mockMessagesCreate.mockResolvedValue({ sid: 'SM1' });
      await service.sendSms('+33600000001', 'Test message');
      expect(mockMessagesCreate).toHaveBeenCalledWith({
        to: '+33600000001',
        from: process.env.TWILIO_PHONE_NUMBER,
        body: 'Test message',
      });
    });

    it('throws and logs when twilio rejects', async () => {
      const error = new Error('Twilio error');
      mockMessagesCreate.mockRejectedValue(error);
      await expect(service.sendSms('+33600000001', 'msg')).rejects.toThrow('Twilio error');
    });
  });
});
