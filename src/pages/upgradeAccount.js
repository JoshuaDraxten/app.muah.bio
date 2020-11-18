import React, { useState } from 'react';

import createSubscription from '../api/createSubscription';

import { closeCircle } from 'ionicons/icons';
import {
  IonLoading,
  IonButtons,
  IonButton,
  IonContent,
  IonIcon
} from '@ionic/react';

// Internationalization
import { withI18n } from "@lingui/react"
import { Trans } from '@lingui/macro';

import { Elements as StripeElements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Style
import './upgradeAccount.css';

const retryInvoiceWithNewPaymentMethod = () => {}

const stripePromise = loadStripe('pk_test_8TVPVl4EIEjHUXSOlc0fTClc00XQjq863Q');

const CheckoutForm = ({ stripeCustomerId, handleError, setIsLoading, closeModal, updateSubscriptionInformation }) => {
  const stripe = useStripe();
  const elements = useElements();

  const priceId = "price_1HoaokGmFqrQMNciETkkmcWe";
  var userLang = ( navigator.language || navigator.userLanguage);
  const priceString = Intl.NumberFormat(userLang, {maximumSignificantDigits: 1, style: 'currency', currency: "usd" }).format(30)

  const handleSubmit = async (event) => {
    // We don't want to let default form submission happen here,
    // which would refresh the page.
    event.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    // Get a reference to a mounted CardElement. Elements knows how
    // to find your CardElement because there can only ever be one of
    // each type of element.
    const cardElement = elements.getElement(CardElement);

    // If a previous payment was attempted, get the latest invoice
    const latestInvoicePaymentIntentStatus = localStorage.getItem(
      'latestInvoicePaymentIntentStatus'
    );

    // Payment was successful.
    const onSubscriptionComplete = result => {
      if (result.subscription.status === 'active') {

        // Save subscription data to database
        const { id, current_period_end, customer } = result.subscription;
        const product = result.subscription.items.data[0].price.product;
        
        updateSubscriptionInformation({
          id, current_period_end, customer, product
        });

        closeModal();
      }
    }

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      console.log('[createPaymentMethod error]', error);
      handleError( error );
    } else {
      console.log('[PaymentMethod]', paymentMethod);
      const paymentMethodId = paymentMethod.id;
      if (latestInvoicePaymentIntentStatus === 'requires_payment_method') {
        // Update the payment method and retry invoice payment
        const invoiceId = localStorage.getItem('latestInvoiceId');
        retryInvoiceWithNewPaymentMethod({
          stripeCustomerId,
          paymentMethodId,
          invoiceId,
          priceId,
        });
      } else {
        // Create the subscription
        createSubscription({
          customerId: stripeCustomerId,
          paymentMethodId,
          priceId,
          onSubscriptionComplete
        }).catch(handleError)
      }
    }
  };
  
  return <form onSubmit={ handleSubmit }>
      <CardElement disabled={!stripe}/>
      <IonButton type="submit" size="large" expand="block" className="ion-text-wrap">
        <Trans>Upgrade for {priceString}/month</Trans>
      </IonButton>
  </form>
}

const UpgradeAccount = ({ i18n, stripeCustomerId, closeModal, updateSubscriptionInformation }) => {
  const [ isLoading, setIsLoading ] = useState( false );

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
        <CheckoutForm
          stripeCustomerId={stripeCustomerId}
          handleError={error => alert(error)}
          setIsLoading={setIsLoading}
          closeModal={closeModal}
          updateSubscriptionInformation={updateSubscriptionInformation} />
      </StripeElements>
      <p style={{textAlign: 'center', fontSize: 12}}><Trans>Here we put information about our payment policy and the like</Trans></p>
    </div>
    <IonLoading
      isOpen={isLoading}
      message={i18n._("Processing your payment")}
    />
  </IonContent>
}

export default withI18n()(UpgradeAccount);