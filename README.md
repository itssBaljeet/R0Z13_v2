Overview

Project Name: R0Z13_V2

Description:
R0Z13_V2 is a Discord bot integrated within an Electron application, designed to manage queues and roles within Discord servers. It provides a graphical interface for easy interaction and management, making it ideal for community servers that need automated moderation and user interaction enhancements.
File Structure

/R0Z13_V2
  /.vscode
    - launch.json
  /assets
    /vfx
      - [various visual effects assets]
  /extraResources
    - config.json          # Configuration file for Discord bot settings
  /scripts
    - deploy-commands.js   # Script to deploy Discord slash commands
  /src
    /discord
      /commands
        /utility
          - ping.js        # Responds with pong
          - queue.js       # Command to join the queue
          - server.js      # Server information command
          - user.js        # User information command
      /events
        - interactionCreate.js # Handles Discord interaction creation
        - joinQueue.js         # Handles the 'join-queue' event
        - voiceStateUpdate.js  # Handles voice state updates
      - bot.js            # Initializes the Discord bot
      - queue.js          # Queue management logic
      - roles.js          # Role management logic
    /ipcHandlers
      - queueHandlers.js  # IPC handlers related to queue management
      - roleHandlers.js   # IPC handlers related to role management
      - testHandlers.js   # IPC handlers for testing and miscellaneous interactions
    /main
      - index.js          # Main Electron process entry point
      - windowManager.js  # Manages creation of the Electron window
    /renderer
      /css
        - controller.css  # Styles for the Electron renderer process
      /js
        - controller.js   # Controller logic for the renderer
        - preload.js      # Preload script for Electron
      - controller.html   # HTML for the Electron app's main window
    /utils
      - arrayMapper.js    # Utility to map arrays into other structures
  - .gitignore
  - forge.config.json     # Electron Forge configuration
  - package-lock.json
  - package.json

Key Components

    Main Process (/src/main):
        index.js: The entry point for the Electron main process. This script initializes the main window, sets up IPC handlers, and starts the Discord bot.
        windowManager.js: Responsible for creating and managing the main BrowserWindow instance.

    Renderer Process (/src/renderer):
        controller.html: The main HTML file for the renderer process.
        controller.js: Contains the interactivity and logic for the renderer process.
        preload.js: Script that preloads certain Node.js modules and functionalities into the renderer process.

    Discord Bot (/src/discord):
        bot.js: Initializes and configures the Discord bot client, including setting up event handlers.
        queue.js, roles.js: Modules that handle specific functionalities like queue and role management.
        Events (/events): Contains event handlers for various Discord events like interactionCreate, voiceStateUpdate, and custom events like joinQueue.

    IPC Handlers (/src/ipcHandlers):
        Modules like queueHandlers.js, roleHandlers.js, and testHandlers.js that register IPC handlers for communication between the main and renderer processes.

    Utilities (/src/utils):
        arrayMapper.js: Utility functions to facilitate data transformation and mapping.

    Configuration and Scripts:
        config.json: Central configuration file for the Discord bot (located in /extraResources).
        deploy-commands.js: Script to deploy Discord slash commands to the server.
