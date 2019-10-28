/*jslint browser: true, devel: true*/
$(document).ready(function () {
  Parse.$ = jQuery;

  Parse.initialize("vNGHN5aZTRjQxsuFV4cX4ZTIVCFHRlCJKQm0O6Qy", "JzDD3z7R0H7JsLezVM70t9rMnETN3YxAtQczlMEi");

  //------
  //Models
  //------

  var Form = Parse.Object.extend("Form");
  
  var nameInputField = document.getElementById("nameInput");
  var addressInputField = document.getElementById("addressInput");
  var phoneInputField = document.getElementById("phoneInput");
  var number = document.getElementById("phoneInput");
  var emailInputField = document.getElementById("emailInput");
  var imageInputField = document.getElementById("imageInput");

  var submitValues = document.getElementById('submitBtn');
  submitValues.onclick = function (event) {

    event.preventDefault();
    var nameInputField = $("#nameInput").val();
    var addressInputField = $("#addressInput").val();
    var phoneInputField = $("#phoneInput").val();
    var number = $("#phoneInput").val();
    var emailInputField = $("#emailInput").val();
    var imageInputField = $("#imageInput").val();

    var newForm = new Form();
    newForm.set("name", nameInputField);
    newForm.set("address", addressInputField);
    newForm.set("phone", number);
    newForm.set("email", emailInputField);
    newForm.set("user", Parse.User.current());

    //Here we are getting the file from the input form
    var fileElement = $('#imageInput')[0];
    var filePath = $('#imageInput').val();
    var fileName = filePath.split('\\').pop();

    if (fileElement.files.length > 0) {
      var file = fileElement.files[0];
      var newFile = new Parse.File(fileName, file);

      newFile.save({
        success: function () {
          console.log('File saved successfully');
        },

        error: function (file, error) {
          console.log('File Save Error: ' + error.message);
        }
      }).then(function (theFile) {
        newForm.set("file", theFile);

        newForm.save({
          success: function () {
            console.log('The form was saved with the file.');
          },

          error: function (error) {
            console.log('The form did not save with the file, Error: ' + error.message);
          }
        });

      });
    }
    else {

      newForm.save({
        success: function () {
          console.log('The form was successfully retrieved!');
          
          //This is where the view should refresh, so the newly added form is shown
        },

        error: function (error) {
          console.log('Error: ' + error.message);
        }
      });

    }

    //Here we are calling the objectIds from parse, and setting them as the custom link for the a href tag
    $("#list-forms").on("click", "a", function (event) {
      event.preventDefault();
      var id = $(this).attr("href");
      var query = new Parse.Query(Form);
      query.equalTo("objectId", id);

      query.include("user");

      query.find({success: function (results) {
        
        var name = results[0].get("name");
        var address = results[0].get("address");
        var phone = results[0].get("phone");
        var email = results[0].get("email");
        var user = results[0].get("user");
        var username = results[0].get("username");
        var id = results[0].id;

        //Here we are showing the image in our linked visible form
        var src = "";
        if (results[0].get("file")) {
          src = results[0].get("file").url();
        }

        //Here we are telling the info which div to be shown in
        $("#formLinkUser").html(user);
        $("#formLinkName").html(name);
        $("#formLinkAddress").html(address);
        $("#formLinkPhone").html(phone);
        $("#formLinkEmail").html(email);

        //This assigns the objectId to the data-id in the html
        $("#formLinkInfo").attr("data-id", id);
        $("#formLinkImage").attr("src", src);
        
        //The formLinkInfo div is shown after clicking one of the links
        div = document.getElementById("formLinkInfo");
        div.style.display = "block";
      },

      error: function (error) {
        console.log('Error with linking the ojectId, with ' + error.message);
      }});
    });

    //This is where the info is being pulled & then shown in the html
    console.log('Your info is being retrieved.');
    var query = new Parse.Query(Form);

    //query.include("user");

    query.descending("createdAt");
    query.limit(5);
    query.find({
      success: function (results) {
        console.log('Your info was retrieved successfully!');

        var output = "";

        for (var i in results) {
          var name = results[i].get("name");
          var address = results[i].get("address");
          var phone = results[i].get("phone");
          var email = results[i].get("email");
          //var user = results[i].get("user");
          //var username = user.get("username");

          var id = results[i].id;

          var img = "";
          if (results[i].get("file")) {
            var file = results[i].get("file");
            var url = file.url();
            console.log('url: ' + url);
            img = "<img src'" +url+ "'>";
          }
          else {
            console.log('There was no image selected.');
          }

          output += "<li>";
          //output += "<h4>" +username+ "</h4>";
          output += img;
          output += "<h2><a href='" +id+ "'>" +name+ "</a></h2>";
          output += "</li>";
        }

        $("#list-forms").html(output);
        
      },

      error: function (error) {
        console.log('There was a problem with retrieving your form. Error: ' + error.message);
      }
    });

    //Clear the input fields
    nameInput.value = "";
    addressInput.value = "";
    phoneInput.value = "";
    emailInput.value = "";
    imageInput.value = "";
    
    //The infoView div is shown after clicking submit
    div = document.getElementById("infoView");
    div.style.display = "block";

  };

  //-----------
  //Collections
  //-----------

  var FormList = Parse.Collection.extend({
    model: Form
  });

  //-----
  //Users
  //-----

  var currentUser = Parse.User.current();
  if (currentUser) {
    Parse.User.logOut();
  }

  //Start Backbone History
  Backbone.history.start();
});