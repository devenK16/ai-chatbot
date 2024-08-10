'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs'
import { razorpay } from '@/lib/razorpay'
import { Plans } from '@prisma/client'

export const onUpdateSubscription = async (plan: Plans) => {
    try {
        const user = await currentUser()
        if (!user) return

        const credits = plan === 'PRO' ? 50 : plan === 'ULTIMATE' ? 500 : 10

        const update = await client.user.update({
            where: {
                clerkId: user.id,
            },
            data: {
                subscription: {
                    upsert: {
                        create: {
                            plan,
                            credits,
                            status: 'active',
                        },
                        update: {
                            plan,
                            credits,
                            status: 'active',
                        },
                    },
                },
            },
            include: {
                subscription: {
                    select: {
                        plan: true,
                    },
                },
            },
        })

        if (update) {
            return {
                status: 200,
                message: 'subscription updated',
                plan: update.subscription?.plan,
            }
        }
    } catch (error) {
        console.log(error)
    }
}

const setPlanAmount = (plan: Plans) => {
    switch (plan) {
        case 'PRO':
            return 1500
        case 'ULTIMATE':
            return 3500
        default:
            return 0
    }
}

export const onCreateRazorpayOrder = async (plan: Plans) => {
    try {
        const user = await currentUser()
        if (!user) throw new Error('User not found')

        const amount = setPlanAmount(plan)
        const order = await razorpay.orders.create({
            amount: amount * 100, // Razorpay expects amount in paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                plan: plan
            }
        })

        await client.billings.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                razorpayOrderId: order.id,
                plan,
                status: 'pending',
            },
            update: {
                razorpayOrderId: order.id,
                plan,
                status: 'pending',
            },
        })

        return { orderId: order.id }
    } catch (error) {
        console.log(error)
        throw error
    }
}

export const onVerifyRazorpayPayment = async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
) => {
    const crypto = require('crypto')
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`)
    const digest = shasum.digest('hex')

    if (digest !== razorpaySignature) {
        throw new Error('Transaction not legit!')
    }

    const user = await currentUser()
    if (!user) throw new Error('User not found')

    const billing = await client.billings.findUnique({
        where: { userId: user.id },
    })

    if (!billing) throw new Error('Billing not found')

    // Update the billing record and user subscription
    await client.billings.update({
        where: { userId: user.id },
        data: {
            razorpayPaymentId,
            status: 'active',
        },
    })

    return onUpdateSubscription(billing.plan)
}