const apiRouter = require("express").Router()
const userController = require("./controllers/userController")
const postController = require("./controllers/postController")
const followController = require("./controllers/followController")
const cors = require("cors")

const allowedOrigins = ['http://localhost:3000',
                      'http://localhost:3001',
                      'http://localhost:4000',
                      'http://localhost:8080',
                      'https://backend-for-complexapp.herokuapp.com/',
                      'https://complex-app-react.netlify.app/'
                      ];
apiRouter.use(cors({
  origin: function(origin, callback){

    if(!origin) return callback(null, true); // Allows mobiles and tablets
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not ' +
                'allow access from the Origin you are using.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

apiRouter.get("/", (req, res) => res.json("Hello, if you see this message that means your backend is up and running successfully. Congrats! Now let's continue learning React!"))

// check token to log out front-end if expired
apiRouter.post("/checkToken", userController.checkToken)

apiRouter.post("/getHomeFeed", userController.apiMustBeLoggedIn, userController.apiGetHomeFeed)
apiRouter.post("/register", userController.apiRegister)
apiRouter.post("/login", userController.apiLogin)
apiRouter.get("/post/:id", postController.reactApiViewSingle)
apiRouter.post("/post/:id/edit", userController.apiMustBeLoggedIn, postController.apiUpdate)
apiRouter.delete("/post/:id", userController.apiMustBeLoggedIn, postController.apiDelete)
apiRouter.post("/create-post", userController.apiMustBeLoggedIn, postController.apiCreate)
apiRouter.post("/search", cors(), postController.search);

apiRouter.post("/doesUsernameExist", userController.doesUsernameExist)
apiRouter.post("/doesEmailExist", userController.doesEmailExist)

// profile related routes
apiRouter.post("/profile/:username", userController.ifUserExists, userController.sharedProfileData, userController.profileBasicData)
apiRouter.get("/profile/:username/posts", userController.ifUserExists, userController.apiGetPostsByUsername)
apiRouter.get("/profile/:username/followers", userController.ifUserExists, userController.profileFollowers)
apiRouter.get("/profile/:username/following", userController.ifUserExists, userController.profileFollowing)

// follow routes
apiRouter.post("/addFollow/:username", userController.apiMustBeLoggedIn, followController.apiAddFollow)
apiRouter.post("/removeFollow/:username", userController.apiMustBeLoggedIn, followController.apiRemoveFollow)

module.exports = apiRouter
