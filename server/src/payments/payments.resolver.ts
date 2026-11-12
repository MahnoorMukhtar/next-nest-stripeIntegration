import { Resolver, Query, ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { PaymentsService } from './payments.service';

@ObjectType()
export class PaymentType {
  @Field(() => ID)
  _id: string;

  @Field()
  courseId: string;

  @Field()
  userId: string;

  @Field()
  sessionId: string;

  @Field()
  paymentIntentId: string;

  @Field(() => Float)
  amount: number;

  @Field()
  status: string;
}

@Resolver(() => PaymentType)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Query(() => [PaymentType], { name: 'payments' })
  async getAllPayments() {
    return this.paymentsService.findAllPayments();
  }
}