const logAndReturn = ( x ) => {
  console.log( x )
  return x
}

function createSubscription({ handlePaymentThatRequiresCustomerAction, priceId, customerId, paymentMethodId, onSubscriptionComplete, stripe, handleError }) {
  
  function handleRequiresPaymentMethod({
    subscription,
    paymentMethodId,
    priceId,
  }) {
    console.log(subscription);
    if (subscription.status === 'active') {
      // subscription is active, no customer actions required.
      return { subscription, priceId, paymentMethodId };
    } else if (
      subscription.latest_invoice.payment_intent.status ===
      'requires_payment_method'
    ) {
      // Using localStorage to manage the state of the retry here,
      // feel free to replace with what you prefer.
      // Store the latest invoice ID and status.
      localStorage.setItem('latestInvoiceId', subscription.latest_invoice.id);
      localStorage.setItem(
        'latestInvoicePaymentIntentStatus',
        subscription.latest_invoice.payment_intent.status
      );
      handleError('Your card was declined.');
    } else {
      return { subscription, priceId, paymentMethodId };
    }
  }
  
  return (
    fetch('/.netlify/functions/stripe-create-subscription', {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        priceId,
        customerId: customerId,
        paymentMethodId: paymentMethodId
      }),
    })
      .then((response) => {
        return response.json();
      })
      // If the card is declined, display an error to the user.
      .then((result) => {
        if (result.error) {
          // The card had an error when trying to attach it to a customer.
          throw result;
        }
        return result;
      })
      // Normalize the result to contain the object returned by Stripe.
      // Add the additional details we need.
      .then((result) => {
        return {
          paymentMethodId: paymentMethodId,
          subscription: result,
        };
      })
      .then(logAndReturn)
      // Some payment methods require a customer to be on session
      // to complete the payment process. Check the status of the
      // payment intent to handle these actions.
      .then(handlePaymentThatRequiresCustomerAction)
      .then(logAndReturn)
      // If attaching this card to a Customer object succeeds,
      // but attempts to charge the customer fail, you
      // get a requires_payment_method error.
      .then(handleRequiresPaymentMethod)
      .then(logAndReturn)
      // No more actions required. Provision your service for the user.
      .then(onSubscriptionComplete)
      .then(logAndReturn)
      .catch((error) => {
        // An error has happened. Display the failure to the user here.
        // We utilize the HTML element we created.
        handleError(error);
      })
  );
}

export default createSubscription;