const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async ( e ) => {
    const body = JSON.parse( e.body );
    try {
        await stripe.paymentMethods.attach(body.paymentMethodId, {
            customer: body.customerId,
        });
        await stripe.customers.update(body.customerId, {
        invoice_settings: {
            default_payment_method: body.paymentMethodId,
        },
        });
    } catch (error) {
        // in case card_decline error
        return {
            statusCode: 402,
            body: JSON.stringify({ error: { message: error.message } })
        }
    }

    const invoice = await stripe.invoices.retrieve(body.invoiceId, {
        expand: ['payment_intent'],
    });
    return {
        statusCode: 200,
        body: JSON.stringify(invoice)
    }
}