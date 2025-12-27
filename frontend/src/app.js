const express = require('express');
const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT;

app.use(cookieParser());
const { AuthMiddleware } = require("./middleware/AuthMiddleware");

console.log(__dirname)

// Add partials support for handlebars
app.engine('hbs', handlebars.engine({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/static/templates/layouts',
  partialsDir: __dirname + '/static/templates/partials'
}));

app.set('view engine', 'hbs');
app.set('views', __dirname + '/static/templates');

// Designate the static folder as serving static resources
app.use(express.static(__dirname + '/static'));

app.use(AuthMiddleware);

app.get('/', (req, res) => {
    res.render('home', {title: 'TapeTrack', logo:true});
})

app.get('/register', (req, res) => {
    res.render('register', {title: 'Register'});
})

app.get('/login', (req, res) => {
    res.render('login', {title: 'Log in'});
})

app.get('/search', (req, res) => {
  const query = req.query.album ? req.query.album : "";
  res.render('albumSearch', { title: 'Search for Albums', search: true, query });
});

app.get('/albums/:albumId', (req, res) => {
  res.render('albumView', { title: 'Viewing Album', albumId: req.params.albumId });
});

app.get('/albums/:albumId/reviews', (req, res) => {
  res.render('albumReviews', { title: 'Reviews', albumId: req.params.albumId });
});

app.get('/reviews/add', (req, res) => {
  const query = req.query.album ? req.query.album : "";
  res.render('addReview', { title: 'Add Review for Album', search:true, query });
});

app.get('/reviews/add/:albumId', (req, res) => {
  res.render('addReview', { title: 'Add Review for Album', albumId: req.params.albumId, search:true });
});

app.get('/groups', (req, res) => {
  res.render('groups', { title: 'View your Groups' });
});

app.get('/groups/search', (req, res) => {
  res.render('groupSearch', { title: 'Search for Groups' });
});

app.get('/groups/new', (req, res) => {
  res.render('groupNew', { title: 'Create a Group' });
});
  
app.get('/groups/:groupId', (req, res) => {
  res.render('groupView', { title: 'Group: ' + req.params.groupId, groupId: req.params.groupId });
});

app.get('/groups/:groupId/chat', (req, res) => {
  res.render('groupChat', { title: 'Group: ' + req.params.groupId, groupId: req.params.groupId });
});

app.get('/profile', (req, res) => {
  res.render('profile', { title: "My Profile", profile: true });
});

// app.get('/users/:userId', (req, res) => {
//   res.render('user', { title: 'Profile', userId: req.params.userId });
// });

app.get('/users/:userid/lists', (req, res) => {
  res.render('userListsAll', { title: 'Your Lists', userId: req.params.userid, listId: req.query.list });
});

// app.get('/users/:userid/lists/:listid', (req, res) => {
//   res.render('userList', { title: '', userId: req.params.userid, listId: req.params.listid });
// });

app.get('/users/:userid/reviews', (req, res) => {
  res.render('userReviews', { title: 'User Reviews', userId: req.params.userid });
});

app.get('/settings', (req, res) => {
  res.render('userSettings', { title: 'Settings' });
});

app.get('/settings/:setting', (req, res) => {
  res.render('userSettingsDetailed', { title: 'Settings', setting:req.params.setting });
});

app.get('/offline', (req, res) => {
  res.render('offlineError', { title: "Offline", layout: 'offline' });
});

// As our server to listen for incoming connections
app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));