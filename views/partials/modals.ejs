function showFBModal() {
  $('#selfLink').html(window.location.hostname + "/route?id=<%= routeData.shortId || routeData._id %>");
  $('#selfLink')[0].href =  "/route?id=<%= routeData.shortId || routeData._id %>&view=rider";
  $("#facebookModal").modal('toggle');
  $('#facebookModal').on('hidden.bs.modal', showAvaliableModals);

  function test() {
    var node = document.getElementById("contentEditableMessageDiv");
    node.focus();
    var textNode = node.firstChild;
    var caret = 10;
    var range = document.createRange();
    range.setStart(textNode, caret);
    range.setEnd(textNode, caret);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  setTimeout(test, 500);
}

function showPaymentConfirmed() {
  $("#paymentConfirmed").modal('show');
  window.history.pushState('RoutePen', 'RoutePen', '/route?id=<%= routeData.shortId || routeData._id %>');
  $('#paymentConfirmed').on('hidden.bs.modal', showAvaliableModals);
}

function showsetUpPaymentModal() {
  $("#setUpPaymentModal").modal('toggle');
  $('#setUpPaymentModal').on('hidden.bs.modal', showAvaliableModals);
};

function showPaymentModal() {
  $("#paymentModal").modal('toggle');
}

modals = [];
<% if (isDriver && !user.paymentSetup && routeData.requireInitialDeposit && view != "rider") { %>
  modals.push(showsetUpPaymentModal);
<% } %>
<% if (!opened && isDriver && view != "rider") { %>
  modals.push(showFBModal);
<% } %>
<% if (paymentConfirmed) { %>
  modals.push(showPaymentConfirmed);
<% } %>

<% if (action == "pay" && isRider) { %>
  setTimeout(showPaymentModal, 300);
<% } %>


function showAvaliableModals() {
  if (modals.length > 0) {
    modals[0].call();
    modals.splice(0, 1);
  }
}

showAvaliableModals();
