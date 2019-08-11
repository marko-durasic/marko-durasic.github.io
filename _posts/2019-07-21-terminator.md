
Terminator is a useful tool for arranging terminals.

You can split your terminal horizontally and vertically as much as you heart desires, as well as setup groups and then broadcast commands simultaneously.

For terminator installation check out this : [Terminator Introduction and Installation ](https://gnometerminator.blogspot.com/p/introduction.html ) 
 
## Custom layout with commands ##

In today's tutorial we will be doing the following:

1. **Setting up a custom layouts for terminator,**
2. **Add some commands that will run inside of each terminal**
3. **Wrap it up in a linux command to run it automatically**


### Setting up a custom layout ###


Open terminator terminal and split it horizontally and vertically into a desired layout. 

We are creating two layouts called. 
One is called mem_vm and other one is called ssh_vm. 

#### Layout mem_vm ####

 In thiis layout we will create a memory monitoring layout, with:
  - two terminals showing `free` command, 
  - two terminals showing top command in order of memory, for local server on the left side and for ssh-ed server on the right side

![alt text](/assets/images/image1.png "Layout 1")


#### Layout ssh_vm ####

In this layout we will:
- open two windows with different group names 
- and ssh into them

![alt text](/assets/images/image2.png "Layout 2")

#### Add layout ####
After that, right click anywhere in terminator and choose preferences and in `Layouts` tab click add.

![alt text](/assets/images/layout-preferences.png "Layout Preferences")

You can name your layout respectively mem_vm and ssh_vm:

![alt text](/assets/images/layout-preferences1.png "Layout Preferences 1")


Now you can close your terminator completely. 

### Add custom commands inside of each terminal ###

To setup individual commands to be run at each window , you can do it in:

`~/.config/terminator/config` 

Open terminator's config file. 
I use nano (don't get angry), but you can use any command line text editor you like.

`~$ nano ~/.config/terminator/config`


First we will add commands for our `mem_vm` layout, so find that section:


```
  [[mem_vm]]
    [[[child0]]]
      fullscreen = False
      last_active_term = f5dcc77b-02d0-46e7-bf3e-6115bba91ddd
      last_active_window = True
      maximised = True
      order = 0
      parent = ""
      position = 31:24
      size = 1280, 696
      title = ddjura@ddjura-Inspiron-3459: ~
      type = Window
    [[[child1]]]
      order = 0
      parent = child0
      position = 638
      ratio = 0.500390625
      type = HPaned
    [[[child2]]]
      order = 0
      parent = child1
      position = 174
      ratio = 0.253591954023
      type = VPaned
    [[[child5]]]
      order = 1
      parent = child1
      position = 172
      ratio = 0.250718390805
      type = VPaned
    [[[terminal3]]]
      order = 0
      parent = child2
      profile = default
      type = Terminal
      uuid = d560d716-44a4-418a-b57c-3b06485d35bb
    [[[terminal4]]]
      order = 1
      parent = child2
      profile = default
      type = Terminal
      uuid = f5dcc77b-02d0-46e7-bf3e-6115bba91ddd
    [[[terminal6]]]
      order = 0
      parent = child5
      profile = default
      type = Terminal
      uuid = 41339a95-1649-4e00-b717-a46c3f4b623d
    [[[terminal7]]]
      order = 1
      parent = child5
      profile = default
      type = Terminal
      uuid = 43a7086a-8909-432c-a085-1777c2114aef
```

Now lets add these following commands:
  - monitor free memory in local machine
    - `watch 'free -tm'; bash` 
  - monitor memory compsuption in local machine 
    - `top -o %MEM`
  - monitor free memory in remote machine or VM
    - `watch "cd ~/Homestead/ && vagrant ssh -- free -tm"; bash`
  - monitor memory compsuption in remote machine or VM 
    - `cd ~/Homestead/ && vagrant ssh -- -t top -o %MEM`

Find the section called mem_vm and the terminal section and add a holder for comands:


```
   [[[terminal3]]]
      command = 
      order = 0
      parent = child2
      profile = default
      type = Terminal
      uuid = d560d716-44a4-418a-b57c-3b06485d35bb
```

Now fill in the commands:

```
[[[terminal3]]]
      command = watch 'free -tm'; bash
      order = 0
      parent = child2
      profile = default
      type = Terminal
      uuid = d560d716-44a4-418a-b57c-3b06485d35bb
    [[[terminal4]]]
      command = top -o %MEM
      order = 1
      parent = child2
      profile = default
      type = Terminal
      uuid = f5dcc77b-02d0-46e7-bf3e-6115bba91ddd
    [[[terminal6]]]
      command = watch "cd ~/Homestead/ && vagrant ssh -- free -tm"; bash
      order = 0
      parent = child5
      profile = default
      type = Terminal
      uuid = 41339a95-1649-4e00-b717-a46c3f4b623d
    [[[terminal7]]]
      command = cd ~/Homestead/ && vagrant ssh -- -t top -o %MEM
      order = 1
      parent = child5
      profile = default
      type = Terminal
      uuid = 43a7086a-8909-432c-a085-1777c2114aef
```



OLD FILE FOR REFERENCE
```
[global_config]
  suppress_multiple_term_dialog = True
[keybindings]
[layouts]
  [[default]]
    [[[child1]]]
      parent = window0
      profile = default
      type = Terminal
    [[[window0]]]
      parent = ""
      type = Window
  [[example_layout]]
    [[[child0]]]
      fullscreen = False
      last_active_term = 6114c53d-4278-4d73-b53f-822d5632c080
      last_active_window = True
      maximised = True
      order = 0
      parent = ""
      position = 1366:24
      size = 1920, 1056
      title = marko.durasic@itlinww2a:~
      type = Window
    [[[child1]]]
      order = 0
      parent = child0
      position = 957
      ratio = 0.499739583333
      type = HPaned
    [[[child3]]]
      order = 1
      parent = child1
      position = 734
      ratio = 0.697443181818
      type = VPaned
    [[[terminal2]]]
      group = GROUP  1
      order = 0
      parent = child1
      profile = default
      type = Terminal
      uuid = 6114c53d-4278-4d73-b53f-822d5632c080
      command = ssh marko.durasic@emeaprod1
    [[[terminal4]]]
      group = EMEA Prod 2
      order = 0
      parent = child3
      profile = default
      type = Terminal
      uuid = 3b11e264-c738-4751-b492-a38e58e2efbd
      command = ssh marko.durasic@emeaprod2
    [[[terminal5]]]
      group = EMEA Prod Redis
      order = 1
      parent = child3
      profile = default
      type = Terminal
      uuid = c75c7daa-2b42-4ee2-a336-ad144b48c910
      command = ssh marko.durasic@emearedisprod
  [[mem_vm]]
    [[[child0]]]
      fullscreen = False
      last_active_term = 97f9c9b9-7a85-4cf5-b963-800f7ab3d6ae
      last_active_window = True
      maximised = True
      order = 0
      parent = ""
      position = 1366:24
      size = 1920, 1056
      title = marko@marko-acer: ~
      type = Window
    [[[child1]]]
      order = 0
      parent = child0
      position = 957
      ratio = 0.499739583333
      type = HPaned
    [[[child2]]]
      order = 0
      parent = child1
      position = 179
      ratio = 0.171875
      type = VPaned
    [[[child5]]]
      order = 1
      parent = child1
      position = 177
      ratio = 0.169981060606
      type = VPaned
    [[[terminal3]]]
      command = watch 'free -tm'; bash
      order = 0
      parent = child2
      profile = default
      type = Terminal
      uuid = 97f9c9b9-7a85-4cf5-b963-800f7ab3d6ae
    [[[terminal4]]]
      command = top -o %MEM
      order = 1
      parent = child2
      profile = default
      type = Terminal
      uuid = 44a44416-f90e-41fd-942a-94e8b09571d1
    [[[terminal6]]]
      command = watch "ssh vagrant@dev.localdevm2.com free -tm"; bash
      order = 0
      parent = child5
      profile = default
      type = Terminal
      uuid = 7f65bb99-fd14-4aa3-b26b-d198a177a5fa
    [[[terminal7]]]
      command = ssh vagrant@dev.localdevm2.com -t top -o %MEM
      order = 1
      parent = child5
      profile = default
      type = Terminal
      uuid = 827f9ddb-c3ea-45f3-9221-a29cee6f42f3
[plugins]
[profiles]
  [[default]]
    background_color = "#151515"
    background_image = None
    foreground_color = "#cfccc8"


```


then call it like this:
terminator -l mem_vm -p default


### Wrap it up in command ###
you can wrap it in bashrc as well:

alias mem_vm='terminator -l mem_vm -p default'
source ~/.bashrc

and then just call it commmand line like: 

`~$ mem_vm `
