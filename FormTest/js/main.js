$(document).ready(function() {
  Parse.$ = jQuery;
  
  Parse.initialize("vNGHN5aZTRjQxsuFV4cX4ZTIVCFHRlCJKQm0O6Qy", "JzDD3z7R0H7JsLezVM70t9rMnETN3YxAtQczlMEi");
  
  //------
  //Models
  //------
  
  var Form = Parse.Object.extend("Form");
  var form = new Form();
  
  var nameInputField = document.getElementById("nameInput");
  var addressInputField = document.getElementById("addressInput");
  var phoneInputField = document.getElementById("phoneInput");
  var number = document.getElementById("phoneInput");
  var emailInputField = document.getElementById("emailInput");
  var imageInputField = document.getElementById("imageInput");

  var submitValues = document.getElementById('submitBtn');
  submitValues.onclick = function() {
    form.set("name", nameInputField.value);
    form.set("address", addressInputField.value);
    form.set("phone", number.value);
    form.set("email", emailInputField.value);
    
    form.save(null, {
      success: function(form) {
        //Execute any logic
        alert('New Form object was created!');
        
        addressInputField.value = "";
        number.value = "";
        emailInputField.value = "";
        imageInputField.value = "";
      },
      
      error: function(form, error) {
        //Execute any logic
        //Error is a Parse.Error with an error code & message
        alert('Failed to create a new Form object, with error code ' + error.message);
      }
    }); 
  }
  
//  var imageUpload = document.getElementById('imageUpload');
//  imageUpload.onclick = function() {
//    alert('test function worked');
    function saveImage(objParseFile) {
      var profileImage = new Parse.Object("ProfileImage");
      profileImage.set("name", nameInputField.value);
      profileImage.set("profileImg", objParseFile);
      profileImage.save(null, {
        success: function(profilePic) {
          //Execute any logic
          console.log('New image object saved');
          var photo = profilePic.get("profileImg");
          $("#profileImg") [0].src = photo.url();
          
        },
        
        error: function(profilePic, error) {
          //Execute any logic
          //error is a Parse.Error with an error code and description
          alert('Failed to save image, with error code: ' + error.description);
        }
        
      });
    }
      
      $('#imageInput').bind("change", function(e) {
        var fileUploadControl = $('#imageInput') [0];
        var file = fileUploadControl.files[0];
        var name = file.name;
        var parseFile = new Parse.File(name, file);
        
        parseFile.save().then
        (function() {
          saveImage(parseFile);
    
          nameInputField.value = "";
        },
        function(error) {
          alert('error');
        }
        );
      });
//  }
  
  //-----------
  //Collections
  //-----------
  
  var FormList = Parse.Collection.extend({
    model: Form,
  });
  
  //-----
  //Views
  //-----
  
  var FormView = Parse.View.extend({
    
  });
  
  //-------
  //Routers
  //-------
});