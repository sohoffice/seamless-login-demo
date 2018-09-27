A demo application that shows how to avoid page reload when authenticating
with 3rd party provider that supports only page redirects.

The idea behind this application is to keep the SPA application running,
establishing a websocket communication channel between the SPA application
and the server, while opening a new browser window that talks to auth provider.
When the user is authenticated, server will notify the SPA application through
the websocket channel. So the SPA application knows who the user is.

Protocols
---------

1. HELO

   Client -> Server.
   This command initiate the process.

2. ACK

   Server -> Client.
   Server acknowledges the HELO command.

3. AUTH

   Client -> Server.
   Request a handle to represent the current process.

4. HANDLE <some handle>

   Server -> Client.
   Return a unique handle id.

5. TOKEN <the auth token>

   Server -> Client.
   When the auth provider confirms the login. Server generates the token
   and send to client.