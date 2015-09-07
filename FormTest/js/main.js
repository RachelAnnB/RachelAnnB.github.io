/*jslint browser: true, devel: true*/
$(document).ready(function () {
  Parse.$ = jQuery;

  Parse.initialize("vNGHN5aZTRjQxsuFV4cX4ZTIVCFHRlCJKQm0O6Qy", "JzDD3z7R0H7JsLezVM70t9rMnETN3YxAtQczlMEi");

  //------
  //Models
  //------

  var Form = Parse.Object.extend("Form");
  //var form = new Form();
  
/*  //This should show the currently logged in user, needs fixed
  function checkLogin () {
    if (Parse.User.current) {
      console.log('Logged in!' + Parse.User.current().get('name'));
    }
    
    else if (Parse.User.current) {
      console.log('the else if statement fired');
    }
    
    else {
      console.log('Not logged in!');
    }
  }
  
  checkLogin();*/
  
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
    //var user = Parse.User.current();
    
    var newForm = new Form();
    newForm.set("name", nameInputField);
    newForm.set("address", addressInputField);
    newForm.set("phone", number);
    newForm.set("email", emailInputField);
    //newForm.set("user", user);
    
    newForm.save({
      success: function () {
        console.log('The info was successfully retrieved!');
      },
      
      error: function (error) {
        console.log('Error: ' + error.message);
      }
    });
    
    //This is where the info is being pulled & then shown in the html
    console.log('Your info is being retrieved.');
    var query = new Parse.Query(Form);
    
    //query.include("user");
    
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
          
          output += "<li>";
          //output += "<h4>" +username+ "</h4>";
          output += "<h2>" +name+ "</h2>";
          output += "<p>" +address+ "</p>";
          output += "<p>" +phone+ "</p>";
          output += "<p>" +email+ "</p>";
          output += "</li>";
        }
        
        $("#list-forms").html(output);
        
        name.value = "";
        address.value = "";
        phone.value = "";
        email.value = "";
      },

      error: function (error) {
        console.log('There was a problem with retrieving your info. Error: ' + error.message);
      }
      });
    
  };

  function saveImage(objParseFile) {
    var profileImage = new Parse.Object("ProfileImage");
    profileImage.set("name", nameInputField.value);
    profileImage.set("profileImg", objParseFile);
    profileImage.save(null, {
      success: function (profilePic) {
        //Execute any logic
        console.log('New image object saved');
        var photo = profilePic.get("profileImg");
        $("#profileImg")[0].src = photo.url();
        
        imageInputField.value = "";
      },

      error: function (profilePic, error) {
        //Execute any logic
        //error is a Parse.Error with an error code and description
        alert('Failed to save image, with error code: ' + error.description);
      }
    });
  }

  $('#imageInput').bind("change", function (e) {
    var fileUploadControl = $('#imageInput')[0];
    var file = fileUploadControl.files[0];
    var name = file.name;
    var parseFile = new Parse.File(name, file);

    parseFile.save().then
    (function () {
      saveImage(parseFile);
    },
     function (error) {
      alert('error');
    }
    );
  });
  
  
  
  //-----------
  //Collections
  //-----------

  var FormList = Parse.Collection.extend({
    model: Form
  });

  //-----
  //Views
  //-----

  //Forms
  var FormView = Parse.View.extend({
    tagName: "li",
    template: _.template($('#formViewTemplate').html()),

    initialize: function (options){
      if (!(options && options.model))
        throw new Error("model is not specified");

      this.model.on("change", this.render, this);
    },

    render: function () {
      //this sets the li's id attribute to the model's id
      this.$el.attr("id", this.model.id);
      $(this.el).html(this.template({
        "photo_url" : this.model.photoUrl(),
        "display_name" : this.model.displayName()
      }));

      return this;
    }
  });

  /*Recently Added Forms
  var RecentFormsView = Parse.View.extend({
    //Cache the template function for a single item
    formsTemplate: _.template($('#recentFormTemplate').html()),

    initialize: function () {
      var self = this;
      _.bindAll(this, 'addOne', 'addAll', 'render');

      this.$el.html(this.formsTemplate);

      //Create our collection of forms
      this.forms = new FormList();

      //Only show photos uploaded by me
      var userQuery = new Parse.Query(Parse.User);
      userQuery.containedIn("objectId", ["fTy19F7TMi", "RdjzMgKaQV", "zRwFjLhqlV", "5cD60MuVEE", "ZNcwbQwEhG", "42akJqaASJ", "lEPQ0nsHIO", "FXNvDAk5JL"]);
      this.forms.query = new Parse.Query(Form);
      this.forms.query.include("user");
      this.forms.query.matchesQuery("user", userQuery);

      this.forms.query.limit(5);
      this.forms.query.descending("createdAt");

      this.forms.bind('add', this.addOne);
      this.forms.bind('reset', this.addAll);
      this.forms.bind('all', this.render);

      //Fetch all the items for this user
      this.forms.fetch();
    },

    render: function () {
      this.$("#form-list").fadeIn();
      this.delegateEvents();
      return this;
    },

    addOne: function (form) {
      var view = new FormView({model: form});
      this.$("#form-list").append(view.render().el);
    },

    //Add all items in the collection at once
    addAll: function (collection, filter) {
      this.forms.each(this.addOne);
    }
  });*/

  //-----
  //Users
  //-----

  var currentUser = Parse.User.current();
  if (currentUser) {    
    Parse.User.logOut();
  }
  
  //-------
  //Routers
  //-------

  //Start Backbone History
  Backbone.history.start();
});