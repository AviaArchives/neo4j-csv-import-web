var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    hbs = require('hbs'),
    _ = require("lodash"),
    routes = require('./routes/index'),
    CypherBuilder = require('./lib/buildCypher');


// FIXME: move to helpers lib
// http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
}

// FIXME: move hbs helpers to separate module
// Handlebars helpers

// strip
hbs.registerHelper("stripstr", function(str) {
  // FIXME: probably need a bit more logic here
  return str.split('.').join("");
});

// build HTML for /preview/:filename
hbs.registerHelper("previewTable", function(fields, data) {
  var rows = "";

  // build header
  var row = "<tr>";
  _.forEach(fields, function(field) {
    row += "<th>" + field + "</th>";
  });
  row += "</tr>";
  rows += row;

  _.forEach(data, function(obj) {
    row = "<tr>";
    _.forEach(fields, function(field) {
      row += "<td>" + obj[field] + "</td>";
    });
    row += "</tr>";
    rows += row;
  });

  return new hbs.SafeString(rows);
  // append rows
});

hbs.registerHelper("datamodelTable", function(filename, fileData, configData) {

    var rows = "";


    _.forEach(fileData[filename]['meta']['fields'], function(field) {
        var row = '<tr>';
        row += '<td>' + field + '</td>';
        row += '<td><label><input type="text" name="' + filename + '-' + field + '-rename"></label></td>';
        row += '<td><label><input type="checkbox" name="' + filename + '-' + field + '-include"></label></td>';
        row += '<td><label><input type="checkbox" name="' + filename + '-' + field + '-pk"></label></td>';
        row += '<td><label><select><option value="---">---</option></select></label></td>';
        row += '<td><label><input type="checkbox" name="' + filename + '-' + field + '-index"></label></td>';
        row += '<td><button type="button" class="btn btn-sm">---</button></td>';
        row += '</tr>';
        rows += row;
    });

    return new hbs.SafeString(rows);

});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// express-session
app.use(session({
  genid: guid,
  secret: 'ljalsjdflj824aflj#$lkajd',
  resave: false,
  saveUninitialized: true
}));

// Routes here
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;