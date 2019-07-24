"Set custom layout in terminator with custom commands"

## Introduction ##

Terminator is a useful tool for arranging terminals.

You can split your terminal horizontally and vertically as much as you want, as well as setup groups and then broadcast commands simultaneously into them and execute them.

For terminator installation check out this : [Terminator Introduction and Installation ](https://gnometerminator.blogspot.com/p/introduction.html ) 
 


In today tutorial we will be:
1.  setting up a custom layout for terminator, 
2. we will add some custom commands that will run inside of each terminal
3. Wrap it up in linux command to run it automatically as well


## Setting up a custom layout ##


First create your desired layout manually
1. open terminator

#TODO - add images
2, create desired layout
3. right click -> preferences -> in layout tab click add.
4. close

## Add custom commands inside of each terminal ##



To setup individual commands to be run at each window , you can do it here. 

In this tutorial we will setup two layouts.

### Layout mem_vm ###

 (layout "mem_vm" this will create memory monitoring layout, with two terminals showing free command, two terminals showing top command in order of memory, for local server on the elft side and for ssh-ed server on the right side)

### Layout ssh_vm ###

(layout "ssh_vm" will open three windows with different group names , ssh into them) :

Open terminator's config file. 
I use nano (don't get angry), but you can use any command line text editor.

`~$ nano ~/.config/terminator/config`


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


## Wrap it up in command ##
you can wrap it in bashrc as well:

alias mem_vm='terminator -l mem_vm -p default'
source ~/.bashrc

and then just call it commmand line like: 

`~$ mem_vm `
