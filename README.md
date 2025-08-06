# Installation
Make sure you have node js and Angular installed on your machine.

> npm install

# Run

Run the following command:

```bash
ng serve
```

Open the browser: http://localhost:4200/

Try to add a chat message and hit the return button or Send button. If no message directly appears, the socketioxide connection got stuck during the websocket upgrade! Then you can check the logs of the rust application. Waiting for around a minute and the application will recover. You will see it in the Rust logs, after around a minute, the app starts logging again and you can type in messages again in the browser and they instantly appear.

This issue occurs only sometimes. So repeating the mentioned steps and if messages appear in the chat, reload the browser by hitting F5.
