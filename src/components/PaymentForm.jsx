import Script from 'next/script';
import { useRouter } from 'next/router';

const style = {
  base: {
    color: '#262627',
    lineHeight: '16px',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#5e5e5e',
      fontSize: '16px',
    },
  },
  invalid: {
    color: '#FF9494',
  },
};

// input labels/placeholders
const labels = {
  cardNumber: 'Card Number',
  expirationDate: 'MM/YY',
  cvv: 'CVV',
  cardHolder: 'Holder Name',
};

const PaymentForm = ({ paymentHandler, children, buttonName }) => {
  const { locale } = useRouter();

  //payment options
  const paymentOptions = {
    currencyCode: ['SAR'],
    paymentAllowed: 'all',
    labels: labels,
    TextDirection: locale === 'ar' ? 'rtl' : 'ltr',
  };

  return (
    <>
      <form id="form-container">
        <div id="element-container"></div>
        <div id="payment-details">{children}</div>
        <div
          id="error-container"
          className="hidden p-4 mt-3 rounded-md bg-red-50"
        >
          <div
            className="flex items-center justify-center text-sm text-red-700"
            id="error-handler"
            role="alert"
          ></div>
        </div>
        <div>
          <button id="tap-btn">{buttonName}</button>
        </div>
      </form>

      <Script src="https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.3.4/bluebird.min.js" />
      <Script
        src="https://secure.gosell.io/js/sdk/tap.min.js"
        onLoad={() => {
          const tap = window.Tapjsli(
            process.env.NEXT_PUBLIC_TAP_PUBLISHABLE_KEY
          );
          console.log(tap);

          const elements = tap.elements({});

          //create element, pass style and payment options
          const card = elements.create(
            'card',
            { style: style },
            paymentOptions
          );

          //mount element
          card.mount('#element-container');
          //card change event listener
          card.addEventListener('change', function (event) {
            const displayError = document.getElementById('error-handler');
            if (event.error) {
              displayError.textContent = event.error.message;
            } else {
              displayError.textContent = '';
            }
          });

          // Handle form submission
          const form = document.getElementById('form-container');
          form.addEventListener('submit', function (event) {
            event.preventDefault();
            const submitButton = document.getElementById('tap-btn');
            submitButton.setAttribute('disabled', true);

            tap.createToken(card).then(async function (result) {
              console.log(result);
              if (result.error) {
                // Inform the user if there was an error
                const errorContainer =
                  document.getElementById('error-container');
                const errorElement = document.getElementById('error-handler');
                errorContainer.style.display = 'block';
                errorElement.textContent = result.error.message;
              } else {
                // Send the token to your server
                // const errorElement = document.getElementById('success');
                // errorElement.style.display = 'block';
                try {
                  await paymentHandler(result.id, result.card.id);
                } catch (e) {
                  // Handle Payment Error Here..
                }
              }
              submitButton.removeAttribute('disabled');
            });
          });
        }}
      />
    </>
  );
};

export default PaymentForm;
