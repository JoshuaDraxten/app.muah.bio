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

function retryInvoiceWithNewPaymentMethod({
  customerId,
  paymentMethodId,
  invoiceId,
  handlePaymentThatRequiresCustomerAction,
  onSubscriptionComplete,
  handleError
}) {
  return (
    fetch('/.netlify/functions/stripe-retry-invoice', {
      method: 'post',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        customerId,
        paymentMethodId,
        invoiceId,
      }),
    })
      .then((response) => response.json())
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
        console.log( result )
        return {
          // Use the Stripe 'object' property on the
          // returned result to understand what object is returned.
          invoice: result,
          paymentMethodId: paymentMethodId,
          isRetry: true,
        };
      })
      // Some payment methods require a customer to be on session
      // to complete the payment process. Check the status of the
      // payment intent to handle these actions.
      .then(handlePaymentThatRequiresCustomerAction)
      // No more actions required. Provision your service for the user.
      .then(onSubscriptionComplete)
      .catch((error) => {
        // An error has happened. Display the failure to the user here.
        // We utilize the HTML element we created.
        handleError(error);
      })
  );
}

const userLang = ( navigator.language || navigator.userLanguage);
const numberFormatter = ( number, currency ) => Intl.NumberFormat(userLang, {
  style: 'currency', currency
}).format(number)

const isProd = window.location.origin === "https://app.muah.bio"
const stripePromise = loadStripe( isProd ?
  'pk_live_vV2XxZDJ7Vl9KFgqlR1TJ4Gj00IpeDf15Y' :
  'pk_test_8TVPVl4EIEjHUXSOlc0fTClc00XQjq863Q'
);

const CheckoutForm = ({ activePlan, stripeCustomerId, setIsLoading, closeModal, updateSubscriptionInformation }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [ error, setError ] = useState('');

  const priceString = activePlan.cost

  const handleError = error => {
    if ( error.error ) error = error.error;

    console.log(error);
    if ( typeof error === "string" ) {
      setError( error )
    } else {
      setError( error.message );
    }
    setIsLoading( false );
  }

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
      if (result && result.subscription.status === 'active') {

        // Save subscription data to database
        const { id, current_period_end, customer } = result.subscription;
        const product = result.subscription.items.data[0].price.product;
        
        updateSubscriptionInformation({
          id, current_period_end, customer, product
        });

        closeModal();
      }
    }

    function handlePaymentThatRequiresCustomerAction({
      subscription,
      invoice,
      priceId,
      paymentMethodId,
      isRetry,
    }) {
      if (subscription && subscription.status === 'active') {
        // Subscription is active, no customer actions required.
        return { subscription, priceId, paymentMethodId };
      }
    
      // If it's a first payment attempt, the payment intent is on the subscription latest invoice.
      // If it's a retry, the payment intent will be on the invoice itself.
      let paymentIntent = invoice ? invoice.payment_intent : subscription.latest_invoice.payment_intent;
    
      if (
        paymentIntent.status === 'requires_action' ||
        (isRetry === true && paymentIntent.status === 'requires_payment_method')
      ) {
        return stripe
          .confirmCardPayment(paymentIntent.client_secret, {
            payment_method: paymentMethodId,
          })
          .then((result) => {
            if (result.error) {
              // Start code flow to handle updating the payment details.
              // Display error message in your UI.
              // The card was declined (i.e. insufficient funds, card has expired, etc).
              handleError(result.error);
              throw result;
            } else {
              if (result.paymentIntent.status === 'succeeded') {
                // Show a success message to your customer.
                // There's a risk of the customer closing the window before the callback.
                // We recommend setting up webhook endpoints later in this guide.
                return {
                  priceId: priceId,
                  subscription: subscription,
                  invoice: invoice,
                  paymentMethodId: paymentMethodId,
                };
              }
            }
          })
          .catch((error) => {

            console.log( error )
            handleError(error);
          });
      } else {
        // No customer action needed.
        return { subscription, priceId, paymentMethodId };
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
          customerId: stripeCustomerId,
          paymentMethodId,
          invoiceId,
          handlePaymentThatRequiresCustomerAction,
          onSubscriptionComplete,
          handleError
        });
      } else {
        console.log("Create the subscription")
        // Create the subscription
        createSubscription({
          handleError,
          stripe,
          customerId: stripeCustomerId,
          paymentMethodId,
          onSubscriptionComplete,
          handlePaymentThatRequiresCustomerAction
        }).catch(handleError)
      }
    }
  };
  
  return <form onSubmit={ handleSubmit }>
      <CardElement disabled={!stripe}/>
      { error ? <div className="payment-error">{error}</div> : null }
      <IonButton type="submit" size="large" expand="block" className="ion-text-wrap">
        <Trans>Upgrade for {priceString}</Trans>
      </IonButton>
  </form>
}

