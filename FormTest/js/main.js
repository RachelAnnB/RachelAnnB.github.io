/*jslint browser: true, devel: true*/
$(document).ready(function () {
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
  submitValues.onclick = function () {
    form.set("name", nameInputField.value);
    form.set("address", addressInputField.value);
    form.set("phone", number.value);
    form.set("email", emailInputField.value);

    form.save(null, {
      success: function (form) {
        //Execute any logic
        alert('New Form object was created!');
      },

      error: function (form, error) {
        //Execute any logic
        //Error is a Parse.Error with an error code & message
        alert('Failed to create a new Form object, with error code ' + error.message);
      }
    });

    console.log('The info is being retrieved.');
    var query = new Parse.Query(Form)
    .exists("name")
    .limit(10)
    .descending("createdAt");
    query.find({
      success: function (results) {
        alert('Your info has been retrieved!');

        div = document.getElementById("infoViewTest");
        div.style.display = "block";

        for (var i = 0; i < results.length; i++) {
          //The Parse query was successful in returning a Parse object and now we want to pull the data
          //These variables are calling the Parse columns inside the Parse.Object from inside the query
          var name0 = results[0].get("name");
          var name1 = results[1].get("name");
          var name2 = results[2].get("name");
          var name3 = results[3].get("name");
          var name4 = results[4].get("name");
          var name5 = results[5].get("name");
          var name6 = results[6].get("name");
          var name7 = results[7].get("name");
          var name8 = results[8].get("name");
          var name9 = results[9].get("name");
        }

        //This variable links the html div
        var nameViewItem0 = document.getElementById("nameView0");
        var nameViewItem1 = document.getElementById("nameView1");
        var nameViewItem2 = document.getElementById("nameView2");
        var nameViewItem3 = document.getElementById("nameView3");
        var nameViewItem4 = document.getElementById("nameView4");
        var nameViewItem5 = document.getElementById("nameView5");
        var nameViewItem6 = document.getElementById("nameView6");
        var nameViewItem7 = document.getElementById("nameView7");
        var nameViewItem8 = document.getElementById("nameView8");
        var nameViewItem9 = document.getElementById("nameView9");


        //This displays the html of the infoViewTest div with the info from the Form Object
        nameViewItem0.innerHTML =  name0;
        nameViewItem1.innerHTML =  name1;
        nameViewItem2.innerHTML =  name2;
        nameViewItem3.innerHTML =  name3;
        nameViewItem4.innerHTML =  name4;
        nameViewItem5.innerHTML =  name5;
        nameViewItem6.innerHTML =  name6;
        nameViewItem7.innerHTML =  name7;
        nameViewItem8.innerHTML =  name8;
        nameViewItem9.innerHTML =  name9;

        //Object was retrieved successfully, so the input fields are cleared
        nameInputField.value = "";
        addressInputField.value = "";
        number.value = "";
        emailInputField.value = "";
        imageInputField.value = "";
      },

      error: function (error) {
        alert('There was a problem with retrieving your info.');
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

  /*  var retrieveImages = document.getElementById('imageRetrieve');
  retrieveImages.onclick = function () {
    var Retrieve = Parse.Object.extend("retrieve");
    var query = new Parse.Query(register);
    var self = this;
    var name = this.$("#nameInput").val();
    query.equalTo("name", name);
    query.find({
      success: function (results) {
        alert("Successfully retrieved " + results.length + ".");
        imageURLs = [];
        for (var i = 0; i < results.length; i++) {
          var object = results[i];
          var imageFile = object.get('image');
          var imageURL = imageFile.url();
          $('photoViewTest')[0].src = imageURL;
        },

        error: function (error) {
          alert("Error: " + error.code + " " + error.message);
        }
      },
    });
  }, */

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

  //Recently Added Forms
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
  });

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