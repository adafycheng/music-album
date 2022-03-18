# Music Album

> Build a Web Site listing my favourite song using node.js.

![Music Album Web Site Screenshot](images/music-album-vercel.png)

## Live Demo

Available at the following hosting platforms:
1. Node.js hosted at [Vercel](https://music-album-liart.vercel.app)

## Development

1. Install the libraries.

    ```bash
    npm install --save js-yaml`

    npm install jsdom`

    npm install bootstrap`
    ```

2. Modify source code /src/app.js.

3. Start the application locally.
    ```sh
    node app.js
    ```

4. Verify by opening the following URL in broswer.
    ```sh
    http://localhost:3000
    ```

## Deployment

1. To deploy serverless function in Vercel, add a vercel.json in root directory of the project.

    ```json
    {
     "version": 2,
     "name": "music-album",
     "builds": [
       { "src": "app.js", "use": "@vercel/node" }
     ],
     "routes": [
       { "src": "/(.*)", "dest": "/app.js" }
     ]
    }
    ```

2. Commit the source code to GitHub.

3. Create a project in Vercel.  Configure the project by importing the GitHub project.

4. Deploy the project.


## Acknowledgements

1. [Deploy Node.js application to Vercel in 5 minutes](https://blog.adafycheng.dev/deploy-nodejs-application-to-vercel-in-5-minutes).
