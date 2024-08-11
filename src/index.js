// Importing the main app
import app from './app.js'

// Listening to the port of the app
app.listen(app.get('port'), () => {
    console.log(`Server is running on port ${app.get('port')}`);
});
