const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async ( event, context ) => {
    let { customerId } = event.queryStringParameters;

    const link = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: "https://app.muah.bio",
    });

    return {
        statusCode: 200,
        body: link.url
    }
}