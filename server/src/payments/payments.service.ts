import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Payment } from './schemas/payment.schema';
import { Model } from 'mongoose';


interface CreatePaymentDto{
    courseId: string,
    userId: string,
    sessionId: string
    paymentIntentId: string,
    amount: number,
}

@Injectable()
export class PaymentsService {
    constructor(
        @InjectModel('Payment') private paymentModel: Model<Payment>
    ){}

    async createPayment(dto: CreatePaymentDto): Promise<Payment>{
        const newPayment = await new this.paymentModel(dto)
        return newPayment.save()
    }

    async findAllPayments():Promise<Payment[]>{
        return await this.paymentModel.find().exec()
    }
}
