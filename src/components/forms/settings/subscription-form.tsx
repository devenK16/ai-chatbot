'use client'
import React from 'react'
import useSubscriptions from '@/hooks/billing/use-billing'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import SubscriptionCard from '@/components/settings/subscription-card'

type Props = {
    plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
}

const SubscriptionForm = ({ plan }: Props) => {
    const { loading, onSetPayment, payment, onUpdateToFreeTier, onInitiatePayment } = useSubscriptions(plan)

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3">
                <SubscriptionCard
                    title="STANDARD"
                    description="Perfect if you're just getting started with Corinna AI"
                    price="0"
                    payment={payment}
                    onPayment={onSetPayment}
                    id="STANDARD"
                />
                <SubscriptionCard
                    title="PRO"
                    description="Perfect if you're just getting started with Corinna AI"
                    price="15"
                    payment={payment}
                    onPayment={onSetPayment}
                    id="PRO"
                />
                <SubscriptionCard
                    title="ULTIMATE"
                    description="Perfect if you're just getting started with Corinna AI"
                    price="35"
                    payment={payment}
                    onPayment={onSetPayment}
                    id="ULTIMATE"
                />
            </div>
            {payment === 'STANDARD' ? (
                <Button onClick={onUpdateToFreeTier} disabled={loading}>
                    <Loader loading={loading}>Confirm Free Plan</Loader>
                </Button>
            ) : (
                <Button onClick={onInitiatePayment} disabled={loading}>
                    <Loader loading={loading}>Subscribe</Loader>
                </Button>
            )}
        </div>
    )
}

export default SubscriptionForm