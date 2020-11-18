const stripe = require("stripe");

exports.handler = async ( event, context ) => {
  const priceId = "price_1HoataGmFqrQMNciIGunZt5f";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: 'https://app.muah.com/payment-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://app.muah.com/payment-canceled',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        sessionId: session.id,
      }),
    }
    
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: {
          message: e.message,
        }
      }),
    }
  }
}