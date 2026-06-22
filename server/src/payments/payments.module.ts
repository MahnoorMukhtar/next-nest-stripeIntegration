import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentSchema } from './schemas/payment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{name: 'Payment', schema: PaymentSchema}])
  ],
  providers: [PaymentsService],
  exports: [PaymentsService]
})
export class PaymentsModule {}  
