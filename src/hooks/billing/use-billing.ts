// 'use client'
// import { useState } from 'react'
// import { onCreateRazorpayOrder, onVerifyRazorpayPayment, onUpdateSubscription } from '@/actions/stripe'
// import { useToast } from '@/components/ui/use-toast'
// import { useRouter } from 'next/navigation'
// import Head from 'next/head';

// type Plans = 'STANDARD' | 'PRO' | 'ULTIMATE';

// type Props = {
//     plan: Plans
// }
// export default function useSubscriptions(initialPlan: Plans) {
//     const [loading, setLoading] = useState<boolean>(false)
//     const [payment, setPayment] = useState<Plans>(initialPlan)
//     const { toast } = useToast()
//     const router = useRouter()

//     const onUpdateToFreeTier = async () => {
//         try {
//             setLoading(true)
//             const free = await onUpdateSubscription('STANDARD')
//             if (free) {
//                 setLoading(false)
//                 toast({
//                     title: 'Success',
//                     description: free.message,
//                 })
//                 router.refresh()
//             }
//         } catch (error) {
//             console.log(error)
//             setLoading(false)
//         }
//     }

//     const onSetPayment = (payment: Plans) => setPayment(payment)

//     const loadRazorpayScript = (): Promise<boolean> => {
//         return new Promise((resolve) => {
//             const script = document.createElement('script');
//             script.src = 'https://checkout.razorpay.com/v1/checkout.js';
//             script.onload = () => resolve(true);
//             script.onerror = () => resolve(false);
//             document.body.appendChild(script);
//         });
//     };

//     const onInitiatePayment = async () => {
//         try {
//             setLoading(true)
//             const { orderId } = await onCreateRazorpayOrder(payment)
//             if (orderId) {

//                 const isLoaded = await loadRazorpayScript();
//                 if (!isLoaded) {
//                     throw new Error('Razorpay SDK failed to load');
//                 }

//                 const options = {
//                     key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
//                     amount: setPlanAmount(payment) * 100,
//                     currency: 'INR',
//                     name: 'Your Company Name',
//                     description: `${payment} Plan Subscription`,
//                     order_id: orderId,
//                     handler: async (response: any) => {
//                         try {
//                             const result = await onVerifyRazorpayPayment(
//                                 response.razorpay_order_id,
//                                 response.razorpay_payment_id,
//                                 response.razorpay_signature
//                             )
//                             if (result) {
//                                 toast({
//                                     title: 'Success',
//                                     description: 'Subscription activated successfully',
//                                 })
//                                 router.refresh()
//                             }
//                         } catch (error) {
//                             console.error(error)
//                             toast({
//                                 title: 'Error',
//                                 description: 'Failed to verify payment',
//                             })
//                         }
//                     },
//                     prefill: {
//                         name: 'User Name',
//                         email: 'user@example.com',
//                         contact: '9999999999'
//                     },
//                     theme: {
//                         color: '#3399cc'
//                     }
//                 }
//                 const paymentObject = new (window as any).Razorpay(options)
//                 paymentObject.open()
//             }
//         } catch (error) {
//             console.log(error)
//             toast({
//                 title: 'Error',
//                 description: 'Failed to initiate payment',
//             })
//         } finally {
//             setLoading(false)
//         }
//     }

//     return {
//         loading,
//         onSetPayment,
//         payment,
//         onUpdateToFreeTier,
//         onInitiatePayment
//     }
// }

// const setPlanAmount = (plan: Plans) => {
//     switch (plan) {
//         case 'PRO':
//             return 1500
//         case 'ULTIMATE':
//             return 3500
//         default:
//             return 0
//     }
// }

'use client';
import { useState, useEffect } from 'react';
import { onCreateRazorpayOrder, onVerifyRazorpayPayment, onUpdateSubscription } from '@/actions/stripe';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

type Plans = 'STANDARD' | 'PRO' | 'ULTIMATE';

export default function useSubscriptions(initialPlan: Plans) {
    const [loading, setLoading] = useState<boolean>(false);
    const [payment, setPayment] = useState<Plans>(initialPlan);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        // Append Razorpay script in the head using next/head
        const razorpayScript = document.createElement('script');
        razorpayScript.src = 'https://checkout.razorpay.com/v1/checkout.js';
        razorpayScript.async = true;
        razorpayScript.onload = () => {
            console.log('Razorpay script loaded');
        };
        razorpayScript.onerror = () => {
            console.error('Razorpay script failed to load');
        };
        document.head.appendChild(razorpayScript);

        return () => {
            document.head.removeChild(razorpayScript);
        };
    }, []);

    const onUpdateToFreeTier = async () => {
        try {
            setLoading(true);
            const free = await onUpdateSubscription('STANDARD');
            if (free) {
                toast({
                    title: 'Success',
                    description: free.message,
                });
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onSetPayment = (payment: Plans) => setPayment(payment);

    const onInitiatePayment = async () => {
        try {
            setLoading(true);
            const { orderId } = await onCreateRazorpayOrder(payment);
            if (orderId) {
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: setPlanAmount(payment) * 100,
                    currency: 'INR',
                    name: 'Your Company Name',
                    description: `${payment} Plan Subscription`,
                    order_id: orderId,
                    handler: async (response: any) => {
                        try {
                            const result = await onVerifyRazorpayPayment(
                                response.razorpay_order_id,
                                response.razorpay_payment_id,
                                response.razorpay_signature
                            );
                            if (result) {
                                toast({
                                    title: 'Success',
                                    description: 'Subscription activated successfully',
                                });
                                router.refresh();
                            }
                        } catch (error) {
                            console.error(error);
                            toast({
                                title: 'Error',
                                description: 'Failed to verify payment',
                            });
                        }
                    },
                    prefill: {
                        name: 'User Name',
                        email: 'user@example.com',
                        contact: '9999999999',
                    },
                    theme: {
                        color: '#3399cc',
                    },
                };
                const paymentObject = new (window as any).Razorpay(options);
                paymentObject.open();
            }
        } catch (error) {
            console.error(error);
            toast({
                title: 'Error',
                description: 'Failed to initiate payment',
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        onSetPayment,
        payment,
        onUpdateToFreeTier,
        onInitiatePayment,
    };
}

const setPlanAmount = (plan: Plans) => {
    switch (plan) {
        case 'PRO':
            return 1500;
        case 'ULTIMATE':
            return 3500;
        default:
            return 0;
    }
};
