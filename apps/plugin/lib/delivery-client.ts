import type {
    DeliveryEstimateInput,
    DeliveryEstimateResponse,
} from '../../../shared/delivery-contracts'

export class DeliveryClient {
    constructor (private readonly baseUrl: string, private readonly apiKey: string) {}

    async estimate(input: DeliveryEstimateInput): Promise<DeliveryEstimateResponse> {
        const response = await fetch(`${this.baseUrl}/delivery-estimates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
            },
            body: JSON.stringify(input),
        });
        
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            const message = body?.message ?? response.statusText;
            const code = body?.code ?? 'UNKNOWN_ERROR';
            throw Object.assign(new Error(message), { code, statusCode: response.status });
        }

        const result = await response.json();
        return result;
    }
}