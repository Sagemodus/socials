var admin = require("firebase-admin");


var serviceAccount = require("./procon-14ef5-firebase-adminsdk-nmd71-7131b1ec7a.json");  // eslint-disable-line

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// This registration token comes from the client FCM SDKs.
const registrationToken =
  "ev9KgQYvJ9GaICb0FtS_w2:APA91bEsc7J9PYsORXygzsLYeE9Fai-d_hAt-Wxn7vaNQTmGALikkeTOVI-R40j4haCXjDFUbR9xuoETR0rEiQjKB90RRhd3yQkjgRQh8TfwcC7_DFmH-kw9V0O4LWymDDxgoDqway3p";

const message = {
    notification: {
        title: " I am Admin",
        body: "Hello homie"
  },  
  webpush: {
    fcmOptions: {
      link: '/?breakingnews'
    }
  },
  token: registrationToken
};

// Send a message to the device corresponding to the provided
// registration token.
admin.messaging().send(message)
  .then((response) => {
    // Response is a message ID string.
    console.log('Successfully sent message:', response);
  })
  .catch((error) => {
    console.log('Error sending message:', error);
  });