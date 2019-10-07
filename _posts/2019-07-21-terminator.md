---
toc: true
comments: true
---
How to set custom layout and add commands.

This tutorial is meant for users of Linux and Terminator (terminal emulator).

# Terminator introduction #

Terminator is a useful tool for arranging terminals.

You can split your terminal horizontally and vertically as much as you heart desires, as well as setup groups and then broadcast commands simultaneously.

For terminator installation check out this : [Terminator Introduction and Installation ](https://gnometerminator.blogspot.com/p/introduction.html ) 
 
# Custom layout with commands #

In today's tutorial we will be doing the following:

1. **Setting up custom layouts for terminator,**
2. **Adding some commands that will run inside of each terminal**
3. **Wraping it all up in one command to run it automatically**

## Setting up a custom layout ##

Open terminator terminal and split it horizontally and vertically into a desired layout (you do this by righ-clicking and selecting split horizontally or vertically). 

We are creating two layouts. 
One is called `mem_vm` and other one is called `ssh_vm`. 

### Layout mem_vm ###

 In thiis layout we will create a memory monitoring layout, with:
  - 2 terminals showing `free` command, 
  - 2 terminals showing `top` command in order of memory, for local server on the left side and for ssh-ed server on the right side

Layout would look something like this:
![alt text](/assets/images/image1.png "Layout 1")

### Layout ssh_vm ###

In this layout we will:
- open two windows with different group names 
- and ssh into VM on one terminal

Layout would look something like this:
![alt text](/assets/images/image2.png "Layout 2")

### Add layout ###
After that, right click anywhere inside the window and choose preferences. Then in `Layouts` tab click add.

![alt text](/assets/images/layout-preferences.png "Layout Preferences")

You can name your layout respectively `mem_vm` and `ssh_vm`:

![alt text](/assets/images/layout-preferences1.png "Layout Preferences 1")

Now you can close your terminator completely. 

## Add custom commands inside of each terminal ##

To setup individual commands to be run at each window, you can do it in:

`~/.config/terminator/config` 

This is a terminator's config file. 
Now please open it in some text editor.
I use nano (don't get angry), but you can use any text editor you like. 
Even Vi/Vim if you know how to exit from it. 

I've been using Vim for about 2 years now, mostly because I can't figure out how to exit it, hahah. 
Sorry about thisjoke, I promise I didn't write it, I just saw it somewhere online.  Let's get back to the topic.

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

Then we will add command the following command:

`cd ~/Homestead/ && vagrant ssh`

For our `ssh_vm` layout, so find that section in, more precisely `terminal3`:

  `~/.config/terminator/config`

```
  [[ssh_vm]]
    [[[child0]]]
      fullscreen = False
      last_active_term = a6372ceb-969f-4f44-81ee-f187521ef64f
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
      position = 637
      ratio = 0.499609375
      type = HPaned
    [[[terminal2]]]
      order = 0
      parent = child1
      profile = default
      type = Terminal
      uuid = a6372ceb-969f-4f44-81ee-f187521ef64f
    [[[terminal3]]]
      command = "cd ~/Homestead/ && vagrant ssh"
      order = 1
      parent = child1
      profile = default
      type = Terminal
      uuid = 998615e7-1423-4118-8147-310eedf890ee

```

Once you exited the file and saved it, type in this command to execute the layout:

`terminator -l LAYOUT_NAME -p default`

Change the LAYOUT_NAME with the name of the layout you want to execute (`mem_vm` or `ssh_vm`).

## Wrap it up in command ##
You can wrap it in `.bashrc` as well:

`nano ~/.bashrc`
Add the following to the end of the file:

`alias mem_vm='terminator -l mem_vm -p default'`
`alias ssh_vm='terminator -l ssh_vm -p default'`

Save and exit and run this comand to apply changes:
`source ~/.bashrc`

and then just call commmands like this: 

`mem_vm `

Result:

![alt text](/assets/images/mem_vm_final.png "mem_vm")

and


`ssh_vm `

Result:

![alt text](/assets/images/ssh_vm_final.png "mem_vm")


## Conclusion ##

There you go. This is a useful tutorial if you want to do some memory monitoring or ssh into multiple servers at the same time.

Furthermore, if you find your self constatly manually running the same commands in exactly the same terminal layouts over and over again, then this is a good way to automate this process.

I have a rule, if I am going to do something frequently, on a daily basis, or even just more than once, then I'll automate it.

Just by running one command inside of your terminal you can open multiple terminals with pre-set commands running.
You can impress your boss, coworkers and your friends (actually I don't know how impressed they will be, because most of the people I know are not using Linux and wouldn't know how to appreaciate the full greatness of it and control it gives you. Unless you are a Linux snob and you only hang out with other Linux enthusiast and refuse to speak to anyone who doesn't know what `grep` or `vim` are). 

 Thank you for taking the time to read this tutorial. 
 I hope it was informative. 

 If you any questions or are in need of any help, comment bellow or feel free to contact me trough my email or my social media links (all are listed on the left side of this page).