const roiCalculator = ({
  followers,
  engagementRate,
  averageProductPrice=40,
  averageCommision,
  currency
}) => numberFormatter(followers*engagementRate*averageProductPrice*averageCommision, currency)

const PricingTable = ({ pricingPlans, currency }) => {
  return <div className="pricing-table">
    {pricingPlans.map( ( plan, i ) => (plan.onlyShowIfSelected && !plan.isSelected) ? null : <div key={i} className={"pricing-table__option" + (plan.isSelected ? " selected" : "")}>
        <h2>{plan.name}<span className="divider"></span>{plan.cost}</h2>
        { plan.isSelected &&
          <p><Trans>Estimated minimum earnings</Trans>: {roiCalculator({ ...plan.minimumStats, currency })}/<Trans>month</Trans></p>
        }
    </div>)}
  </div>
}

const UpgradeAccount = ({ i18n, stripeCustomerId, closeModal, updateSubscriptionInformation }) => {
  const [ isLoading, setIsLoading ] = useState( false );
  const [ currency ] = useState( 'usd' );
  const currencyName = currency === "mxn" ? i18n._("Mexican Pesos") : i18n._("US Dolars");

  const followers = 6342;

  const pricingPlans = [
    {
      name: "0 — 5k " + i18n._("followers"),
      isSelected: followers < 5000,
      cost: (currency === "mxn" ? numberFormatter(100, "mxn") : numberFormatter(5, 'usd')) + "/" + i18n._("month"),
      minimumStats: {
        followers,
        engagementRate: 0.05,
        averageProductPrice: currency === "mxn" ? 200 : 20,
        averageCommision: 0.06
      }
    }, {
      name: "5k — 50k " + i18n._("followers"),
      isSelected: followers >= 5000 && followers < 50000,
      cost: (currency === "mxn" ? numberFormatter(1000, "mxn") : numberFormatter(50, 'usd')) + "/" + i18n._("month"),
      minimumStats: {
        followers,
        engagementRate: 0.05,
        averageProductPrice: currency === "mxn" ? 500 : 40,
        averageCommision: 0.08
      }
    }, {
      name: "50k — 200k " + i18n._("followers"),
      isSelected: followers >= 50000 && followers < 200000,
      cost: (currency === "mxn" ? numberFormatter(2500, "mxn") : numberFormatter(120, 'usd')) + "/" + i18n._("month"),
      minimumStats: {
        followers,
        engagementRate: 0.05,
        averageProductPrice: currency === "mxn" ? 500 : 40,
        averageCommision: 0.08
      }
    }, {
      name: "200k+ " + i18n._("followers"),
      isSelected: followers > 200000,
      cost: i18n._("Contact us"),
      onlyShowIfSelected: true,
      minimumStats: {
        followers,
        engagementRate: 0.05,
        averageProductPrice: currency === "mxn" ? 500 : 40,
        averageCommision: 0.08
      }
    }
  ];
  const activePlan = pricingPlans.find(plan => plan.isSelected);
  console.log(activePlan  )

  return <IonContent fullscreen>
    <div className=".header-buttons">
      <IonButtons slot="end" className="header-buttons">
        <IonButton onClick={closeModal}>
          <IonIcon icon={closeCircle} size="large" />
        </IonButton>
      </IonButtons>
    </div>

    <div className="payment-page">
      <div className="payment-page__header">
        <img alt="" src="/images/icons-192.png"/>
        <span><Trans>Upgrade your account</Trans></span>
      </div>
      <PricingTable currency={currency} pricingPlans={pricingPlans} />
      { followers < 200000 ?<>
        <StripeElements stripe={stripePromise}>
          <CheckoutForm
            activePlan={activePlan}
            stripeCustomerId={stripeCustomerId}
            setIsLoading={setIsLoading}
            closeModal={closeModal}
            updateSubscriptionInformation={updateSubscriptionInformation} />
        </StripeElements>
        <p style={{textAlign: 'center', fontSize: 12}}>
          <Trans>By signing up, you agree to our <a href="https://muah.bio/legal">TOS and privacy policy.</a></Trans>
          <span style={{ fontWeight: "bold", whiteSpace: 'nowrap' }}>&#32;<Trans>All prices are in {currencyName}.</Trans></span>
        </p>
      </>
      : <div>
        <IonButton href="mailto:josh@muah.bio" size="large" expand="block" className="ion-text-wrap">
          <Trans>Contact us</Trans>
        </IonButton>
      </div> }
    </div>
    <IonLoading
      isOpen={isLoading}
      message={i18n._("Processing your payment")}
    />
  </IonContent>
}

export default withI18n()(UpgradeAccount);