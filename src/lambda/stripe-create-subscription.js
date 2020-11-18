const stripe = require('stripe')('sk_test_FbahxVVYcD4w8X5qzFjXvR8300fRDtI94e');

exports.handler = async ( event, context ) => {
  const body = JSON.parse( event.body );

  console.log( body )

  // Attach the payment method to the customer
  try {
    await stripe.paymentMethods.attach(body.paymentMethodId, {
      customer: body.customerId,
    });
  } catch (error) {
    return {
      statusCode: 402,
      body: JSON.stringify({ error: { message: error.message } })
    }
  }

  // Change the default invoice settings on the customer to the new payment method
  await stripe.customers.update(
    body.customerId,
    {
      invoice_settings: {
        default_payment_method: body.paymentMethodId,
      },
    }
  );

  // Create the subscription
  const subscription = await stripe.subscriptions.create({
    customer: body.customerId,
    items: [{ price: body.priceId }],
    expand: ['latest_invoice.payment_intent'],
  });
  
  return {
    statusCode: 200,
    body: JSON.stringify( subscription )
  }
}