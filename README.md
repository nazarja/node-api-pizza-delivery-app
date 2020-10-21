## Raw Node JS API for a pizza delivery company
- No frameworks or dependencies. just node.js

</br>   

Part of Node.js Master Class homeworrk assignment #2

</br>   

### DESCRIPTION

</br>

As a user, you can:
- create, read, update, delete a user
- login and logout - tokens will automatically be created and destroyed
- get a list of menu items
- create, read, update, delete items to a shopping cart
- create an order
- perform a checkout via stripe https request
- recieve payment receipt via mailgun https request

Data is stored in json format for all data operations in the `.data` dir. The `lib/data` module performs file operations via the `fs` module. Once every 24hrs tokens are automatically deleted via a scheduled worker to tidy and manage files.

Passwords when stored are hashed with the `crypto` module, payments via stripe are using test data only, only the stripe card token needs to be provided, ie `tok_visa` fro a visa card.

You can choose environments by entering `NODE_ENV=staging node index.js or NODE_ENV=production node index.js`

- HTTP can be accessed on port `3000` and `5000`;
- HTTPS can be accessed on port `3001` and `5001`;

The tokens route is restricted to internal code only, when user actions are performed, the token will be automatically created, updated or deleted.

To get started you must first:\
Create a new user via `users POST`, then you must proceed to login via `auth.login POST`, this will return a token that is valid for 24hrs, the token must be included in all requests in the header as a key:value pair `token: value`. From that point on, you may make use of the rest of the api.

</br>   

### STRUCTURE  

</br>

| directory | files/subdir                            | purpose                                                                 |
|-----------|-----------------------------------------|-------------------------------------------------------------------------|
| .data     | menu, orders, tokens, users             | stores data in json format                                              |
| api       | auth, cart, menu, orders, tokens, users | api routes crud and logic                                               |
| config    | get, post, put, delete                  | config options for server, mailgun / stripe api                         |
| https     | cert.pem, key.pem, openssl-bash.sh      | contains https certificate, and bash script to generate                 |
| lib       | data, helpers, workers                  | file crud operations, various helper functions, automatic file deletion |
| server    | router, server                          | router redirect object, server request object                           |
| templates | email.html                              | email html template                                                     |
| notfound  | 404                                     |                                                                         |                                                                       |
</br>   

### API ROUTES

</br>   

| routes      | methods                | additional functions   |
|-------------|------------------------|------------------------|
| auth/login  | post                   | login                  |
| auth/logout | post                   | logout                 |
| user        | get, post, put, delete |                        |
| tokens      | get, post,put, delete  |                        |
| cart        | get, post,put, delete  |                        |
| orders      | get, post              |                        |
| menu        | get                    |                        |
| ping        | 200                    |                        |
| notfound    | 404                    |                        | 

</br> 

### USAGE

</br> 

~ All routes `[ except: auth.login ]` require token set in headers as `{'token': string: length=20}`

</br> 

### auth
- auth.login POST: creates new token for users\
payload: `{'email': string, 'password': string }`

- auth.logout POST: deletes user token\
payload: `None`

### users
- users.get GET: gets user details\
payload: `{'email': string}`

- users.post POST: creates new user\
payload: `{ name: string, email: string, address: string, password: string }`

- users.put PUT: updates user details\
payload: `{ name: string || (required) email: string || address: string ||password: string }`

- users.delete DELETE: deletes user and users orders\
payload: `{'email': string, password: string }`

### cart
- cart.get GET: gets items in users cart\
payload: `{'email': string, password: string }`

- cart.post POST: add item to user cart\
payload: `{'id': integer }`

- cart.put PUT: updates quantity of an item in users cart\
payload: `{'id': integer }`

- cart.delete DELETE: deletes all items from users cart\
payload: `{'id': integer }`

### orders
- orders.get GET: gets all users previous orders\
payload: `None`

- orders.post POST: charges customer card, sends mail, adds order to user profile, clears cart\
payload: `{ 'email': string , 'password': string , 'stripeToken': string }`

### menu
- menu.get GET: returns a list of hard coded menu items.
payload: `None`

### other
- ping : payload: `None`
- notfound : payload: `None`