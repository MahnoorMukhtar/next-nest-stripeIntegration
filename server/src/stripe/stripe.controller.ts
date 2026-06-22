import { Controller, Post, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';

@Controller('api/stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(
    @Body() body: { courseId: string; userId: string },
  ) {
    const { url } = await this.stripeService.createCheckoutSession(
      body.courseId,
      body.userId,
    );
    return { data: { url } };
  }

  @Post('webhook')
  async handleWebhook(@Req() req: Request & { rawBody: Buffer }) {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      throw new HttpException('Missing signature or secret', HttpStatus.BAD_REQUEST);
    }

    try {
      const event = this.stripeService.constructEvent(req.rawBody, sig, endpointSecret);
      await this.stripeService.handleEvent(event);
      return { received: true };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      throw new HttpException(`Webhook Error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}