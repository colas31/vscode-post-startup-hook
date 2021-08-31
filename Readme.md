# Post startup hook

This extension allows you to run either a default file* or a defined commands at VSCode startup.

## Usage example 
It could be useful when you want to install automatically a private extension once VSCode is starting on a remote host.
You can also set some default configuration for each user on managed laptop or remote server.


## Default file

You have to create a file named **vscode-startup-hook**[.bat / .sh / .exe / .bin] on a specific folder. The extension and location depend of your OS and if want to run the script on local or on a remote server.
 
 ###  Location of the script allowed

#### Locally
 - $HOME_DIR/.vscode   
	 - exemple: `C:\Users\colas\.vscode`
 - $HOME_DIR/.vscode-hook 
	 - exemple: `C:\Users\colas\.vscode-hook`

#### On remote linux host

 - ~/.vscode-server 
 - ~/.vscode-server-insiders
 - ~/.vscode-remote
 -  ~/.vscode-hook

> The extension was not tested on Windows server


### Extensions allowed

 - Windows: .bat / .sh / .exe 
 - Linux/ MAC: .bat / .sh / .exe

> To run a .sh file on Windows user should have installed Git bash for exemple

## Custom commands

You can also configure some custom command to run at each startup.
The configuration should be put in settings.json

    {
	    "hook.postStartup": [
		    "echo first command",
		    "/bin/bash ~/myScript.sh"
	    ]
    }

## Tips

### Install other extension
In your script you can use the command `code` to install a public or private extension. 
Read more about the command `code` on the [official documetation](https://code.visualstudio.com/docs/editor/command-line)

### Run the script/command once
If you want to run the command only once you can either disable to extension or uninstall it at the end of your script or commands, with respectively the following commands:

 - `code --disable-extension colas.post-startup-hook`
 - `code --uninstall-extension colas.post-startup-hook`

### Auto-configure a remote instance
By default VSCode doen't provide any way to configure automatically your local instance. With the following configuration you can install automatically a private extension on your remote SSH instance an let your extension configure it.

 1. Set this configuration in your local VSCode (at the first initialization of VSCode on the remote host, it will install automically this public extension)
```
    "remote.SSH.defaultExtensions": [
        "colas.post-startup-hook"
    ]
```
 2. Exemple of script `~/.vscode-hook/vscode-startup-hook.sh` to create

```
    #!/bin/sh
    curl -o myPrivateExtension.vsix 'https://artifactory/myPrivateExtension.vsix'
    code --install-extension myPrivateExtension.vsix --force
    code --uninstall-extension colas.post-startup-hook
```