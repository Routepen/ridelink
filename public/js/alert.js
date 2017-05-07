function successAlert(message){
  $("#bootstrap-alert").html('<div class="alert alert-success" style="margin-bottom:0"><button type="button" class="close">×</button>' + message + '</div>');
   window.setTimeout(function() {
         $(".alert").fadeTo(500, 0).slideUp(500, function(){
             $(this).remove();
         });
     }, 3000);
   $('.alert .close').on("click", function(e){
         $(this).parent().fadeTo(500, 0).slideUp(500);
      });
}

function dangerAlert(message){
  $("#bootstrap-alert").html('<div class="alert alert-danger" style="margin-bottom:0"><button type="button" class="close">×</button>' + message + '</div>');
   window.setTimeout(function() {
         $(".alert").fadeTo(500, 0).slideUp(500, function(){
             $(this).remove();
         });
     }, 3000);
   $('.alert .close').on("click", function(e){
         $(this).parent().fadeTo(500, 0).slideUp(500);
      });
}

function infoAlert(message){
  $("#bootstrap-alert").html('<div class="alert alert-info" style="margin-bottom:0"><button type="button" class="close">×</button>' + message + '</div>');
   window.setTimeout(function() {
         $(".alert").fadeTo(500, 0).slideUp(500, function(){
             $(this).remove();
         });
     }, 3000);
   $('.alert .close').on("click", function(e){
         $(this).parent().fadeTo(500, 0).slideUp(500);
      });
}
