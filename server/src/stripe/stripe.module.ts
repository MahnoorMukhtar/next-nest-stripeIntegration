import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  imports: [PaymentsModule],
  providers: [StripeService],
  controllers: [StripeController]
})
export class StripeModule {}
