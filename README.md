# Final Team Project

## Tape Track

## Progress Report

### Completed Features

* Group Search
* User registration
* User authentication
* Navigation to Group page from search
* View album
* Album Search
* Navigation to Album page from search
* Create group
* Add album to group
* Join and leave group
* Delete group if owner
* Group chat (with push notifications)
* Review album
* Update album review
* View reviews for an album
* Create new list
* Save album to list
* Remove album from list
* View (and sort) your lists
* View profile
* View/update profile settings
* Offline homepage
* Install application

### Known Issues & Limitations

* Chats could include additional features, such as allowing users to delete messages, adding filters to find groups easier, limiting how many users can join a group, having group settings, etc. Many of these are an issue of scope, which would be a larger concern for a larger scale application.
* The Discogs API is used to fetch album data, which is rate limited to 60 requests per minute. This is a scalability issue that can cause the search functionality to produce an error.
* Backend support exists for allowing users to update their cache settings and deleting their cache, however, currently the frontend doesn't have an implementation for these settings.
* Push notifications can take a moment to arrive.


## Authentication & Authorization

<!-- Describe your authentication and authorization processes. What techniques are you using? What data is being stored where and how? How do you now it's secure? How are you making sure users only access what they are allowed to? -->
When a user logs in, a token is generated that lasts for one hour with a session that expires in 1 hour. This is part of TokenMiddleware on the backend, and it is used in backend routes to prevent unauthorized users from accessing certain endpoints. On the frontend, there is a auth.js script that is run on every page that will redirect an unauthenticated user back to the home page if they try to access any page that is not the home page, login page, register page, album search page, or view albums pages.

There is also AuthorizationMiddleware on the backend that protects certain routes. Within this middleware, there is RequireUser, RequireGroupOwner, RequireGroupMember, and RequireListOwner. For example, only the owner of a group is authorized to delete their group. For all individual user routes, users are only authorized for routes with their user ID. This protects routes from users trying to change other users' data.

## PWA Capabilities

<!-- Describe features available to your users offline, caching strategy, installability, theming, etc. -->
When users are offline, they can view an offline home page that uses cached album data from the home page. The album data is stored in localstorage, and this cache also helps make less API calls to Discogs. The Tape Track application is installable and has a custom logo designed by Marie with multiple sizes. This is used for the favicon, icons, and splash screen. The installed version uses custom theme colors that are used in the application.


## API Documentation

Method | Route                               | Description
------ | ----------------------------------- | ---------
`POST` | `/users/login`                      | Receives an email and password
`POST` | `/users/logout`                     | Log out the current user
`POST` | `/users/register`                   | Creates a new user account and returns the new user object
`GET`  | `/users`                            | Retrieves an array of all active users in the system
`GET`  | `/users/current`                    | Retrieves the current authenticated user info and settings
`GET`  | `/users/:userId`                    | Retrieves a user by its Id
`PUT`  | `/users/:userId/settings`           | Updates a user account
`DELETE` | `/users/:userId`                  | Removes a user account from the system
 | |
`GET`  | `/users/:userId/reviews`            | Retrieves an array of a specific user's reviews
`POST` | `/users/:userId/reviews/:albumId`   | Adds a new album review for a specific user
`PUT`  | `/users/:userId/reviews/:albumId`   | Updates an album review for a specific user
`DELETE` | `/users/:userId/reviews/:albumId` | Remove an album review for a specific user
 | |
`GET`  | `/lists`                            | Retrieves an array of all lists in the system
`POST` | `/lists`                            | Adds a list to the system
`PUT`  | `/lists/:listId`                    | Updates a list in the system
`DELETE` | `/lists/:listId`                  | Removes a list from the system
`GET`  | `/lists/:listId`                    | Retrieves a specific list by its ID
`GET`  | `/lists/:listId/albums`             | Retrieves an array of albums in a list by it's ID
`POST` | `/lists/:listId/albums/:albumId`    | Adds an album by album ID to a list by list ID
`DELETE` | `/lists/:listId/albums/:albumId`  | Removes an album by album ID to a list by list ID
`GET`  | `/users/:userId/lists`              | Retrieves an array of a specific user's lists
 | |
`GET`  | `/users/:userId/groups`             | Retrieves an array of a specific user's groups
`POST` | `/groups/:groupId/users/:userId`    | Add a user to a group
`DELETE` | `/groups/:groupId/users/:userId`  | Remove a user from a group
`POST` | `/groups/:groupId/albums/:albumId`  | Add an album to a group
 | |
`GET`  | `/albums`                           | Retrieves all albums in the database
`POST`  | `/albums`                          | Add an album to the database
`GET`  | `/albums/:albumId`                  | Retrieves an album by its Id
`GET`  | `/albums/hot`                       | Get top 10 most wanted albums released in 2025 from Discogs
`GET`  | `/albums/popular`                   | Get top 10 most owned albums for all time from Discogs
`GET`  | `/albums/search`                    | Perform an album search query through Discogs
`GET`  | `/albums/:albumId/tracks/:trackId`  | Get an album track by its ID
`GET`  | `/albums/:albumId/reviews`          | Retrieves an array of all reviews for a specific album
`PUT`   | `/reviews/:reviewId`               | Updates a review in the system
`DELETE` | `/reviews/:reviewId`              | Removes a review from the system
 | |
`GET`  | `/groups`                           | Retrieves an array of all groups in the system
`POST` | `/groups`                           | Creates a group
`GET`  | `/groups/:groupId`                  | Retrieve a group by its Id
`PUT`  | `/groups/:groupId`                  | Updates a group
`DELETE` | `/groups/:groupId`                | Removes a group
`GET`  | `/groups/:groupId/members`          | Get a group's members/users
`GET`  | `/groups/:groupId/messages`         | Retrieves the message chat for a specific group
`POST` | `/groups/:groupId/messages`         | Adds a message to the chat for a specific group

## Database ER Diagram

![](https://github.com/ncstate-csc-coursework/csc342-2025Fall-TeamE/blob/main/Final/frontend/src/static/images/tapetrack-ER-diagram.png?raw=true)

## Team Member Contributions

#### Marie Schwartz

* Updated the schema for user reviews, lists, and settings
* Frontend implementation for user settings, user reviews, user lists
* Updated mobile styling and rendering for other pages, including view album and add reviews
* Implemented popups for searching for albums on groups pages and for user settings pages 

#### Audrey Fuelleman

* Lists backend implementation
* Backend robustness and error checking
* Frontend error messages
* Backend authorization middleware
* Frontend form validation (register, add review, add group)
* Group frontend/backend connection
* Desktop styling for homepage, group pages, profile, lists, settings, add review, album/group search
* Offline functionality (offline homepage)
* Make application installable
* Group chat functionality (and saving chat to backend)
* Group chat styling

#### Josie Khosravi

* Group chat functionality and frontend
* Group chat notifications

#### Milestone Effort Contribution

<!-- Must add to 100% -->

Milestone   | Marie Schwartz | Audrey Fuelleman | Josie Khosravi
----------- | -------------- | ---------------- | --------------
Proposal    | 34%            | 33%              | 33%
Milestone 1 | 10%            | 50%              | 40%
Milestone 2 | 35%            | 55%              | 10%
Final       | 35%            | 45%              | 20%
----------- | -------------- | ---------------- | --------------
TOTAL:      | 114%           | 183%             | 103%
