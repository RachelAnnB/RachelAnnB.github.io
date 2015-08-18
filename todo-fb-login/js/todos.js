$(function() {
  Parse.$ = jQuery;
  
  //Initialize Parse with my App & JS keys
  Parse.initialize("jRUEinSI1QYVOLrPPCkUpAiKAe8wQ6PvrveXhr2l", "97mBYxGauI7CApIOv94ZipLmTkhm73qYkmbZrPge");
  
  //--------------
  //Facebook Login
  //--------------
  
  
  //------
  //Models
  //------
  
  //Todo Model
  var Todo = Parse.Object.extend("Todo", {
    defaults: {
      content: "empty todo...",
      done: false
    },
    
    //Ensure each todo created has 'content'
    initialize: function() {
      if (!this.get("content")) {
        this.set({"content" : this.defaults.content});
      }
    },
    
    //Toggle the 'done' state of this todo item
    toggle: function() {
      this.save({done: !this.get("done")});
    }
  });
  
  //This is the transient application state, not persisted on Parse
  var AppState = Parse.Object.extend("AppState", {
    defaults: {
      filter: "all"
    }
  });
  
  //-----------
  //Collections
  //-----------
  
  //Todo Collection
  var TodoList = Parse.Collection.extend({
    model: Todo,
    
    //Filter down the list of all todo items that are finished
    done: function() {
      return this.filter(function(todo){ return todo.get('done'); });
    },
    
    //Filter down the list to only todo items that are still not finished
    remaining: function() {
      return this.without.apply(this, this.done());
    },
    
    //The todos are in sequential order, despite being saved in an unordered list
    //This generates the next order number for new items
    nextOrder: function() {
      if (!this.length) return 1;
      return this.last().get('order') + 1;
    },
    
    //Todos are sorted by their original insertion order
    comparator: function(todo) {
      return todo.get('order');
    }
  });
  
  //-----
  //Views
  //-----
  
  //Todo Item View
  var TodoView = Parse.View.extend({
    tagName: "li",
    template: _.template($('#item-template').html()),
    
    events: {
      "click .toggle" : "toggleDone",
      "dblclick label.todo-content" : "edit",
      "click .todo-destroy" : "clear",
      "keypress .edit" : "updateOnEnter",
      "blur .edit" : "close"
    },
    
    /*The TodoView listens for changes to its model, & re-renders
    Theres a 1:1 correspondence between a Todo & a TodoView in this app,
    so we set a direct reference on the model for convenience*/
    initialize: function() {
      _.bindAll(this, 'render', 'close', 'remove');
    this.model.bind('change', this.render);
    this.model.bind('destroy', this.remove);
    },
    
    //Re-render the contents of the todo item
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      this.input = this.$('.edit');
      return this;
    },
    
    //Toggle the 'done' state of the model
    toggleDone: function() {
      this.model.toggle();
    },
    
    //Switch this view into 'editing' mode, displaying the input field
    edit: function() {
      $(this.el).addClass("editing");
      this.input.focus();
    },
    
    //Close the 'editing' mode, saving changes to the todo
    close: function() {
      this.model.save({content: this.input.val()});
      $(this.el).removeClass("editing");
    },
    
    //Hitting enter, finalizes the edit
    updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    },
    
    //Remove the item, destroy the model
    clear: function() {
      this.model.destroy();
    }
  });
  
  //Application View
  var ManageTodosView = Parse.View.extend({
    statsTemplate: _.template($('#stats-template').html()),
    
    events: {
      "keypress #new-todo" : "createOnEnter",
      "click #clear-completed" : "clearCompleted",
      "click #toggle-all" : "toggleAllComplete",
      "click .log-out" : "logOut",
      "click ul#filters a" : "selectFilter"
    },
    
    el: ".content",
    
    /*At initialization we bind to the relevant events on the 'Todos' collection, when items are added or changed.
    Kick things off by loading any preexisting todos that might be saved to Parse*/
    initialize: function() {
      var self = this;
      _.bindAll(this, 'addOne', 'addAll', 'addSome', 'render', 'toggleAllComplete', 'logOut', 'createOnEnter');
      
      //Main todo management template
      this.$el.html(_.template($("#manage-todos-template").html()));
      
      this.input = this.$("#new-todo");
      this.allCheckbox = this.$("#toggle-all")[0];
      
      //Instance of our Todos collection
      this.todos = new TodoList;
      
      //Setup the query for the collection to look for todos from the current user
      this.todos.query = new Parse.Query(Todo);
      this.todos.query.equalTo("user", Parse.User.current());
      
      this.todos.bind('add', this.addOne);
      this.todos.bind('reset', this.addAll);
      this.todos.bind('all', this.render);
      
      //Fetch all the todo items for this user
      this.todos.fetch();
      
      state.on("change", this.filter, this);
    },
    
    //Logs out the user and shows the login view
    logOut: function(e) {
      Parse.User.logOut();
      window.location.reload(true);
      this.undelegateEvents();
      delete this;
    },
    
    //Re-rendering the App just regreshes the statistics
    render: function() {
      var done = this.todos.done().length;
      var remaining = this.todos.remaining().length;
      
      this.$('#todo-stats').html(this.statsTemplate({
        total: this.todos.length,
        done: done,
        remaining: remaining
      }));
      
      this.delegateEvents();
      this.allCheckbox.checked = !remaining;
    },
    
    //Filters the list based on which type of filter is selected
    selectFilter: function(e) {
      var el = $(e.target);
      var filterValue = el.attr("id");
      state.set({filter: filterValue});
      Parse.history.navigate(filterValue);
    },
    
    filter: function() {
      var filterValue = state.get("filter");
      this.$("ul#filters a").removeClass("selected");
      this.$("ul#filters a#" + filterValue).addClass("selected");
      if (filterValue === "all") {
        this.addAll();
      }
      else if (filterValue === "completed") {
        this.addSome(function(item) { return item.get('done') });
      }
      else {
        this.addSome(function(item) { return !item.get('done') });
      }
    },
    
    //Resets the filters to display all todos
    resetFilters: function() {
      this.$("ul#filters a").removeClass("selected");
      this.$("ul#filters a#all").addClass("selected");
      this.addAll();
    },
    
    //Add a single todo item to the list by creating a view for it, & appending its element to the '<ul>'
    addOne: function(todo) {
      var view = new TodoView({model: todo});
      this.$("#todo-list").append(view.render().el);
    },
    
    //Add all items in the Todos collection at once
    addAll: function(collection, filter) {
      this.$("#todo-list").html("");
      this.todos.each(this.addOne);
    },
    
    //Only adds some todos, based on a filtering funciton that is passed in
    addSome: function(filter) {
      var self = this;
      this.$("#todo-list").html("");
      this.todos.chain().filter(filter).each(function(item) { self.addOne(item) });
    },
    
    //If you hit enter, created a new Todo model
    createOnEnter: function(e) {
      var self = this;
      if (e.keyCode != 13) return;
      
      this.todos.create({
        content: this.input.val(),
        order: this.todos.nextOrder(),
        done: false,
        user: Parse.User.current(),
        ACL: new Parse.ACL(Parse.User.current())
      });
      
      this.input.val('');
      this.resetFilters();
    },
    
    //Clear all done todo items, destroying their models
    clearCompleted: function () {
      _.each(this.todos.done(), function(todo){ todo.destroy(); });
      return false;
    },
    
    toggleAllComplete: function() {
      var done = this.allCheckbox.checked;
      this.todos.each(function (todo) { todo.save({'done': done}); });
    }
  });
  
  //LogIn View
  var LogInView = Parse.View.extend({
    events: {
      "submit form.login-form" : "logIn",
      "submit form.signup-form" : "signUp"
    },
    
    el: ".content",
    
    initialize: function() {
      _.bindAll(this, "logIn", "signUp");
      this.render();
    },
    
    logIn: function(e) {
      var self = this;
      var username = this.$("#login-username").val();
      var password = this.$("#login-password").val();
      
      //the View binds to the submit event for both these forms and logs in or signs up the user
      Parse.User.logIn(username, password, {
        success: function(user) {
          new ManageTodosView();
          self.undelegateEvents();
          delete self;
          
          alert("Congrats! You have logged in successfully!");
        },
        
        error: function(user, error) {
          self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
          self.$(".login-form button").removeAttr("disabled");
          
          alert("Invalid Username or Password. Please try again.");
        }
      });
      
      this.$(".login-form button").attr("disabled", "disabled");
      return false;
    },
    
    signUp: function(e) {
      var self = this;
      var username = this.$("#signup-username").val();
      var password = this.$("#signup-password").val();
    
      //Parse SDK automatically handles the session so the Parse.User.current is always the person that just logged in
      //The ManageTodosView is shown right after login
      Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
        success: function(user) {
          new ManageTodosView();
          self.undelegateEvents();
          delete self;
          
          alert("Congrats! You have successfully signed up!");
        },
        
        error: function(user, error) {
          self.$(".signup-form .error").html(_.escape(error.message)).show();
          self.$(".signup-form button").removeAttr("disabled");
          
          alert("Please enter a valid Username and Password.");
        }
      });
      
      this.$(".signup-form button").attr("disabled", "disabled");
      return false;
    },
    
    render: function() {
      this.$el.html(_.template($("#login-template").html()));
      this.delegateEvents();
    }
  });
  
  //Main App View
  var AppView = Parse.View.extend({
    //Instead of generating a new element, bind to the existing skeleton of the App already present in the HTML
    el: $("#todoapp"),
    
    initialize: function() {
      this.render();
    },
    
    render: function() {
      if (Parse.User.current()) {
        new ManageTodosView();
      }
      else {
        new LogInView();
      }
    }
  });
  
  //-------
  //Routers
  //-------
  
  //App Router
  var AppRouter = Parse.Router.extend({
    routes: {
      "all" : "all",
      "active" : "active",
      "completed" : "completed"
    },
    
    initialize: function(options) {
    },
    
    all: function() {
      state.set({ filter: "all" });
    },
    
    active: function() {
      state.set({ filter: "active" });
    },
    
    completed: function() {
      state.set({ filter: "completed" });
    }
  });
  
  var state = new AppState;
  new AppRouter;
  new AppView;
  Parse.history.start();
  
});