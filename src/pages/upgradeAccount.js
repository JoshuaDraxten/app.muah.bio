import React from 'react';

import { arrowForward, closeCircle } from 'ionicons/icons';
import {
  IonButtons,
  IonButton,
  IonContent,
  IonIcon
} from '@ionic/react';

// Internationalization
import { Trans } from '@lingui/macro';

import { Elements as StripeElements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Style
import './upgradeAccount.css';

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe('pk_test_JJ1eMdKN0Hp4UFJ6kWXWO4ix00jtXzq5XG');

const CARD_OPTIONS = {
  // iconStyle: 'solid',
  // style: {
  //   base: {
  //     iconColor: '#c4f0ff',
  //     color: '#fff',
  //     fontWeight: 500,
  //     fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
  //     fontSize: '16px',
  //     fontSmoothing: 'antialiased',
  //     ':-webkit-autofill': {color: '#fce883'},
  //     '::placeholder': {color: '#87bbfd'},
  //   },
  //   invalid: {
  //     iconColor: '#ffc7ee',
  //     color: '#ffc7ee',
  //   },
  // },
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const result = await stripe.confirmCardPayment('{CLIENT_SECRET}', {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (result.error) {
      // Show error to your customer (e.g., insufficient funds)
      console.log(result.error.message);
    } else {
      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {
        // Show a success message to your customer
        // There's a risk of the customer closing the window before callback
        // execution. Set up a webhook or plugin to listen for the
        // payment_intent.succeeded event that handles any business critical
        // post-payment actions.
      }
    }
  };
  
  return <form onSubmit={ handleSubmit }>
      <CardElement options={CARD_OPTIONS} disabled={!stripe}/>
      <IonButton type="submit" size="large" expand="block">
        <Trans>Upgrade for $30/month</Trans>
        {/* <IonIcon icon={arrowForward} /> */}
      </IonButton>
  </form>
}

export default ({ closeModal }) => {
  return <IonContent fullscreen>
    <div className=".header-buttons">
      <IonButtons slot="end" className="header-buttons">
        <IonButton onClick={closeModal}>
          <IonIcon icon={closeCircle} size="large" />
        </IonButton>
      </IonButtons>
    </div>

    <div className="payment-page">
      <div style={{textAlign: "center"}}>
        <img style={{maxWidth: "72px"}} alt="" src="/images/icons-192.png"/>
        <h1><Trans>Upgrade your account</Trans></h1>
      </div>
      <br />
      <StripeElements stripe={stripePromise}>
        <CheckoutForm />
      </StripeElements>
      <p style={{textAlign: 'center', fontSize: 12}}><Trans>Here we put information about our payment policy and the like</Trans></p>
    </div>
  </IonContent>
}