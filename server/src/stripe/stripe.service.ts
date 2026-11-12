import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentsService } from 'src/payments/payments.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private paymentsService: PaymentsService,
  ) {
    const stripeKey = this.configService.get<string>('STRIPE_KEY');

    if (!stripeKey) {
      throw new Error('STRIPE_KEY is not defined in environment variables');
    }

    this.stripe = new Stripe(stripeKey);
  }

  async createCheckoutSession(courseId: string, userId: string) {
    this.logger.log('createCheckoutSession()');

    try {
      // For now we'll hardcode a price — later you can fetch from a DB
      const coursePrice = 20; // $20 for testing

      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Test Course',
              },
              unit_amount: coursePrice * 100, // Stripe expects cents
            },
            quantity: 1,
          },
        ],
        payment_intent_data: {
          metadata: {
            courseId,
            userId,
          },
        },
        mode: 'payment',
        success_url: `http://localhost:3000/success`,
        cancel_url: `http://localhost:3000/cancel`,
      });

      return { url: session.url };
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      this.logger.error(err.message);
      throw new InternalServerErrorException(
        'Failed to create Stripe checkout session',
        err.message,
      );
    }
  }

  // Add this method to verify and construct the event
  constructEvent(
    payload: Buffer,
    sig: string | string[],
    secret: string,
  ): Stripe.Event {
    return this.stripe.webhooks.constructEvent(payload, sig, secret);
  }

  async handleEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Received event: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      this.logger.log(`Checkout session completed: ${session.id}`);

      if (session.payment_intent) {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(
          session.payment_intent as string,
        );
        this.logger.log(`Metadata: ${JSON.stringify(paymentIntent.metadata)}`);

        // Now you'd save courseId/userId to your database
        const { courseId, userId } = paymentIntent.metadata;
        this.logger.log(`courseId: ${courseId}, userId: ${userId}`);

        // Save to MongoDB
        await this.paymentsService.createPayment({
          courseId,
          userId,
          sessionId: session.id,
          paymentIntentId: paymentIntent.id,
          amount: (paymentIntent.amount ?? 0) / 100, // convert cents back to dollars
        });

        this.logger.log('Payment record saved to MongoDB ✅');
      }
    }
  }
}
