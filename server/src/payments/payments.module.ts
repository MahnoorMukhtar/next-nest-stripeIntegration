import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSchema } from './schemas/payment.schema';
import { PaymentsResolver } from './payments.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Payment', schema: PaymentSchema}])
  ],
  providers: [PaymentsService, PaymentsResolver],
  exports: [PaymentsService]
})
export class PaymentsModule {}  
