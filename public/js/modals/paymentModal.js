<div class="modal fade" id="paymentModal" tabindex="-1" role="dialog" aria-labelledby="paymentModal">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Modal for paying</h4>
      </div>
      <div class="modal-body">
        <!-- <form id="checkout-form" action="/checkout" method="post">
          <div id="error-message"></div>

          <label for="card-number">Card Number</label>
          <div class="hosted-field" id="card-number"></div>

          <label for="cvv">CVV</label>
          <div class="hosted-field" id="cvv"></div>

          <label for="expiration-date">Expiration Date</label>
          <div class="hosted-field" id="expiration-date"></div>

          <input type="hidden" name="payment_method_nonce">
          <input type="hidden" name="amount">
          <input type="hidden" name="routeId" value="<%= routeId %>">
          <input id="payButton" type="submit" value="Pay $10" disabled>
        </form> -->
        <div class="panel panel-default bootstrap-basic">
          <div class="panel-heading" id="checkout">
            <h3 class="panel-title">Enter Card Details</h3>
          </div>
          <form id="checkout-form" class="panel-body">
            <div class="row">
              <div class="form-group col-xs-8">
                <label class="control-label">Card Number</label>
                <!--  Hosted Fields div container -->
                <div class="form-control" id="card-number"></div>
                <span class="helper-text"></span>
              </div>
              <div class="form-group col-xs-4">
                <div class="row">
                  <label class="control-label col-xs-12">Expiration Date</label>
                  <div class="col-xs-6">
                    <!--  Hosted Fields div container -->
                    <div class="form-control" id="expiration-month"></div>
                  </div>
                  <div class="col-xs-6">
                    <!--  Hosted Fields div container -->
                    <div class="form-control" id="expiration-year"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="form-group col-xs-6">
                <label class="control-label">Security Code</label>
                <!--  Hosted Fields div container -->
                <div class="form-control" id="cvv"></div>
              </div>
              <div class="form-group col-xs-6">
                <label class="control-label">Zipcode</label>
                <!--  Hosted Fields div container -->
                <div class="form-control" id="postal-code"></div>
              </div>
            </div>

            <input type="hidden" name="payment_method_nonce">
            <input type="hidden" name="amount">
            <input type="hidden" name="routeId" value="<%= routeId %>">
            <button value="submit" id="payButton" class="btn btn-success btn-lg center-block">Pay with <span id="card-type">Card</span></button>
          </form>
        </div>

        <!-- Load the Client component. -->
        <script src="https://js.braintreegateway.com/web/3.11.0/js/client.min.js"></script>

        <!-- Load the Hosted Fields component. -->
        <script src="https://js.braintreegateway.com/web/3.11.0/js/hosted-fields.min.js"></script>

        <script>
        // We generated a client token for you so you can test out this code
        // immediately. In a production-ready integration, you will need to
        // generate a client token on your server (see section below).
        $.get('/client_token', function(authorization) {
          var submit = document.getElementById('payButton');
          var form = document.getElementById('checkout-form');

          console.log("going");
          braintree.client.create({
            authorization: authorization
          }, function (clientErr, clientInstance) {
            console.log("called");
            if (clientErr) {
              console.log(clientErr);
              return;
            }

            braintree.hostedFields.create({
              client: clientInstance,
              styles: {
                'input': {
                  'font-size': '14pt'
                },
                'input.invalid': {
                  'color': 'red'
                },
                'input.valid': {
                  'color': 'green'
                }
              },
              fields: {
                number: {
                  selector: '#card-number',
                  placeholder: '4111 1111 1111 1111'
                },
                cvv: {
                  selector: '#cvv',
                  placeholder: '123'
                },
                expirationDate: {
                  selector: '#expiration-year',
                  placeholder: '2019'
                },
                expirationDate: {
                  selector: '#expiration-month',
                  placeholder: '10'
                }
              }
            }, function (hostedFieldsErr, hostedFieldsInstance) {
              console.log("called 2");
              if (hostedFieldsErr) {
                console.log(hostedFieldsErr);
                // Handle error in Hosted Fields creation
                return;
              }
              console.log("submit", submit);
              submit.removeAttribute('disabled');

              form.action = "/checkout";
              form.method = "post";
              form.addEventListener('submit', function (event) {
                event.preventDefault();

                hostedFieldsInstance.tokenize(function (tokenizeErr, payload) {
                  if (tokenizeErr) {
                    // Handle error in Hosted Fields tokenization
                    return;
                  }

                  // Put `payload.nonce` into the `payment_method_nonce` input, and then
                  // submit the form. Alternatively, you could send the nonce to your server
                  // with AJAX.
                  console.log('nonce', payload.nonce);
                  document.querySelector('input[name="payment_method_nonce"]').value = payload.nonce;
                  document.querySelector('input[name="amount"]').value = "10";
                  form.submit();
                });
              }, false);
            });
          });
        });
        </script>

      </div>
      <div class="modal-footer">
        <input type="submit" class="btn btn-primary" data-dismiss="modal" value="Done">
      </div>
    </div>
  </div>
</div>
